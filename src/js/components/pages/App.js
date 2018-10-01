import React from 'react'; // Component,
import {
    BrowserRouter,
    Route,
} from 'react-router-dom';
import Faq from './Faq';
const config = require('../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const App = () => (
    <BrowserRouter>
        <div>
            <Route path={`/${urlRoot}/faq.html`} component={Faq} />
        </div>
    </BrowserRouter>
);

export default App;
