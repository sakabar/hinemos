import React from 'react';
import PropTypes from 'prop-types';
import {
    Link,
} from 'react-router-dom';
import {
    ScatterChart,
    Scatter,
    ReferenceLine,
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
import {
    Tooltip as ReactStrapTooltip,
} from 'reactstrap';
import {
    mean as _mean,
    meanBy as _meanBy,
    sample as _sample,
    sum as _sum,
} from 'lodash-es';
const config = require('../../../config');
const path = require('path');
const memoTrainingUtils = require('../../../memoTrainingUtils');
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
        isOpenBo5Tooltip,
        isOpenAo5Tooltip,
        isOpenScoresComponentTooltip,

        sagaFetchStats,
        setBo5TooltipIsOpen,
        setAo5TooltipIsOpen,
        setScoresComponentTooltipIsOpen,
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
                /><Button value="1d" onClick={() => {
                    sagaFetchStats(event, endDate, endDate);
                }}/><Button value="1w" onClick={() => {
                    const newStartDate = moment(endDate).subtract(7 - 1, 'days').format('YYYY/MM/DD');
                    sagaFetchStats(event, newStartDate, endDate);
                }}/><Button value="4w" onClick={() => {
                    const newStartDate = moment(endDate).subtract(7 * 4 - 1, 'days').format('YYYY/MM/DD');
                    sagaFetchStats(event, newStartDate, endDate);
                }}/><Button value="3m" onClick={() => {
                    const newStartDate = moment(endDate).subtract(7 * 13 - 1, 'days').format('YYYY/MM/DD');
                    sagaFetchStats(event, newStartDate, endDate);
                }}/><Br/>

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
        種目: <Select value={event || ''} options={eventOptions} onChange={(e) => { sagaFetchStats(e.target.value, startDate, endDate); }} /><Br/>
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
                                totalRecallSec: score.totalRecallSec,
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
                                totalRecallSec: score.totalRecallSec,
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
                            totalRecallSec: 60 * 4.0,
                            scoresComponent: Math.floor(5.0 * (60.0 - 61.0 * 60)),
                            createdAt: '9999/12/31 23:59',
                        };

                        recentBestScoresComponents.push(rec);
                    }

                    const scoresComponentsSum = _sum(recentBestScoresComponents.map(rec => rec.scoresComponent));

                    const paddingStyle = {
                        padding: '5px 10px',
                    };

                    const tableNode = (() => {
                        return (
                            <div>
                                {
                                    (event === 'cards' || event === 'numbers')
                                        ? (
                                            <div>
                                                <p>Top 5 <span id ="scoresComponentId" style={{ textDecoration: 'underline', color: 'blue', }} href="#">Scores Component</span>の合計: {scoresComponentsSum}</p>
                                                <ReactStrapTooltip placement="right" isOpen={isOpenScoresComponentTooltip} target="scoresComponentId" toggle={() => setScoresComponentTooltipIsOpen(!isOpenScoresComponentTooltip)}>
                                                Memory League (外部サイト) の Ratings Explanation に記載されている計算式を利用しています。<br/>
                                                    <br/>
                                                上級者以外もスコアの向上を実感できるようにするため、記憶時間が60秒を超えた場合でも0点にはせずに負の値を算出します。<br/>
                                                    <br/>
                                                4分以内に回答した場合のみ、値が算出されます。
                                                </ReactStrapTooltip>
                                            </div>
                                        )
                                        : (
                                            <div>
                                                <p>※ この種目はScores Component集計対象外</p>
                                            </div>
                                        )
                                }

                                <table border="1">
                                    <thead>
                                        <tr>
                                            <th style={paddingStyle} align="right">Time</th>
                                            <th style={paddingStyle} align="right">Recall</th>
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
                                                        <td style={paddingStyle} align="right">{rec.totalRecallSec.toFixed(2)}s</td>
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

                    const SIM_CNT = 100000;
                    const TRIAL_CNT = 5;
                    const DEFAULT_SEC = 300.0;

                    const bo5SimTimes = [];
                    const ao5SimTimes = [];

                    for (let i = 0; i < SIM_CNT; i++) {
                        const secs = [];

                        // 5試技ぶんサンプル、非復元抽出
                        for (let k = 0; k < TRIAL_CNT; k++) {
                            if (standardScores.length === 0) {
                                secs.push(DEFAULT_SEC);
                                continue;
                            }

                            const rec = _sample(standardScores);
                            const sec = (rec.allElementAcc === 1 && rec.totalMemoSec < DEFAULT_SEC) ? rec.totalMemoSec : DEFAULT_SEC;
                            secs.push(sec);
                        }

                        secs.sort((a, b) => a - b);
                        const bo5 = secs[0];
                        const ao5 = 1.0 * (_sum(secs) - secs[0] - secs[TRIAL_CNT - 1]) / (TRIAL_CNT - 2);
                        bo5SimTimes.push(bo5);
                        ao5SimTimes.push(ao5);
                    }

                    const bo5Exp = _mean(bo5SimTimes);
                    const ao5Exp = _mean(ao5SimTimes);

                    const bo5rank = memoTrainingUtils.singleSCCRank(bo5Exp);
                    const ao5rank = memoTrainingUtils.averageSCCRank(ao5Exp);

                    const successMemoSecAvg = _meanBy(successfulTrials, 'totalMemoSec'); ;
                    const successMemoSecSd = Math.sqrt(_mean(successfulTrials.map(data => (data.totalMemoSec - successMemoSecAvg) * (data.totalMemoSec - successMemoSecAvg))));

                    const successMemoMedian = (() => {
                        if (successfulTrials.length === 0) {
                            return NaN;
                        }

                        if (successfulTrials.length % 2 === 1) {
                            const mid = (successfulTrials.length - 1) / 2;

                            const memoSecList = successfulTrials.map(rec => rec.totalMemoSec);
                            memoSecList.sort((a, b) => a - b);

                            return memoSecList[mid];
                        } else {
                            const mid1 = successfulTrials.length / 2;
                            const mid2 = mid1 - 1;

                            const memoSecList = successfulTrials.map(rec => rec.totalMemoSec);
                            memoSecList.sort((a, b) => a - b);
                            return (memoSecList[mid2] + memoSecList[mid1]) / 2.0;
                        }
                    })();

                    return (
                        <div>
                            {tableNode}
                            <Br/>

                            <Txt>成功率: {successfulTrials.length}/{successfulTrials.length + badTrials.length} = {(trialAcc * 100).toFixed(2)}%</Txt>

                            <p>5回中1回以上成功する確率: <span id ="bo5ProbabilityId" style={{ textDecoration: 'underline', color: 'blue', }} href="#">{(bo5Acc * 100).toFixed(2)}%,</span> best of 5の期待値:{bo5Exp.toFixed(2)}秒 ({bo5rank}ランク)</p>
                            <ReactStrapTooltip placement="right" isOpen={isOpenBo5Tooltip} target="bo5ProbabilityId" toggle={() => setBo5TooltipIsOpen(!isOpenBo5Tooltip)}>
                            1 - (1 - {trialAcc.toFixed(2)})^5
                            </ReactStrapTooltip>

                            <p>5回中4回以上成功する確率: <span id ="ao5ProbabilityId" style={{ textDecoration: 'underline', color: 'blue', }} href="#">{(ao5Acc * 100).toFixed(2)}%,</span> average of 5の期待値:{ao5Exp.toFixed(2)}秒 ({ao5rank}ランク)</p>
                            <ReactStrapTooltip placement="right" isOpen={isOpenAo5Tooltip} target="ao5ProbabilityId" toggle={() => setAo5TooltipIsOpen(!isOpenAo5Tooltip)}>
                            5 * (1 - {trialAcc.toFixed(2)}) * {trialAcc.toFixed(2)}^4 + {trialAcc.toFixed(2)}^5
                            </ReactStrapTooltip>

                            <p>成功タイムの<span style={{ color: 'red', }}>平均</span>: {successMemoSecAvg.toFixed(2)}秒</p>
                            <Txt>成功タイムの標準偏差: {successMemoSecSd.toFixed(2)}秒</Txt>
                            <p>成功タイムの<span style={{ color: 'lime', }}>中央値</span>: {successMemoMedian.toFixed(2)}秒</p>
                            <Br/>

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

                                <ReferenceLine x={successMemoSecAvg} stroke="red" />
                                <ReferenceLine x={successMemoMedian} stroke="lime" />
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

                    const avgMemorizationSec = _mean(MyData.filter(rec => rec.memorization !== '').map(rec => rec.memorization));
                    const avgTransformationSec = _mean(MyData.filter(rec => rec.transformation !== '').map(rec => rec.transformation));
                    const recallCountSum = _sum(MyData.map(rec => rec.recallSum));
                    const transformationCountSum = _sum(MyData.map(rec => rec.transformationSum));

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
    isOpenBo5Tooltip: PropTypes.bool.isRequired,
    isOpenAo5Tooltip: PropTypes.bool.isRequired,
    isOpenScoresComponentTooltip: PropTypes.bool.isRequired,

    sagaFetchStats: PropTypes.func.isRequired,
    setBo5TooltipIsOpen: PropTypes.func.isRequired,
    setAo5TooltipIsOpen: PropTypes.func.isRequired,
    setScoresComponentTooltipIsOpen: PropTypes.func.isRequired,
};

export default MemoTrainingStatsTemplate;
