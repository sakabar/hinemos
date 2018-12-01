import React from 'react'; // Component,
import {
    BrowserRouter,
    Route,
    Switch,
} from 'react-router-dom';
import BldTimerPage from '../BldTimerPage';
import FaqPage from '../FaqPage';
const config = require('../../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const routeDict = {
    bldSmartTimer: BldTimerPage,
    faq: FaqPage,
};
const routeKeys = Object.keys(routeDict);

if (!routeKeys.map(p => `${config.urlRoot}/${p}.html`).includes(location.href)) {
    location.href = `${config.urlRoot}/top.html`;
}

const AppPage = () => (
    <BrowserRouter>
        <div>
            <Switch>
                {
                    routeKeys.map((p, i) => {
                        const path = `/${urlRoot}/${p}.html`;
                        const component = routeDict[p];
                        return <Route key={i} path={path} component={component} />
                    })
                }
            </Switch>
        </div>
    </BrowserRouter>
);

export default AppPage;
