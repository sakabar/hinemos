import React from 'react';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Txt from '../../atoms/Txt';
import Button from '../../atoms/Button';
import MemoTimer from '../../molecules/MemoTimer';

const MemoTrainingNumbersMemorization = ({
    startMemoMiliUnixtime,
    startRecallMiliUnixtime,
    timerMiliUnixtime,
    timeVisible,

    numbersDelimiter,

    decks,
    deckInd,
    pairInd,

    sagaFinishMemorizationPhase,
    sagaGoToNextPair,
    sagaGoToPrevPair,
    sagaGoToDeckHead,
    sagaGoToNextDeck,

    sagaToggleTimer,
}) => {
    return (
        <div style={{ minHeight: '800px', }}>
            <Button color="primary" value="記憶終了" onClick={(e) => sagaFinishMemorizationPhase()}/>
            <Br/>

            <Txt style={{ fontSize: '30px', }}>{`${deckInd + 1}-${pairInd + 1}`}</Txt>
            <div>
                <Txt style={{ fontSize: '30px', }}>{decks[deckInd][pairInd].map(e => e.tag).join(numbersDelimiter)}</Txt>
            </div>

            {/* touchAction: 'manipulation' → iPhoneのダブルタップでズームされるのを抑制 */}
            <div style={{ touchAction: 'manipulation', }}>
                <Button color="primary" value="←←" onClick={(e) => sagaGoToDeckHead()} disabled={deckInd === 0 && pairInd === 0} />
                <Button color="primary" value="←" style={{ minWidth: '72px', }} onClick={(e) => sagaGoToPrevPair()} disabled={deckInd === 0 && pairInd === 0}/>
                <Button color="primary" value="→" style={{ minWidth: '72px', }} onClick={(e) => sagaGoToNextPair()} disabled={deckInd === decks.length - 1 && pairInd === decks[deckInd].length - 1}/>
                <Button color="primary" value="→→" onClick={(e) => sagaGoToNextDeck()} disabled={deckInd === decks.length - 1}/>
                <MemoTimer timeVisible={timeVisible} timerMiliUnixtime={timerMiliUnixtime} sagaToggleTimer={sagaToggleTimer}/>
                <Br/>
            </div>
        </div>
    );
};

MemoTrainingNumbersMemorization.propTypes = {
    startMemoMiliUnixtime: PropTypes.number.isRequired,
    startRecallMiliUnixtime: PropTypes.number.isRequired,
    timerMiliUnixtime: PropTypes.number.isRequired,
    timeVisible: PropTypes.bool.isRequired,

    numbersDelimiter: PropTypes.string.isRequired,

    decks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
    deckInd: PropTypes.number.isRequired,
    pairInd: PropTypes.number.isRequired,

    sagaFinishMemorizationPhase: PropTypes.func.isRequired,
    sagaGoToNextPair: PropTypes.func.isRequired,
    sagaGoToPrevPair: PropTypes.func.isRequired,
    sagaGoToDeckHead: PropTypes.func.isRequired,
    sagaGoToNextDeck: PropTypes.func.isRequired,

    sagaToggleTimer: PropTypes.func.isRequired,
};

export default MemoTrainingNumbersMemorization;
