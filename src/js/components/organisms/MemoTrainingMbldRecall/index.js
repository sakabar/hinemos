import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Br from '../../atoms/Br';
import Txt from '../../atoms/Txt';
import SolutionPair from '../../molecules/SolutionPair';

const MemoTrainingMbldRecall = ({
    startMemoMiliUnixtime,
    startRecallMiliUnixtime,

    decks,
    solution,

    sagaFinishRecallPhase,
    sagaUpdateMbldSolution,
}) => {
    return (
        <div>
            <Button color="primary" value="回答終了" onClick={(e) => sagaFinishRecallPhase()}/>
            <Br/>

            <Txt>記憶時間:{((startRecallMiliUnixtime - startMemoMiliUnixtime) / 1000.0).toFixed(2)}秒</Txt>
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
    startMemoMiliUnixtime: PropTypes.number.isRequired,
    startRecallMiliUnixtime: PropTypes.number.isRequired,

    decks: PropTypes.array.isRequired,
    solution: PropTypes.array.isRequired,

    sagaFinishRecallPhase: PropTypes.func.isRequired,
    sagaUpdateMbldSolution: PropTypes.func.isRequired,
};

export default MemoTrainingMbldRecall;
