import React from 'react'; // Component,
import {
    BrowserRouter,
    Route,
} from 'react-router-dom';
import BldTimerPage from '../BldTimerPage';
import FaqPage from '../FaqPage';
const config = require('../../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const AppPage = () => (
    <BrowserRouter>
        <div>
            <Route path={`/${urlRoot}/faq.html`} component={FaqPage} />
            <Route path={`/${urlRoot}/bldTimer.html`} component={BldTimerPage} />
        </div>
    </BrowserRouter>
);

export default AppPage;
