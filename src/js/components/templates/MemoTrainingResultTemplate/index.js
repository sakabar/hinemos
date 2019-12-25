import React from 'react';
// import {
//     Link,
// } from 'react-router-dom';
import Br from '../../atoms/Br';
// import Button from '../../atoms/Button';
import Txt from '../../atoms/Txt';
import Header from '../../organisms/Header';
import Select from '../../molecules/Select';
import SortableTbl from 'react-sort-search-table';
// const config = require('../../../config');
// const path = require('path');
const memoTrainingUtils = require('../../../memoTrainingUtils');
const _ = require('lodash');

// const urlRoot = path.basename(config.urlRoot);

const eventOptions = [
    [ 'mbld', 'MBLD', ],
    [ 'cards', 'Cards', ],
];

const trialOptions = [
    [ 'memorization', '記憶練習', ],
    [ 'transformation', '変換練習', ],
];

const MemoTrainingResultTemplate = () => (
    <div>
        <Header title="MemoTraining Result" />

        <main>
            <Select options={eventOptions} />
            <Br/>
            <Select options={trialOptions} />

            <Br/>

            {

                (() => {
                    const MyData = [
                        {
                            datetime: '2019/12/18 16:00',
                            successDeckNum: 19,
                            triedDeckNum: 25,
                            deckAcc: 0.76,
                            successElementNum: 450,
                            triedElementNum: 500,
                            elementAcc: 0.90,
                            memoTime: '40:20',
                            recallTime: '20:10',
                        },
                        {
                            datetime: '2019/12/18 18:00',
                            successDeckNum: 19,
                            triedDeckNum: 25,
                            deckAcc: 0.76,
                            successElementNum: 450,
                            triedElementNum: 500,
                            elementAcc: 0.90,
                            memoTime: '20:00',
                            recallTime: '10:00',
                        },
                    ];

                    const tHead = [
                        '日時',
                        '成功(束)',
                        '挑戦(束)',
                        '成功率(束)',
                        '成功(札)',
                        '挑戦(札)',
                        '成功率(束)',
                        '記憶時間',
                        '記憶時間',
                    ];

                    const col = [
                        'datetime',
                        'successDeckNum',
                        'triedDeckNum',
                        'deckAcc',
                        'successElementNum',
                        'triedElementNum',
                        'deckAcc',
                        'memoTime',
                        'recallTime',
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

export default MemoTrainingResultTemplate;
