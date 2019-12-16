import React from 'react';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Txt from '../../atoms/Txt';
import Button from '../../atoms/Button';

const MemoTrainingMbldMemorization = ({
    decks,
    deckInd,
    pairInd,

    finishMemorizationPhase,
    sagaGoToNextPair,
    sagaGoToPrevPair,
    sagaGoToDeckHead,
    sagaGoToNextDeck,
}) => {
    return (
        <div>
            <Txt style={{ fontSize: '30px', }}>{`${deckInd + 1}-${pairInd + 1}`}</Txt>
            <Txt style={{ fontSize: '30px', }}>{`${decks[deckInd][pairInd].map(e => e.tag).join(',')}`}</Txt>

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
    decks: PropTypes.array.required,
    deckInd: PropTypes.number.required,
    pairInd: PropTypes.number.required,

    finishMemorizationPhase: PropTypes.func,
    sagaGoToNextPair: PropTypes.func,
    sagaGoToPrevPair: PropTypes.func,
    sagaGoToDeckHead: PropTypes.func,
    sagaGoToNextDeck: PropTypes.func,
};

export default MemoTrainingMbldMemorization;
