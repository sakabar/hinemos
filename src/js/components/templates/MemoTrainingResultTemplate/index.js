import React from 'react';
import PropTypes from 'prop-types';
import {
    Link,
} from 'react-router-dom';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Txt from '../../atoms/Txt';
import Header from '../../organisms/Header';
import Select from '../../molecules/Select';
import DecideTrialButtonTdFactory from '../../molecules/DecideTrialButtonTd';
import SortableTbl from 'react-sort-search-table';
const config = require('../../../config');
const path = require('path');
const memoTrainingUtils = require('../../../memoTrainingUtils');
const _ = require('lodash');
const moment = require('moment');

const urlRoot = path.basename(config.urlRoot);

const eventOptions = [
    [ '', '種目', ],
    [ 'mbld', 'MBLD', ],
    [ 'cards', 'Cards', ],
];

const modeOptions = [
    [ '', 'モード', ],
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
        memoLogs,
        recallLogs,
        trialId,

        sagaFetchScores,
        decideTrial,
    }
) => (
    <div>
        <Header title="MemoTraining Result" />

        <main>
            <Link to={`/${urlRoot}/memoTraining/index.html`}>記憶トレーニング トップ</Link>
            <Br/>
            <div>
                <Select options={eventOptions} defaultValue={eventOptions[0][0]} onChange={(e) => { sagaFetchScores(e.target.value, mode); }}/>
                <Br/>
                <Select options={modeOptions} defaultValue={modeOptions[0][0]} onChange={(e) => { sagaFetchScores(event, e.target.value); }}/>
                <Br/>
                <Button value="リロード" onClick={(e) => { sagaFetchScores(event, mode); }}/>
            </div>

            <Br/>

            {

                (() => {
                    const MyData = scores.map(score => {
                        return {
                            createdAt: moment(score.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                            trialId: score.trialId,
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
                        '',
                    ];

                    const col = [
                        'createdAt',
                        'totalMemoTime',
                        'totalRecallTime',

                        'triedDecks',
                        'allDecks',

                        'triedElements',
                        'allElements',

                        'decideTrial',
                    ];

                    return (
                        <div>
                            <h2>全体の結果</h2>
                            <SortableTbl tblData={MyData}
                                tHead={tHead}
                                customTd={[
                                    { custd: DecideTrialButtonTdFactory(decideTrial), keyItem: 'decideTrial', },
                                ]}
                                dKey={col}
                                search={true}
                                defaultCSS={true}
                            />
                        </div>
                    );
                })()
            }

            {
                (() => {
                    const MyData = (() => {
                        if (!trialId) {
                            return [];
                        }

                        // FIXME ここをcamlCaseにする方法を求む
                        // FIXME 結果をelementごとにaggする
                        const tmpMyData = memoLogs
                            .filter(log => log['memo_trial_deck'].trialId === trialId)
                            .map(log => {
                                return {
                                    ind: log.ind,
                                    deckInd: log.deckInd,
                                    pairInd: log.pairInd,
                                    posInd: log.posInd,
                                    tag: log['memo_element'].tag,
                                    memoSec: log.memoSec,
                                };
                            });

                        // select keys, sum(memoSec) as memoSec group by keys する
                        const grouped = _.groupBy(tmpMyData, (log) => {
                            const key = {
                                deckInd: log.deckInd,
                                pairInd: log.pairInd,
                                posInd: log.posInd,
                                tag: log.tag,
                            };
                            return JSON.stringify(key);
                        });

                        const agged = Object.values(grouped).map(group => {
                            const memoSec = _.sum(group.map(log => log.memoSec));
                            const reviewCnt = group.length - 1;

                            return {
                                ind: undefined,
                                reviewCnt,
                                deckInd: group[0].deckInd,
                                pairInd: group[0].pairInd,
                                posInd: group[0].posInd,
                                tag: group[0].tag,
                                memoSec,
                            };
                        });

                        // indでソートした後、indを振り直す
                        const groupedMyData = _.sortBy(agged, [ (o) => {
                            return o.ind;
                        }, ]).map((log, ind) => {
                            return {
                                ...log,
                                ind,
                            };
                        });

                        // memoLosingSecとisCorrentを付与
                        const MyData = groupedMyData.map(log => {
                            return {
                                ...log,
                                // memoLosingSec: _.random(1, 100.5).toFixed(2),
                                memoLosingSec: 0.0,
                                // isCorrect: [ 'O', 'X', ][_.random(0, 1)],
                                isCorrect: undefined,
                            };
                        });

                        const tmp = MyData.map(data => {
                            return {
                                ind: data.ind,
                                memoSec: data.memoSec,
                            };
                        });

                        const secOrder = _.sortBy(tmp, [ (o) => {
                            return -o.memoSec;
                        }, ]);
                        const indToSpeedIndDict = {};
                        for (let speedInd = 0; speedInd < secOrder.length; speedInd++) {
                            const ind = secOrder[speedInd].ind;
                            indToSpeedIndDict[ind] = speedInd;
                        }

                        for (let i = 0; i < MyData.length; i++) {
                            MyData[i].speedInd = indToSpeedIndDict[MyData[i].ind];
                        }

                        // やっぱり、デフォルトは出てきた順ではなく遅い順とする
                        const slowOrder = _.sortBy(MyData, [ (o) => {
                            return o.speedInd;
                        }, ]);

                        return slowOrder;
                    })();

                    const meanMemoSec = _.meanBy(MyData, 'memoSec');
                    const sd = Math.sqrt(_.mean(MyData.map(data => (data.memoSec - meanMemoSec) * (data.memoSec - meanMemoSec))));

                    const showData = MyData.map(log => {
                        return {
                            ...log,

                            ind: log.ind + 1,
                            speedInd: log.speedInd + 1,
                            deckInd: `deck=${log.deckInd + 1}`,
                            pairInd: `pair=${log.pairInd + 1}`,
                            posInd: `pos=${log.posInd + 1}`,
                            tag: event === memoTrainingUtils.MemoEvent.cards ? `${log.tag} (${memoTrainingUtils.cardTagToMarkStr(log.tag)})` : log.tag,
                            memoSec: log.memoSec.toFixed(2),
                            memoLosingSec: log.memoLosingSec.toFixed(1),
                        };
                    });

                    const tHead = [
                        '出てきた順',
                        '遅い順',
                        '束',
                        '組',
                        '位置',
                        'element',
                        '記憶時間',
                        '忘却時間',
                        '正解?',
                        '復習回数',
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
                        'reviewCnt',
                    ];

                    return (
                        <div>
                            <h2>要素ごとの結果</h2>
                            <Txt>記憶時間平均: {`${meanMemoSec.toFixed(2)}`}</Txt>
                            <Txt>標準偏差: {`${sd.toFixed(2)}`}</Txt>
                            <SortableTbl
                                tblData={showData}
                                tHead={tHead}
                                paging={false}
                                search={true}
                                defaultCSS={true}
                                customTd={[]}
                                dKey={col}
                            />
                        </div>
                    );
                })()
            }

        </main>

    </div>
);

MemoTrainingResultTemplate.propTypes = {
    event: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    scores: PropTypes.array.isRequired,
    memoLogs: PropTypes.array.isRequired,
    recallLogs: PropTypes.array.isRequired,
    trialId: PropTypes.number,

    sagaFetchScores: PropTypes.func.isRequired,
    decideTrial: PropTypes.func.isRequired,
};

export default MemoTrainingResultTemplate;
