import React from 'react';

import './DumbledoreContent.scss';

class DumbledoreContent extends React.Component {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);

    this.state = {
      input: 'POTTER TEACHER WIZZARD!',
    };
  }

  handleInputChange(e) {
    this.setState({ input: e.target.value });
  }

  render() {
    return (
      <div className="dumbledore-content__component">
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

export default DumbledoreContent;
