import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
const moment = require('moment');

const ModeDecisionButtons = ({
    deckNum,
    deckSize,
    pairSize,

    sagaStartMemorizationMode,
    sagaStartTransformationMode,
    ...rest
}) => (
    <div>
        <Button value="記憶練習" onClick={(e) => { sagaStartMemorizationMode(parseInt(moment().format('x')), deckNum, deckSize, pairSize); }}/>
        <Button value="変換練習" onClick={(e) => { sagaStartTransformationMode(parseInt(moment().format('x')), deckNum, deckSize, pairSize); }}/>
    </div>
);

ModeDecisionButtons.propTypes = {
    deckNum: PropTypes.number.required,
    deckSize: PropTypes.number.required,
    pairSize: PropTypes.number.required,

    sagaStartMemorizationMode: PropTypes.func,
    sagaStartTransformationMode: PropTypes.func,
};

export default ModeDecisionButtons;
