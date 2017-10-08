from __future__ import unicode_literals

import boto3
import botocore
import calendar
import copy
import datetime
import json
import os
import uuid

WIZZARD_POINTS_DESMESNE = 'potters_teacher_wizard'
WIZZARD_LOG_DESMESNE = 'points_log'
WIZZARD_HOUSES = [
    'gryffindor',
    'hufflepuff',
    'ravenclaw',
    'slytherin',
]

WIZZARD_WEEKS = ['week{}'.format(week) for week in range(1, 5)]

# This does a thing with numbers. See below.
WIZZARD_DAY_RANGES = {'week{}'.format(a + 1): (a * 7 + 1, a * 7 + 7) for a in range(4)}


def get_points(event, context):
    client = boto3.client('sdb')

    week_data = {}
    totals = {}

    current_week = _get_current_week()

    # Insert the week into the where clause if we are still in progress, otherwise just grab all the records.
    where_clause = 'where itemName() <= "{}"'.format(current_week) if current_week else ''
    query = 'select * from {domain} {where} order by itemName() desc'.format(domain=WIZZARD_POINTS_DESMESNE, where=where_clause)

    print 'QUERY', query
    response = client.select(
        SelectExpression=query,
        ConsistentRead=True,
    )
    print 'QUERY RESULTS', response

    for record in response.get('Items'):
        item = _convert_garbage_boto3_to_useful_dict(record)
        week_data[record['Name']] = item
        print 'ITEM', item
        for house in WIZZARD_HOUSES:
            totals[house] = int(totals.get(house, 0)) + int(item.get(house, 0))

    print 'RESULTS', week_data, totals

    return _create_proxy_response({
        'current_week': current_week,
        'week_data': week_data,
        'totals': totals,
    })


def add_points(event, context):
    """
    Add points to a house for the current week, and log that points were added.

    Input format:
        {
          "body": "{\"house\": \"gryffindor\",\"points\": 50,\"reason\": \"For the awesome\"}"
        }
    Note that the API gateway will automatically JSON-ize the body.
    """
    print 'EVENT', event

    client = boto3.client('sdb')

    current_week = _get_current_week()
    if not current_week:
        return _create_proxy_error_response('The House Cup is not currently running.')

    # Get the request attributes.
    body_text = event['body']
    print 'BODY TEXT', body_text
    body = json.loads(body_text)
    print 'BODY', body

    house = body['house'].lower()
    if house not in WIZZARD_HOUSES:
        return _create_proxy_error_response('Invalid house name: {}'.format(house))

    points = body['points']
    reason = body.get('reason', 'No reason supplied.')

    # Log the points for tracking.
    log = copy.deepcopy(body)
    log['points'] = log['points']
    log['timestamp'] = calendar.timegm(datetime.datetime.now().timetuple())
    log_id = str(uuid.uuid4())

    # Convert our wonderful, useful dict back into a boto3 format.
    log_record = _convert_useful_dict_to_garbage_boto3(log, should_replace=False)
    log_record.update({
        'DomainName': WIZZARD_LOG_DESMESNE,
        'ItemName': log_id,
    })
    response = client.put_attributes(**log_record)
    print 'LOG RESPONSE', response

    new_points = None
    retry_count = 5
    while new_points is None and retry_count > 0:
        new_points = _increment_points(client, current_week, house, points)
        print '    NEW POINTS', new_points, 'RETRY', retry_count
        retry_count -= 1

    _setup_fanout()
    _publish_fanout('ptw/add_points', {
        'house': house,
        'points': points,
    })

    print 'INCREMENT SUCCESSFUL', new_points
    if new_points is None:
        return _create_proxy_error_response('Points were logged but not added to the total.')

    return _create_proxy_response({
        'points': new_points,
        'house': house,
        'reason': reason,
    })


def _increment_points(client, current_week, house, points):
    """
    Perform an optimistic increment of the house points. If the current value
    of the points has been changed between the read and the write, this will
    fail and need to be retried.
    """

    # Get the current number of points for the house in question from the DB.
    points_item = _convert_garbage_boto3_to_useful_dict(client.get_attributes(
        DomainName=WIZZARD_POINTS_DESMESNE,
        ItemName=current_week,
        AttributeNames=[house],
        ConsistentRead=True,
    ))
    # Save the current points as we'll need them to do a consistent write.
    previous_points = points_item[house]
    print 'PREVIOUS_POINTS', previous_points
    # All SimpleDB values are strings, so convert it before incrementing.
    current_points = int(previous_points) + points
    points_item[house] = current_points
    print 'NEW_POINTS', current_points
    # Convert our wonderful, useful dict back into a boto3 format.
    points_record = _convert_useful_dict_to_garbage_boto3(points_item, should_replace=True)
    points_record.update({
        'DomainName': WIZZARD_POINTS_DESMESNE,
        'ItemName': current_week,
        'Expected': {
            'Name': house,
            'Value': previous_points,
            # This will cause the update to fail if someone else has changed the point value in between.
            'Exists': True,
        }
    })
    try:
        response = client.put_attributes(**points_record)
        if response.get('ResponseMetadata', {}).get('HTTPStatusCode') == 200:
            return current_points
        else:
            return None
    except botocore.exceptions.ClientError as e:
        print 'ClientError', e, e.response
        # Check failed means the value changed while we were updating it.
        if e.response.get('Error', {}).get('Code') == 'ConditionalCheckFailed':
            return None
        # Otherwise it's just an error so raise it again.
        raise e


def get_logs(event, context):
    client = boto3.client('sdb')

    # 'where timestamp > 0' is necessary to include a sort clause with SimpleDB. The
    # sort predicate must be included in the where clause in some fashion.
    query = 'select * from {domain} where timestamp is not null order by timestamp desc'.format(domain=WIZZARD_LOG_DESMESNE)

    print 'QUERY', query
    response = client.select(
        SelectExpression=query,
        ConsistentRead=True,
    )
    print 'QUERY RESULTS', response

    return _create_proxy_response([_convert_garbage_boto3_to_useful_dict(record) for record in response.get('Items')])


def create_domains(event, context):
    """
    WARNING: THIS WILL ZERO OUT THE ENTIRE DATABASE.

    Creates the points and log domains.
    """
    client = boto3.client('sdb')
    response = client.create_domain(
        DomainName=WIZZARD_POINTS_DESMESNE,
    )
    print 'POINTS CREATE RESPONSE', response

    response = client.delete_domain(
        DomainName=WIZZARD_LOG_DESMESNE,
    )
    response = client.create_domain(
        DomainName=WIZZARD_LOG_DESMESNE,
    )
    print 'LOG CREATE RESPONSE', response

    # Wow, this is a garbage syntax. Thanks, Amazon Boto3!
    items = [
        _convert_useful_dict_to_garbage_boto3(
            {house: '0' for house in WIZZARD_HOUSES},
            item_name=week,
            should_replace=True)
        for week in WIZZARD_WEEKS
    ]
    print 'ITEMS', items

    response = client.batch_put_attributes(
        DomainName=WIZZARD_POINTS_DESMESNE,
        Items=items,
    )
    print 'PUT RESPONSE', response

    # For posterity's sake, here's what the above would look like in boto:
    # boto_client = boto.sdb.connect_to_region('us-east-1')
    # domain = boto_client.create_domain(WIZZARD_POINTS_DESMESNE)
    # response = domain.batch_put_attributes(
    #     {
    #         week: {
    #             house: 0 for house in WIZZARD_HOUSES
    #         } for week in WIZZARD_WEEKS
    #     }
    # )


def _get_current_week():
    """
    Returns the name of the current week, or None if the House Cup is not currently running.
    """
    day_of_month = datetime.datetime.today().day
    for (week_name, (start_day, end_day)) in WIZZARD_DAY_RANGES.iteritems():
        if start_day <= day_of_month <= end_day:
            return week_name

    return None


def _create_proxy_response(body, status_code=200):
    """
    Creates a response suitable for integration with Amazon API Gateway.
    """
    return {
        "isBase64Encoded": False,
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            "Access-Control-Allow-Origin": "*"
        }
    }


def _create_proxy_error_response(error_message, status_code=400):
    return _create_proxy_response(
        body={'errorMessage': error_message},
        status_code=status_code,
    )


def _convert_garbage_boto3_to_useful_dict(garbage):
    """
    Converts boto3's ridiculous list of dicts with Name and Value attributes into
    a dictionary.
    """
    item = {}
    for attribute in garbage.get('Attributes', []):
        item[attribute['Name']] = attribute['Value']
    return item


def _convert_useful_dict_to_garbage_boto3(item, item_name=None, should_replace=True):
    """
    Converts a dictionary into boto3's ridiculous list of dicts with Name and Value attributes.
    """
    garbage = {
        'Attributes': [
            {
                'Name': attribute,
                'Value': str(value),
                'Replace': should_replace,
            } for (attribute, value) in item.iteritems()
        ]
    }

    if item_name:
        garbage['Name'] = item_name

    return garbage


def _setup_fanout():
    import fanout
    # These are set in the environment of the Lambda function, so it's safe!
    fanout.realm = os.environ['FANOUT_REALM_ID']
    fanout.key = os.environ['FANOUT_REALM_KEY']
    print 'SETUP FANOUT', fanout.realm


def _publish_fanout(channel, message):
    import fanout
    if channel[0] == '/':
        channel = channel[1:]
    print 'FANOUT PUBLISH', channel, message
    fanout.publish(channel, json.dumps(message), blocking=True, callback=lambda result, message: _fanout_callback(result, message, channel))


def _fanout_callback(result, message, channel):
    if result:
        print '\tPublish successful on channel', channel
    else:
        print '\tPublish error on channel', channel, 'with message', message[:20]
