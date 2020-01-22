import React from 'react'; // Component,
import {
    BrowserRouter,
    Route,
    Switch,
} from 'react-router-dom';
import BldTimerPage from '../BldTimerPage';
import FaqPage from '../FaqPage';
import MemoTrainingTrialPage from '../MemoTrainingTrialPage';
import MemoTrainingMbldPage from '../MemoTrainingMbldPage';
import MemoTrainingCardsPage from '../MemoTrainingCardsPage';
import MemoTrainingResultPage from '../MemoTrainingResultPage';
const appPageUtils = require('../../../appPageUtils');
const config = require('../../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const routeDict = {
    bldSmartTimer: BldTimerPage,
    faq: FaqPage,
    memoTraining: {
        index: MemoTrainingTrialPage,
        cards: {
            // index:
            trial: MemoTrainingCardsPage,
            // result:
            // stats:
        },
        mbld: {
            // index:
            trial: MemoTrainingMbldPage,
            // result:
            // stats:
        },
        result: MemoTrainingResultPage,
    },
};

const flatRouteDict = appPageUtils.flattenRouteDict(routeDict);

// オプション(?以降)は考慮せずに比較
const pathname = `${location.protocol}//${location.host}${location.pathname}`;
if (!Object.keys(flatRouteDict).map(path => `${config.urlRoot}/${path}`).includes(pathname)) {
    location.href = `${config.urlRoot}/top.html`;
}

const AppPage = () => (
    <BrowserRouter>
        <div>
            <Switch>
                {
                    Object.keys(flatRouteDict).map((path, i) => {
                        const pathFromRoot = `/${urlRoot}/${path}`;
                        const component = flatRouteDict[path];
                        return <Route key={i} path={pathFromRoot} component={component} />;
                    })
                }
            </Switch>
        </div>
    </BrowserRouter>
);

export default AppPage;
