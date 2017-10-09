import React from 'react';
import PointsForm from './PointsForm.jsx'

import './DumbledoreContent.scss';

class DumbledoreContent extends React.Component {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);

    this.state = {
      input: 'POTTER TEACHER WIZZARD',
    };
  }

  handleInputChange(e) {
    this.setState({ input: e.target.value });
  }

  render() {
    return (
      <div className="dumbledore-content__component">
        <button className="dumbledore-content--dashboard-button" onClick={this.props.onClickDumbledore} title="RETURN TO DASHBOARD"></button>
        <span>Welcome, {this.state.input}.</span>
        <PointsForm/>
      </div>
    );
  }
}

export default DumbledoreContent;
