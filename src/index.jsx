import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import Dashboard from './components/Dashboard.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';

function renderApp() {
  ReactDOM.render(
    <AppContainer>
      <Dashboard />
    </AppContainer>,
    document.getElementById('main')
  );
}

renderApp();

if (module.hot) {
  module.hot.accept('./components/Dashboard.jsx', renderApp);
}
