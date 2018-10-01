import React from 'react';
import {
    Link,
} from 'react-router-dom';
const config = require('../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const Header = () => (
    <header>
        <div className="header__bar">
            <ul>
                <li><Link to={`/${urlRoot}/faq.html`}>FAQ</Link></li>
                <li><a href="./signout.html">サインアウト</a></li>
            </ul>
        </div>

        <a href="./mypage.html"><img className="logo__img--rectangle" src="./tw_header.jpg?version=v1.3.5" alt="ロゴ" /></a>
    </header>
);

export default Header;
