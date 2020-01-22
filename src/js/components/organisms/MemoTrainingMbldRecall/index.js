import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Br from '../../atoms/Br';
import SolutionPair from '../../molecules/SolutionPair';

const MemoTrainingMbldRecall = ({
    decks,
    solution,

    sagaFinishRecallPhase,
    sagaUpdateMbldSolution,
}) => {
    return (
        <div>
            <Button color="primary" value="回答終了" onClick={(e) => sagaFinishRecallPhase()}/>
            <Br/>
            {
                decks.map((deck, deckKey) => {
                    return deck.map((pair, pairKey) => {
                        return (<SolutionPair key={String(deckKey) + '-' + String(pairKey)} deckInd={deckKey} pairInd={pairKey} sagaUpdateMbldSolution={sagaUpdateMbldSolution}/>);
                    });
                })
            }

        </div>
    );
};

MemoTrainingMbldRecall.propTypes = {
    decks: PropTypes.array.isRequired,
    solution: PropTypes.array.isRequired,

    sagaFinishRecallPhase: PropTypes.func.isRequired,
    sagaUpdateMbldSolution: PropTypes.func.isRequired,
};

export default MemoTrainingMbldRecall;
