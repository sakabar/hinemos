import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
const memoTrainingUtils = require('../../../memoTrainingUtils');

const ModeDecisionButtons = ({
    deckNum,
    deckSize,
    pairSize,

    sagaStartMemorizationPhase,
    ...rest
}) => (
    <div>
        <Button value="記憶練習" onClick={(e) => { sagaStartMemorizationPhase(deckNum, deckSize, pairSize, memoTrainingUtils.TrainingMode.memorization); }}/>
        <Button value="変換練習" onClick={(e) => { sagaStartMemorizationPhase(deckNum, deckSize, pairSize, memoTrainingUtils.TrainingMode.transformation); }}/>
    </div>
);

ModeDecisionButtons.propTypes = {
    deckNum: PropTypes.number,
    deckSize: PropTypes.number,
    pairSize: PropTypes.number,

    sagaStartMemorizationPhase: PropTypes.func,
};

export default ModeDecisionButtons;
