import React from 'react'; // Component,
import {
    BrowserRouter,
    Route,
} from 'react-router-dom';
import BldTimerPage from '../BldTimerPage';
import FaqPage from '../FaqPage';
import SamplePage from '../SamplePage';
const config = require('../../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const AppPage = () => (
    <BrowserRouter>
        <div>
            <Route path={`/${urlRoot}/bldTimer.html`} component={BldTimerPage} />
            <Route path={`/${urlRoot}/faq.html`} component={FaqPage} />
            <Route path={`/${urlRoot}/sample.html`} component={SamplePage} />
        </div>
    </BrowserRouter>
);

export default AppPage;
