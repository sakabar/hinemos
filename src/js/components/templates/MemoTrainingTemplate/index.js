import React from 'react';
import {
    Link,
} from 'react-router-dom';
import Header from '../../organisms/Header';
const config = require('../../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

// const events = [
//     [ 'hiragana', 'MBLD', ],
//     [ 'alphabet', 'MBLD (英)', ],
//     [ 'card', 'カード', ],
//     [ 'number', '数字', ],
//     [ 'japanese', '単語(日本語)'],
//     [ 'english', '単語(英語)'],
// ];

const MemoTrainingTemplate = () => (
    <div>
        <Header title="MemoTraining" />

        <main>
            <ul>
                <li><Link to={`/${urlRoot}/memoTraining/mbld/trial.html`}>MBLD</Link></li>
                <li><Link to={`/${urlRoot}/memoTraining/cards/trial.html`}>Cards</Link></li>
            </ul>
        <Link to={`/${urlRoot}/memoTraining/result.html`}>結果ページへ</Link>
        </main>
    </div>
);

export default MemoTrainingTemplate;
