import React from 'react';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Txt from '../../atoms/Txt';
import Button from '../../atoms/Button';
import MemoTimer from '../../molecules/MemoTimer';

const MemoTrainingMbldMemorization = ({
    startMemoMiliUnixtime,
    startRecallMiliUnixtime,
    timerMiliUnixtime,
    timeVisible,

    decks,
    deckInd,
    pairInd,

    finishMemorizationPhase,
    sagaGoToNextPair,
    sagaGoToPrevPair,
    sagaGoToDeckHead,
    sagaGoToNextDeck,

    sagaToggleTimer,
}) => {
    return (
        <div>
            <Txt style={{ fontSize: '30px', }}>{`${deckInd + 1}-${pairInd + 1}`}</Txt>
            <Txt style={{ fontSize: '30px', }}>{`${decks[deckInd][pairInd].map(e => e.tag).join(',')}`}</Txt>
            <MemoTimer timeVisible={timeVisible} timerMiliUnixtime={timerMiliUnixtime} sagaToggleTimer={sagaToggleTimer}/>

            <Button value="←←" onClick={(e) => sagaGoToDeckHead()} disabled={deckInd === 0 && pairInd === 0} />
            <Button value="←" onClick={(e) => sagaGoToPrevPair()} disabled={deckInd === 0 && pairInd === 0}/>
            <Button value="→" onClick={(e) => sagaGoToNextPair()} disabled={deckInd === decks.length - 1 && pairInd === decks[deckInd].length - 1}/>
            <Button value="→→" onClick={(e) => sagaGoToNextDeck()} disabled={deckInd === decks.length - 1}/>
            <Br/>
            <Button value="記憶終了" onClick={(e) => finishMemorizationPhase()}/>
        </div>
    );
};

MemoTrainingMbldMemorization.propTypes = {
    startMemoMiliUnixtime: PropTypes.number.isRequired,
    startRecallMiliUnixtime: PropTypes.number.isRequired,
    timerMiliUnixtime: PropTypes.number.isRequired,
    timeVisible: PropTypes.bool.isRequired,

    decks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
    deckInd: PropTypes.number.isRequired,
    pairInd: PropTypes.number.isRequired,

    finishMemorizationPhase: PropTypes.func.isRequired,
    sagaGoToNextPair: PropTypes.func.isRequired,
    sagaGoToPrevPair: PropTypes.func.isRequired,
    sagaGoToDeckHead: PropTypes.func.isRequired,
    sagaGoToNextDeck: PropTypes.func.isRequired,

    sagaToggleTimer: PropTypes.func.isRequired,
};

export default MemoTrainingMbldMemorization;
