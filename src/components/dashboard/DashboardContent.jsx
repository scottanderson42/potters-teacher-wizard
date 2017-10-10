import _ from 'lodash';
import API from '../../api';
import Faye from 'faye'
import React from 'react';
import ExpectoCaponigro from './ExpectoCaponigro';

// Assets
import './DashboardContent.scss';
import gryffindorCrest from '../../assets/gryffindor.png';
import hufflepuffCrest from '../../assets/hufflepuff.png';
import ravenclawCrest from '../../assets/ravenclaw.png';
import slytherinCrest from '../../assets/slytherin.png';

const CREST_URLS = {
  gryffindor: gryffindorCrest,
  hufflepuff: hufflepuffCrest,
  ravenclaw: ravenclawCrest,
  slytherin: slytherinCrest,
}

function HousePointsComponent(props) {
  const className = "col-sm-3 house-points__component -" + props.houseName;

  return (
    <div className={className}>
      <div className="house-points--house-name">{props.houseName}</div>
      <div className="house-points--crest"><img onClick={props.onClickCrest} src={CREST_URLS[props.houseName]} /></div>
      <div className="house-points--points">{props.points}</div>
    </div>
  );
}

class PointsGroup extends React.Component {
  _getWinningHouseName(points) {
    // Turn the points into a list of tuples: [house, points]
    const prospectives = Object.entries(points);
    if (prospectives.length < 1) {
      return '';
    }

    // Sort the list by the points portion of each tuple.
    prospectives.sort(function(a, b) {
      return b[1] - a[1];
    });

    // If the first two records have the same number of points, no current winner.
    if (prospectives[0][1] === prospectives[1][1]) {
      return '';
    }

    // Return the house name of the first record as the winner.
    return prospectives[0][0];
  }

  _onClickCrest(house) {
    // const api = new API();
    // api.addPoints(house, 5, 'For craft.')
    //    .then((results)=> {
    //      console.log('CLICK CREST RESULTS', results);
    // })
  }

  render() {
    console.log('POINTS', this.props.points);
    const winningHouseName = this._getWinningHouseName(this.props.points);
    const winnerClass = winningHouseName ? ` -is-${winningHouseName}-winning` : '';
    const winningClassName = `points-group__component container-fluid ${winnerClass}`;

    return (
      <div className={winningClassName}>
        <div className="row">
          <div className="col-sm-12 dashboard-content--current-week-title">{this.props.title}</div>
        </div>
        <div className="row dashboard-content--current-week">
          <HousePointsComponent
              houseName="gryffindor"
              points={this.props.points.gryffindor || '-'}
              onClickCrest={this._onClickCrest.bind(null, 'gryffindor')}
          />
          <HousePointsComponent
              houseName="hufflepuff"
              points={this.props.points.hufflepuff || '-'}
              onClickCrest={this._onClickCrest.bind(null, 'hufflepuff')}
          />
          <HousePointsComponent
              houseName="ravenclaw"
              points={this.props.points.ravenclaw || '-'}
              onClickCrest={this._onClickCrest.bind(null, 'ravenclaw')}
          />
          <HousePointsComponent
              houseName="slytherin"
              points={this.props.points.slytherin || '-'}
              onClickCrest={this._onClickCrest.bind(null, 'slytherin')}
          />
        </div>
      </div>
    )
  }
}

PointsGroup.defaultProps = {
  points: {},
  title: '',
};


class DashboardContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentWeek: null,
      points: {},
      totals: {},
      weekData: {},
      winningHouseName: '',
    };

    const fanoutEndpoint = '//25943397.fanoutcdn.com/bayeux';
    this.fayeClient = new Faye.Client(fanoutEndpoint);
    this.fayeSubscription = this.fayeClient.subscribe('/ptw/add_points', this._remoteAddPoints.bind(this));

    this.capo = new ExpectoCaponigro();
  }

  componentWillMount() {
    this._getCurrentStandings();
  }

  _remoteAddPoints(jsonData) {
    const {house, points, reason} = JSON.parse(jsonData);
    console.log('ADD POINTS', house, points, reason);
    this.capo.addPoints(house, points);
    this._getCurrentStandings();
  }

  _getCurrentStandings() {
    const api = new API();
    console.log('GETTING POINTS');
    api.getPoints()
       .then((results)=> {
         console.log('GET_POINTS', results);

         const currentPoints = results.week_data[results.current_week];

         this.setState({
           currentWeek: results.current_week,
           points: currentPoints,
           totals: results.totals,
           weekData: results.week_data,
         });
       });
  }

  render() {
    // Extract the week number from the week name.
    const weekNumber = this.state.currentWeek ? this.state.currentWeek[4] : '...';

    return (
      <div className="dashboard-content__component">
        <PointsGroup title={`Week ${weekNumber}`} points={this.state.points} />
        <PointsGroup title={`Totals`} points={this.state.totals} />
        <button className="dashboard-content--dumbledore-button" onClick={this.props.onClickDumbledore} title="BECOME DUMBLEDORE"></button>
      </div>
    );
  }

}

export default DashboardContent;
