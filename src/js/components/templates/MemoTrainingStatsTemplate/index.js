import React from 'react';
import PropTypes from 'prop-types';
import {
    Link,
} from 'react-router-dom';
import Br from '../../atoms/Br';
// import Txt from '../../atoms/Txt';
import Header from '../../organisms/Header';
import Select from '../../molecules/Select';
// import DecideTrialButtonTdFactory from '../../molecules/DecideTrialButtonTd';
import DateTimePicker from 'react-datetime-picker';
import SortableTbl from 'react-sort-search-table';
const config = require('../../../config');
const path = require('path');
const memoTrainingUtils = require('../../../memoTrainingUtils');
// const _ = require('lodash');
const moment = require('moment');

const urlRoot = path.basename(config.urlRoot);

const eventOptions = [
    [ '', '種目', ],
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
        elementIdToElement,

        sagaFetchStats,
        setStartDate,
        setEndDate,
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
                        setStartDate(value ? moment(value).format('YYYY/MM/DD') : null);
                    }}
                /><Br/>

    終了日: <DateTimePicker
                    format={'yyyy/MM/dd'}
                    returnValue={'end'}
                    disableClock={true}
                    value={new Date(endDate)}
                    onChange={ (value) => {
                        setEndDate(value ? moment(value).format('YYYY/MM/DD') : null);
                    }}
                /><Br/>
                <Select options={eventOptions} defaultValue={event || ''} onChange={(e) => { sagaFetchStats(e.target.value); }} onClick={(e) => { sagaFetchStats(e.target.value); }}/><Br/>
            </div>

            <Br/>

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
                            posInd: rec.posInd + 1,
                            element: tag,

                            transformation: rec.transformation ? parseFloat(rec.transformation.toFixed(2)) : '',
                            memorization: rec.memorization ? parseFloat(rec.memorization.toFixed(2)) : '',
                            diff: rec.memorization && rec.transformation ? parseFloat((rec.memorization - rec.transformation).toFixed(2)) : '',
                            acc: rec.acc ? parseFloat(rec.acc.toFixed(2)) : 0.0,
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
                        'mistakes',
                    ];

                    return (
                        <div>
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
    elementIdToElement: PropTypes.object.isRequired,

    sagaFetchStats: PropTypes.func.isRequired,
    setStartDate: PropTypes.func.isRequired,
    setEndDate: PropTypes.func.isRequired,
};

export default MemoTrainingStatsTemplate;
