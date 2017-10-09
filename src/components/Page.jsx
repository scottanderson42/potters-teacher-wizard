import React from 'react';

import DashboardContent from './dashboard/DashboardContent.jsx';
import DumbledoreContent from './dumbledore/DumbledoreContent.jsx';

import './Page.scss';

class Page extends React.Component {
  constructor(props) {
    super(props);

    this.handleDumbledore = this.handleDumbledore.bind(this);

    this.state = {
      isDumbledore: false
    };
  }

  handleDumbledore(e) {
    this.setState({ isDumbledore: !this.state.isDumbledore });
  }

  render() {
    let content;
    if (this.state.isDumbledore) {
      content = <DumbledoreContent onClickDumbledore={this.handleDumbledore} />;
    } else {
      content = <DashboardContent onClickDumbledore={this.handleDumbledore} />;
    }

    return (
      <div className="dashboard__page">
        {content}
      </div>
    )
  }
 }

export default Page;
