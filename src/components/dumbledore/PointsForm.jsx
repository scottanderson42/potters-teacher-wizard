import React from 'react';
import API from '../../api';

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

function HouseSelectionComponent(props) {
  const className = 'col-sm-3 house-selection-button -' + props.house;

  return (
    <div className = {className}>
      <div className={'crest ' + (props.isSelected ? '-is-selected' : '')}><img onClick={props.onClick} src={CREST_URLS[props.house]}/></div>
      <div className='house-name'>{props.house}</div>
    </div>
  );
}

class PointsFormComponent extends React.Component {
  constructor(props) {
    super(props);

    this._onPointChange = this._onPointChange.bind(this);
    this._onNoteChange = this._onNoteChange.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    
    this.state = {
      note: 'Note for the award...',
      pointsToAlter: 0,
      houseToAlter: 'gryffindor', 
    };
  }

  _onClickHouse(house) {
    this.setState({ houseToAlter: house });
    this.props.onClickDumbledore;
  }

  _onNoteChange(e) {
    try{
      this.setState({ note: e.target.value });
    } 
    finally{}
  }

  _onPointChange(e) {
    try {
      if (e.target.value === ''){
        this.setState({pointsToAlter: 0 });
      } else {
        this.setState({ pointsToAlter: parseInt(e.target.value) });
      }
    }
    finally {}
  }

  _onSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    const api = new API();
    api.addPoints(
      this.state.houseToAlter, 
      this.state.pointsToAlter, 
      this.state.note
      ).then((results)=> {
         console.log('ALTER POINTS RESULTS', results);
       })
  }


  render () {
    return (
      <div className='dumbledore-point-form__component'>
        <h4>Enter value below and select appropriate house </h4>
        <br/>
        <form onSubmit = {this._onSubmit}>
          <label className='row notes form-field'>
            <input 
              name = 'noteForAlter' 
              placeholder = {this.state.note}
              type = 'text' 
              onChange = {this._onNoteChange}
            />
          </label>
          <br/>
          <label className='row points form-field'>
            <input 
              name = 'pointsToAlter' 
              placeholder = {this.state.pointsToAlter}
              type = 'number' 
              onChange = {this._onPointChange}
            />
          </label>
          <div className="row house-selection">
            <HouseSelectionComponent
              house='gryffindor'
              isSelected={'gryffindor' === this.state.houseToAlter}
              onClick={this._onClickHouse.bind(this, 'gryffindor')}
            />
            <HouseSelectionComponent
              house='hufflepuff'
              isSelected={'hufflepuff' === this.state.houseToAlter}
              onClick={this._onClickHouse.bind(this, 'hufflepuff')}
            />
            <HouseSelectionComponent
              house='ravenclaw'
              isSelected={'ravenclaw' === this.state.houseToAlter}
              onClick={this._onClickHouse.bind(this, 'ravenclaw')}
            />
            <HouseSelectionComponent
              house='slytherin'
              isSelected={'slytherin' === this.state.houseToAlter}
              onClick={this._onClickHouse.bind(this, 'slytherin')}
            />
          </div>
          <br/>
          <button className='point-form__submit' type="submit">Award Points</button>
        </form>
      </div>
    )
  }
}

export default PointsFormComponent;