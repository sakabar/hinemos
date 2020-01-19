import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Txt from '../../atoms/Txt';
// import Textbox from '../../atoms/Textbox';
import SolutionPair from '../../molecules/SolutionPair';

const MemoTrainingMbldRecall = ({
    decks,
    solution,

    sagaFinishRecallPhase,
    sagaUpdateMbldSolution,
}) => {
    return (
        <div>
            <Txt>recall phase</Txt>
            <Txt>{'@' + JSON.stringify(solution) + '@'}</Txt>

            <Button value="回答終了" onClick={(e) => sagaFinishRecallPhase()}/>

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
