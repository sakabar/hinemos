import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Span from '../../atoms/Span';
const _ = require('lodash');

const MemoTimer = ({
    timeVisible,
    timerMiliUnixtime,

    sagaToggleTimer,
}) => (
    <Span>
        {
            (() => {
                const minute = _.floor(timerMiliUnixtime / 1000.0 / 60.0);
                const paddedMinute = _.padStart(minute, 2, '0');

                const second = _.floor(timerMiliUnixtime / 1000.0) % 60;
                const paddedSecond = _.padStart(second, 2, '0');

                const timerStr = timeVisible ? `${paddedMinute}:${paddedSecond}` : 'XX:XX';
                const timerIcon = String.fromCharCode(parseInt('23f0', 16));

                return (<Button color="light" value={`${timerIcon}${timerStr}`} onClick={(e) => { sagaToggleTimer(); }} disabled={timeVisible}/>);
            })()
        }

    </Span>
);

MemoTimer.propTypes = {
    timeVisible: PropTypes.bool.isRequired,
    timerMiliUnixtime: PropTypes.number.isRequired,

    sagaToggleTimer: PropTypes.func.isRequired,
};

export default MemoTimer;
