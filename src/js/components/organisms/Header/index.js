import React from 'react';
import {
    Link,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import Heading1 from '../../atoms/Heading1';
const config = require('../../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const Header = ({ title, }) => (
    <header>
        <div className="header__bar">
            <ul>
                <li><Link to={`/${urlRoot}/faq.html`}>FAQ</Link></li>
                <li><a href={`/${urlRoot}/signout.html`}>サインアウト</a></li>
            </ul>
        </div>

        <a href={`/${urlRoot}/mypage.html`}><img className="logo__img--rectangle" src={`/${urlRoot}/tw_header.jpg`} alt="ロゴ" /></a>
        <Heading1>{title}</Heading1>
    </header>
);

Header.propTypes = {
    title: PropTypes.string,
};

export default Header;
