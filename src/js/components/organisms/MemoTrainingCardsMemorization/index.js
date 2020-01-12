import React from 'react';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Txt from '../../atoms/Txt';
import Button from '../../atoms/Button';
import PlayingCard from '../../molecules/PlayingCard';

const MemoTrainingCardsMemorization = ({
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

            {
                decks[deckInd][pairInd].map((element, i) => (<PlayingCard tag={element.tag} key={i}/>))
            }

            <div>
                <Button value="←←" onClick={(e) => sagaGoToDeckHead()} disabled={deckInd === 0 && pairInd === 0} />
                <Button value="←" onClick={(e) => sagaGoToPrevPair()} disabled={deckInd === 0 && pairInd === 0}/>
                <Button value="→" onClick={(e) => sagaGoToNextPair()} disabled={deckInd === decks.length - 1 && pairInd === decks[deckInd].length - 1}/>
                <Button value="→→" onClick={(e) => sagaGoToNextDeck()} disabled={deckInd === decks.length - 1}/>
                <Br/>
                <Button value="記憶終了" onClick={(e) => finishMemorizationPhase()}/>
            </div>
        </div>
    );
};

MemoTrainingCardsMemorization.propTypes = {
    decks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
    deckInd: PropTypes.number.isRequired,
    pairInd: PropTypes.number.isRequired,

    finishMemorizationPhase: PropTypes.func.isRequired,
    sagaGoToNextPair: PropTypes.func.isRequired,
    sagaGoToPrevPair: PropTypes.func.isRequired,
    sagaGoToDeckHead: PropTypes.func.isRequired,
    sagaGoToNextDeck: PropTypes.func.isRequired,
};

export default MemoTrainingCardsMemorization;
