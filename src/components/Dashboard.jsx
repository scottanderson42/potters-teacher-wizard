import React from 'react';

import Header from './Header.jsx';
import DashboardContent from './DashboardContent.jsx';
import Footer from './Footer.jsx';

import './Dashboard.scss';

function Dashboard() {
  return (
    <div className="dashboard__page">
      <Header />
      <DashboardContent />
      <Footer />
    </div>
  );
}

export default Dashboard;
