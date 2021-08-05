import React from 'react';
import {
    Link,
} from 'react-router-dom';
import Br from '../../atoms/Br';
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
                <li>練習</li>
                <ul>
                    <li><Link to={`/${urlRoot}/memoTraining/mbld/trial.html`}>MBLD</Link></li>
                    <li><Link to={`/${urlRoot}/memoTraining/cards/trial.html`}>Cards</Link></li>
                    <li><Link to={`/${urlRoot}/memoTraining/numbers/trial.html`}>Numbers</Link></li>
                </ul>

                <li>結果確認</li>
                <ul>
                    <Link to={`/${urlRoot}/memoTraining/result.html`}>試技ごと</Link><Br/>
                    <Link to={`/${urlRoot}/memoTraining/stats.html`}>統計情報</Link><Br/>
                </ul>
            </ul>
        </main>
    </div>
);

export default MemoTrainingTemplate;
