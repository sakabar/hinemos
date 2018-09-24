import React from 'react'; // Component,
import {
    BrowserRouter,
    Route,
} from 'react-router-dom';
import Faq from './Faq';
const config = require('../../config');
const dirs = config.urlRoot.split('/');
const urlRoot = dirs[dirs.length - 1];

const App = () => (
    <BrowserRouter>
        <div>
            <Route path={`/${urlRoot}/faq.html`} component={Faq} />
        </div>
    </BrowserRouter>
);

export default App;
