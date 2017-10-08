import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import Page from './components/Page.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';

function renderApp() {
  ReactDOM.render(
    <AppContainer>
      <Page />
    </AppContainer>,
    document.getElementById('main')
  );
}

renderApp();

if (module.hot) {
  module.hot.accept('./Page.jsx', renderApp);
}
