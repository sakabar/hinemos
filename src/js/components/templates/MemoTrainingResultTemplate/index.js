import React from 'react';
import PropTypes from 'prop-types';
import {
    Link,
} from 'react-router-dom';
import Br from '../../atoms/Br';
// import Button from '../../atoms/Button';
// import Txt from '../../atoms/Txt';
import Header from '../../organisms/Header';
import Select from '../../molecules/Select';
import SortableTbl from 'react-sort-search-table';
const config = require('../../../config');
const path = require('path');
const memoTrainingUtils = require('../../../memoTrainingUtils');
const _ = require('lodash');
const moment = require('moment');

const urlRoot = path.basename(config.urlRoot);

const eventOptions = [
    [ 'mbld', 'MBLD', ],
    [ 'cards', 'Cards', ],
];

const modeOptions = [
    [ '', '', ],
    [ 'memorization', '記憶練習', ],
    [ 'transformation', '変換練習', ],
];

const formatAcc = (n, d, acc) => {
    if (n === null || acc === null) {
        return `${d}`;
    }

    return `${n}/${d} (${Math.floor(acc * 100)}%)`;
};

const formatTime = (sec) => {
    if (sec === null) {
        return '';
    }

    const hour = String(Math.floor(sec / 3600.0)).padStart(2, '0');
    const minute = String(Math.floor((sec - 3600 * hour) / 60.0)).padStart(2, '0');
    const remainSec = String(Math.floor(sec - 3600 * hour - 60 * minute)).padStart(2, '0');

    return `${hour}:${minute}:${remainSec}`;
};

const MemoTrainingResultTemplate = (
    {
        event,
        mode,
        scores,

        sagaFetchScores,
    }
) => (
    <div>
        <Header title="MemoTraining Result" />

        <main>
            <Link to={`/${urlRoot}/memoTraining/index.html`}>記憶トレーニング トップ</Link>
            <Br/>

            <Select options={eventOptions} defaultValue={eventOptions[0][0]} onChange={(e) => { sagaFetchScores(e.target.value, mode); }}/>
            <Br/>
            <Select options={modeOptions} defaultValue={modeOptions[0][0]} onChange={(e) => { sagaFetchScores(event, e.target.value); }}/>

            <Br/>

            {

                (() => {
                    const MyData = scores.map(score => {
                        return {
                            createdAt: moment(score.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                            totalMemoTime: formatTime(score.totalMemoSec),
                            totalRecallTime: formatTime(score.totalRecallSec),

                            triedDecks: formatAcc(score.successDeckNum, score.triedDeckNum, score.triedDeckAcc),
                            allDecks: formatAcc(score.successDeckNum, score.allDeckNum, score.allDeckAcc),

                            triedElements: formatAcc(score.successElementNum, score.triedElementNum, score.triedElementAcc),
                            allElements: formatAcc(score.successElementNum, score.allElementNum, score.allElementAcc),
                        };
                    });

                    const tHead = [
                        '日時',
                        '記憶時間',
                        '回答時間',

                        '挑戦(束)',
                        '全体(束)',

                        '挑戦(札)',
                        '全体(札)',
                    ];

                    const col = [
                        'createdAt',
                        'totalMemoTime',
                        'totalRecallTime',

                        'triedDecks',
                        'allDecks',

                        'triedElements',
                        'allElements',
                    ];

                    return (<SortableTbl tblData={MyData}
                        tHead={tHead}
                        customTd={[]}
                        dKey={col}
                        search={true}
                        defaultCSS={true}
                    />);
                })()
            }

            {
                (() => {
                    const deckNum = 2;
                    const deckSize = 52;
                    const pairSize = 2;

                    const decks = memoTrainingUtils.generateCardsDecks(deckNum, deckSize, pairSize);

                    const MyData = [];

                    let ind = 1;
                    for (let deckInd = 0; deckInd < deckNum; deckInd++) {
                        const deck = decks[deckInd];
                        for (let pairInd = 0; pairInd < deck.length; pairInd++) {
                            const pair = deck[pairInd];
                            for (let posInd = 0; posInd < pair.length; posInd++) {
                                const element = pair[posInd];

                                const data = {
                                    ind,
                                    deckInd: deckInd + 1,
                                    pairInd: pairInd + 1,
                                    posInd: posInd + 1,
                                    tag: `${element.tag} (${memoTrainingUtils.cardTagToMarkStr(element.tag)})`,
                                    memoSec: _.random(0.5, 3.5).toFixed(2),
                                    memoLosingSec: _.random(1, 100.5).toFixed(2),
                                    isCorrect: [ 'O', 'X', ][_.random(0, 1)],
                                };
                                MyData.push(data);
                                ind += 1;
                            }
                        }
                    }
                    const tmp = MyData.map(data => {
                        return {
                            ind: data.ind,
                            memoSec: data.memoSec,
                        };
                    });

                    const secOrder = _.sortBy(tmp, [ (o) => {
                        return o.memoSec;
                    }, ]);
                    const dicc = {};
                    for (let speedInd = 0; speedInd < secOrder.length; speedInd++) {
                        const ind = secOrder[speedInd].ind;
                        dicc[ind] = speedInd;
                    }

                    for (let i = 0; i < MyData.length; i++) {
                        let data = MyData[i];
                        data.speedInd = dicc[data.ind] + 1;
                    }

                    const tHead = [
                        '出てきた順',
                        '速い順',
                        '束',
                        '組',
                        '位置',
                        'element',
                        '記憶時間',
                        '忘却時間',
                        '正解?',
                    ];

                    const col = [
                        'ind',
                        'speedInd',
                        'deckInd',
                        'pairInd',
                        'posInd',
                        'tag',
                        'memoSec',
                        'memoLosingSec',
                        'isCorrect',
                    ];

                    return (<SortableTbl tblData={MyData}
                        tHead={tHead}
                        customTd={[]}
                        dKey={col}
                        search={true}
                        defaultCSS={true}
                    />);
                })()
            }

        </main>

    </div>
);

MemoTrainingResultTemplate.propTypes = {
    event: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    scores: PropTypes.array.isRequired,

    sagaFetchScores: PropTypes.func.isRequired,
};

export default MemoTrainingResultTemplate;
