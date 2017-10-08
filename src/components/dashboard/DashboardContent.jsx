import React from 'react';

import './DashboardContent.scss';

class DashboardContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      thing: 'POTTER TEACHER WIZZARD!',
    };
  }

  render() {
    return (
      <div className="dashboard-content__component">
        <span>Hello {this.state.thing}</span>
        <button onClick={this.props.onClickDumbledore}>BECOME DUMBLEDORE</button>
      </div>
    );
  }

}

export default DashboardContent;
