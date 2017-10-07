from __future__ import unicode_literals

import boto3
import datetime
import json

WIZZARD_DESMESNE = 'potters_teacher_wizard'
WIZZARD_LOG = 'points_log'
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
    query = 'select * from {domain} {where} order by itemName() desc'.format(domain=WIZZARD_DESMESNE, where=where_clause)

    print 'QUERY', query
    response = client.select(
        SelectExpression=query,
        ConsistentRead=True,
    )
    print 'QUERY RESULTS', response

    for record in response.get('Items'):
        item = _convert_garbage_boto3_item_to_useful_dict(record)
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
    print 'EVENT', event
    current_week = _get_current_week()
    if not current_week:
        return {
            'error': 'The House Cup is not currently running.'
        }


def create_domains(event, context):
    """
    WARNING: THIS WILL ZERO OUT THE ENTIRE DATABASE.

    Creates the points and log domains.
    """
    client = boto3.client('sdb')
    response = client.create_domain(
        DomainName=WIZZARD_DESMESNE,
    )
    print 'POINTS CREATE RESPONSE', response

    response = client.delete_domain(
        DomainName=WIZZARD_LOG,
    )
    response = client.create_domain(
        DomainName=WIZZARD_LOG,
    )
    print 'LOG CREATE RESPONSE', response

    # Wow, this is a garbage syntax. Thanks, Amazon Boto3!
    items = [
        _convert_useful_dict_to_garbage_boto3_item(
            {house: '0' for house in WIZZARD_HOUSES},
            item_name=week,
            should_replace=True)
        for week in WIZZARD_WEEKS
    ]
    print 'ITEMS', items

    response = client.batch_put_attributes(
        DomainName=WIZZARD_DESMESNE,
        Items=items,
    )
    print 'PUT RESPONSE', response

    # For posterity's sake, here's what the above would look like in boto:
    # boto_client = boto.sdb.connect_to_region('us-east-1')
    # domain = boto_client.create_domain(WIZZARD_DESMESNE)
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
    }


def _convert_garbage_boto3_item_to_useful_dict(garbage):
    """
    Converts boto3's ridiculous list of dicts with Name and Value attributes into
    a dictionary.
    """
    item = {}
    for attribute in garbage.get('Attributes', []):
        item[attribute['Name']] = attribute['Value']
    return item


def _convert_useful_dict_to_garbage_boto3_item(item, item_name=None, should_replace=True):
    """
    Converts a dictionary into boto3's ridiculous list of dicts with Name and Value attributes.
    """
    garbage = {
        'Attributes': [
            {
                'Name': attribute,
                'Value': value,
                'Replace': should_replace,
            } for (attribute, value) in item.iteritems()
        ]
    }

    if item_name:
        garbage['Name'] = item_name

    return garbage
