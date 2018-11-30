import React from 'react';
import PropTypes from 'prop-types';
import Txt from '../../atoms/Txt';
import SectionResultPanel from '../../molecules/SectionResultPanel';
const math = require('mathjs');

const SectionResultPanels = ({
    sectionResults,
    solveStartMiliUnixtime,
    memorizeDoneMiliUnixtime,
    solveDoneMiliUnixtime,
}) => {
    const recallSecSum = math.sum(sectionResults.map(s => s.recallMiliSec)) / 1000.0;
    const execSecSum = math.sum(sectionResults.map(s => s.execMiliSec)) / 1000.0;
    const totalSecSum = math.sum(sectionResults.map(s => s.totalMiliSec)) / 1000.0;
    const timerStopSec = (solveDoneMiliUnixtime - memorizeDoneMiliUnixtime) / 1000.0 - totalSecSum;

    const sumInfo = (solveDoneMiliUnixtime && sectionResults.length > 0) ? `想起合計: ${recallSecSum.toFixed(2)} / 実行合計: ${execSecSum.toFixed(2)} / タイマーストップ: ${timerStopSec.toFixed(2)}` : '想起合計:     / 実行合計:    / タイマーストップ:     ';

    return (
    <div>
        <Txt>解析結果</Txt>
        <Txt>{sumInfo}</Txt>
        {
            sectionResults.map((secRes, ind) =>
                <SectionResultPanel key={ind} sectionResult={secRes} />
            )
        }
    </div>
    );
}

SectionResultPanels.propTypes = {
    sectionResults: PropTypes.array,
};

export default SectionResultPanels;
