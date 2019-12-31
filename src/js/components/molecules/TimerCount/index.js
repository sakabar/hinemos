import React from 'react';
import PropTypes from 'prop-types';
import Txt from '../../atoms/Txt';
const bldTimerUtils = require('../../../bldTimerUtils');

const TimerCount = ({
    timerCount,
    timerState,
    solveStartMiliUnixtime,
    memorizeDoneMiliUnixtime,
    solveDoneMiliUnixtime,
}) => {
    let memoSecStr = '0.00?';
    if (solveStartMiliUnixtime && memorizeDoneMiliUnixtime) {
        memoSecStr = ((memorizeDoneMiliUnixtime - solveStartMiliUnixtime) / 1000.0).toFixed(2);
    }
    if (solveStartMiliUnixtime && !memorizeDoneMiliUnixtime) {
        memoSecStr = `${timerCount.toFixed(2)}?`;
    }

    let execSecStr = '0.00?';
    if (solveStartMiliUnixtime && memorizeDoneMiliUnixtime && solveDoneMiliUnixtime) {
        execSecStr = ((solveDoneMiliUnixtime - memorizeDoneMiliUnixtime) / 1000.0).toFixed(2);
    }
    if (solveStartMiliUnixtime && memorizeDoneMiliUnixtime && !solveDoneMiliUnixtime) {
        const memoSec = (memorizeDoneMiliUnixtime - solveStartMiliUnixtime) / 1000.0;
        const exeSec = timerCount - memoSec;
        execSecStr = `${exeSec.toFixed(2)}?`;
    }

    let totalSecStr = '0.00?';
    if (solveStartMiliUnixtime && memorizeDoneMiliUnixtime && solveDoneMiliUnixtime) {
        totalSecStr = ((solveDoneMiliUnixtime - solveStartMiliUnixtime) / 1000.0).toFixed(2);
    }
    if (solveStartMiliUnixtime && memorizeDoneMiliUnixtime && !solveDoneMiliUnixtime) {
        totalSecStr = `${timerCount.toFixed(2)}?`;
    }

    const timerCountDisp = `${memoSecStr} + ${execSecStr} = ${totalSecStr}`;

    // waitingかつ100ミリ秒以上 →緑
    // waiting 赤
    // それ以外: 黒
    let colorStyle = {
        color: 'black',
    };

    if (timerState === bldTimerUtils.TimerState.holding) {
        colorStyle.color = 'red';
    }
    if (timerState === bldTimerUtils.TimerState.ready) {
        colorStyle.color = 'green';
    }

    return (
        <div>
            <Txt className="fontCheck" style={colorStyle}>{timerCountDisp}</Txt>
        </div>
    );
};

TimerCount.propTypes = {
    timerCount: PropTypes.number.isRequired,
    timerState: PropTypes.number.isRequired,
    solveStartMiliUnixtime: PropTypes.number,
    memorizeDoneMiliUnixtime: PropTypes.number,
    solveDoneMiliUnixtime: PropTypes.number,
};

export default TimerCount;
