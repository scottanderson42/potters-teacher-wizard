import React from 'react';

import './DashboardContent.scss';

class DashboardContent extends React.Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.state = {
      input: 'POTTER TEACHER WIZARD!',
    };
  }
  handleInputChange(e) {
    this.setState({ input: e.target.value });
  }
  render() {
    return (
      <div className="content">
        <input
          type="text"
          value={this.state.input}
          onChange={this.handleInputChange}
        />
        <span>Hello {this.state.input}</span>
      </div>
    );
  }
}

export default DashboardContent;
