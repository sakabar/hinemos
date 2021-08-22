import React from 'react';
import PropTypes from 'prop-types';
import {
    Link,
} from 'react-router-dom';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Label,
} from 'recharts';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Txt from '../../atoms/Txt';
import Header from '../../organisms/Header';
import Select from '../../molecules/Select';
// import DecideTrialButtonTdFactory from '../../molecules/DecideTrialButtonTd';
import DateTimePicker from 'react-datetime-picker';
import SortableTbl from 'react-sort-search-table';
const config = require('../../../config');
const path = require('path');
const memoTrainingUtils = require('../../../memoTrainingUtils');
const _ = require('lodash');
const moment = require('moment');

const urlRoot = path.basename(config.urlRoot);

const eventOptions = [
    [ '', '', ],
    [ 'mbld', 'MBLD', ],
    [ 'cards', 'Cards', ],
    [ 'numbers', 'Numbers', ],
];

const MemoTrainingStatsTemplate = (
    {
        event,
        startDate,
        endDate,
        stats,
        scores,
        elementIdToElement,

        sagaFetchStats,
    }
) => (
    <div>
        <Header title="MemoTraining Stats" />

        <main>
            <Link to={`/${urlRoot}/memoTraining/index.html`}>記憶トレーニング トップ</Link>
            <Br/>
            <div>
            開始日: <DateTimePicker
                    format={'yyyy/MM/dd'}
                    returnValue={'start'}
                    disableClock={true}
                    value={new Date(startDate)}
                    onChange={ (value) => {
                        const newStartDate = value ? moment(value).format('YYYY/MM/DD') : moment().subtract(7 * 13 - 1, 'days').format('YYYY/MM/DD');
                        sagaFetchStats(event, newStartDate, endDate);
                    }}
                /><Br/>

    終了日: <DateTimePicker
                    format={'yyyy/MM/dd'}
                    returnValue={'end'}
                    disableClock={true}
                    value={new Date(endDate)}
                    onChange={ (value) => {
                        const newEndDate = value ? moment(value).format('YYYY/MM/DD') : moment().format('YYYY/MM/DD');
                        sagaFetchStats(event, startDate, newEndDate);
                    }}
                /><Br/>
        種目: <Select options={eventOptions} defaultValue={event || ''} onChange={(e) => { sagaFetchStats(e.target.value, startDate, endDate); }} /><Br/>
                <Button value="リロード" onClick={(e) => { sagaFetchStats(event, startDate, endDate); }}/><Br/>
            </div>

            <Br/>

            {
                (() => {
                    const standardScores = scores
                        .map(score => {
                            return {
                                ...score,
                                createdAt: moment(score.createdAt),
                            };
                        })
                        .filter(score => {
                            if (score.createdAt < moment(startDate, 'YYYY/MM/DD') || moment(endDate, 'YYYY/MM/DD').add(1, 'days') <= score.createdAt) {
                                return false;
                            }

                            if (event === memoTrainingUtils.MemoEvent.cards) {
                                // FIXME 1カード1イメージである想定
                                return score.allDeckNum === 1 && score.allElementNum === 52;
                            } else if (event === memoTrainingUtils.MemoEvent.numbers) {
                                // FIXME 2桁1イメージである想定
                                return score.allDeckNum === 1 && score.allElementNum === 40;
                            } else if (event === memoTrainingUtils.MemoEvent.mbld) {
                                // MBLDの場合はイメージ数を限定しない
                                return true;
                            } else {
                                return false;
                            }
                        })
                        .map(score => {
                            return {
                                totalMemoSec: score.totalMemoSec,
                                allElementAcc: score.allElementAcc,
                                scoresComponent: memoTrainingUtils.calcScoresComponent(event, score.totalMemoSec, score.totalRecallSec, score.allDeckNum, score.successDeckNum, score.allElementNum),
                                createdAt: score.createdAt.format('YYYY/MM/DD HH:mm'),
                            };
                        });

                    const successfulTrials = standardScores
                        .filter(score => {
                            return score.allElementAcc === 1;
                        });

                    const badTrials = standardScores
                        .filter(score => {
                            return score.allElementAcc !== 1;
                        });

                    let recentBestScoresComponents = standardScores
                        .filter(score => score.scoresComponent !== null)
                        .map(score => {
                            return {
                                totalMemoSec: score.totalMemoSec,
                                scoresComponent: score.scoresComponent,
                                createdAt: score.createdAt,
                            };
                        });

                    // タイムの昇順ソート
                    const RECENT_TOP_CNT = 5;
                    recentBestScoresComponents.sort((a, b) => a.totalMemoSec - b.totalMemoSec);
                    recentBestScoresComponents = recentBestScoresComponents.slice(0, RECENT_TOP_CNT);

                    while (recentBestScoresComponents.length < RECENT_TOP_CNT) {
                        const rec = {
                            totalMemoSec: 61.0 * 60,
                            scoresComponent: Math.floor(5.0 * (60.0 - 61.0 * 60)),
                            createdAt: '9999/12/31 23:59',
                        };

                        recentBestScoresComponents.push(rec);
                    }

                    const scoresComponentsSum = _.sum(recentBestScoresComponents.map(rec => rec.scoresComponent));

                    const paddingStyle = {
                        padding: '5px 10px',
                    };

                    const tableNode = (() => {
                        if (event !== 'cards' && event !== 'numbers') {
                            return (
                                <div />
                            );
                        }

                        return (
                            <div>
                                <Txt>Top 5 Scores Componentの合計: {scoresComponentsSum}</Txt>

                                <table border="1">
                                    <thead>
                                        <tr>
                                            <th style={paddingStyle} align="right">Time</th>
                                            <th style={paddingStyle} align="right">Date</th>
                                            <th style={paddingStyle} align="right">ML Scores Component</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {
                                            recentBestScoresComponents.map((rec, key) => {
                                                return (
                                                    <tr key={key}>
                                                        <td style={paddingStyle} align="right">{rec.totalMemoSec.toFixed(2)}s</td>
                                                        <td style={paddingStyle} align="right">{rec.createdAt}</td>
                                                        <td style={paddingStyle} align="right">{rec.scoresComponent}</td>
                                                    </tr>
                                                );
                                            })
                                        }
                                    </tbody>
                                </table>

                            </div>
                        );
                    })();

                    const trialAcc = 1.0 * successfulTrials.length / (successfulTrials.length + badTrials.length);
                    const bo5Acc = 1.0 - (1.0 - trialAcc) ** 5;
                    const ao5Acc = 5.0 * (1.0 - trialAcc) * (trialAcc ** 4) + (trialAcc ** 5);

                    return (
                        <div>
                            <Txt>成功率: {successfulTrials.length}/{successfulTrials.length + badTrials.length} = {(trialAcc * 100).toFixed(2)}%</Txt>
                            <Txt>5回中1回以上成功する確率: 1 - (1 - {trialAcc.toFixed(2)})^5 = {(bo5Acc * 100).toFixed(2)}%</Txt>
                            <Txt>5回中4回以上成功する確率: 5 * (1 - {trialAcc.toFixed(2)}) * {trialAcc.toFixed(2)}^4 + {trialAcc.toFixed(2)}^5 = {(ao5Acc * 100).toFixed(2)}%</Txt>
                            <Br/>

                            {tableNode}

                            <ScatterChart
                                width={400}
                                height={400}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    bottom: 20,
                                    left: 20,
                                }}
                            >

                                <CartesianGrid />
                                <XAxis type="number" dataKey="totalMemoSec" name="記憶時間" tickCount={11} interval={0} domain={[ (dataMin) => Math.floor(dataMin), (dataMax) => Math.ceil(dataMax), ]}>
                                    <Label value="タイムと正解率 (Cardsは52枚、Numbersは80桁)" offset={0} position="insideBottom"/>
                                </XAxis>
                                <YAxis type="number" dataKey="allElementAcc" name="正解率" tickCount={11} interval={0} domain={[ 0.0, 1.0, ]}/>
                                <ZAxis type="category" dataKey="createdAt" name="日時" />
                                <Tooltip cursor={{ strokeDasharray: '3 3', }} />
                                <Legend />
                                <Scatter name="Successful" data={successfulTrials} fill="#82ca9d" shape="circle" />
                                <Scatter name="Bad" data={badTrials} fill="#8884d8" shape="triangle" />
                            </ScatterChart>
                        </div>
                    );
                })()
            }

            {
                (() => {
                    const MyData = stats.map(rec => {
                        const tmpTag = elementIdToElement[rec.elementId] ? elementIdToElement[rec.elementId].tag : null;
                        const tag = rec.event === memoTrainingUtils.MemoEvent.cards ? `${tmpTag} (${memoTrainingUtils.cardTagToMarkStr(tmpTag)})` : tmpTag;

                        const mistakeStrs = rec.mistakes.map(mistake => {
                            const solutionElementId = mistake.solutionElementId;
                            // const count = mistake.count;
                            const percent = mistake.rate * 100;

                            let mistakeTag = '無回答';
                            if (elementIdToElement[solutionElementId]) {
                                const tag = elementIdToElement[solutionElementId].tag;
                                if (event === memoTrainingUtils.MemoEvent.cards) {
                                    mistakeTag = memoTrainingUtils.cardTagToMarkStr(tag);
                                } else {
                                    mistakeTag = tag;
                                }
                            }

                            return `${mistakeTag} (${percent.toFixed(0)}%)`;
                        });

                        return {
                            event: rec.event,
                            posInd: `pos=${rec.posInd + 1}`,
                            element: tag,

                            transformation: rec.transformation ? parseFloat(rec.transformation.toFixed(2)) : '',
                            memorization: rec.memorization ? parseFloat(rec.memorization.toFixed(2)) : '',
                            diff: rec.memorization && rec.transformation ? parseFloat((rec.memorization - rec.transformation).toFixed(2)) : '',
                            acc: rec.acc ? parseFloat(rec.acc.toFixed(2)) : 0.0,
                            recallSum: rec.recallSum,
                            transformationSum: rec.transformationSum,
                            mistakeCnt: rec.mistakeCnt,
                            mistakes: mistakeStrs.join(', '),
                        };
                    });

                    const tHead = [
                        '種目',
                        '位置',
                        'element',

                        '記憶',
                        '変換',
                        '(記憶-変換)',

                        '正解率',
                        '誤答回数',
                        '記憶回数',
                        '変換回数',
                        '間違い方',
                    ];

                    const col = [
                        'event',
                        'posInd',
                        'element',

                        'memorization',
                        'transformation',
                        'diff',

                        'acc',
                        'mistakeCnt',
                        'recallSum',
                        'transformationSum',
                        'mistakes',
                    ];

                    const avgMemorizationSec = _.mean(MyData.filter(rec => rec.memorization !== '').map(rec => rec.memorization));
                    const avgTransformationSec = _.mean(MyData.filter(rec => rec.transformation !== '').map(rec => rec.transformation));
                    const recallCountSum = _.sum(MyData.map(rec => rec.recallSum));
                    const transformationCountSum = _.sum(MyData.map(rec => rec.transformationSum));

                    return (
                        <div>
                            <Button value="リロード" onClick={(e) => { sagaFetchStats(event, startDate, endDate); }}/><Br/>
                            <Txt>合計{MyData.length}イメージ</Txt>
                            <Txt>1イメージあたりの平均記憶時間: {avgMemorizationSec.toFixed(2)}秒</Txt>
                            <Txt>1イメージあたりの平均変換時間: {avgTransformationSec.toFixed(2)}秒</Txt>
                            <Txt>記憶練習した合計イメージ数: {recallCountSum}</Txt>
                            <Txt>変換練習した合計イメージ数: {transformationCountSum}</Txt>

                            <SortableTbl tblData={MyData}
                                tHead={tHead}
                                dKey={col}
                                paging={false}
                                search={true}
                                defaultCSS={true}
                            />
                        </div>
                    );
                })()
            }

        </main>

    </div>
);

MemoTrainingStatsTemplate.propTypes = {
    event: PropTypes.string.isRequired,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    stats: PropTypes.array.isRequired,
    scores: PropTypes.array.isRequired,
    elementIdToElement: PropTypes.object.isRequired,

    sagaFetchStats: PropTypes.func.isRequired,
};

export default MemoTrainingStatsTemplate;
