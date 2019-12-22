import React from 'react';
import PropTypes from 'prop-types';
import Txt from '../../atoms/Txt';
import Header from '../../organisms/Header';
import MemoTrainingCardsSetting from '../../organisms/MemoTrainingCardsSetting';
import MemoTrainingCardsMemorization from '../../organisms/MemoTrainingCardsMemorization';
const memoTrainingUtils = require('../../../memoTrainingUtils');

const MemoTrainingCardsTemplate = (
    {
        startMiliUnixtime,
        deckNum,
        deckSize,
        pairSize,

        memoEvent,
        mode,

        phase,
        decks,
        solution,

        deckInd,
        pairInd,

        setDeckNum,
        setDeckSize,
        setPairSize,

        sagaStartMemorizationPhase,
        finishMemorizationPhase,
        sagaFinishRecallPhase,

        sagaGoToNextPair,
        sagaGoToPrevPair,
        sagaGoToDeckHead,
        sagaGoToNextDeck,

        updateSolution,
    }
) => (
    <div>
        <Header title="MemoTraining Cards" />
        <main>
            {
                (() => {
                    if (phase === memoTrainingUtils.TrainingPhase.setting) {
                        return (<MemoTrainingCardsSetting deckNum={deckNum} deckSize={deckSize} pairSize={pairSize} setDeckNum={setDeckNum} setDeckSize={setDeckSize} setPairSize={setPairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.memorization) {
                        return (<MemoTrainingCardsMemorization decks={decks} deckInd={deckInd} pairInd={pairInd} finishMemorizationPhase={finishMemorizationPhase} sagaGoToNextPair={sagaGoToNextPair} sagaGoToPrevPair={sagaGoToPrevPair} sagaGoToDeckHead={sagaGoToDeckHead} sagaGoToNextDeck={sagaGoToNextDeck}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.recall) {
                        return <div/>;
                    } else {
                        return (
                            <div>
                                <Txt>Unexpected phase</Txt>
                            </div>
                        );
                    }
                })()
            }
        </main>
    </div>
);

MemoTrainingCardsTemplate.propTypes = {
    startMiliUnixtime: PropTypes.number.isRequired,

    deckNum: PropTypes.number.isRequired,
    deckSize: PropTypes.number,
    pairSize: PropTypes.number.isRequired,

    memoEvent: PropTypes.oneOf(Object.values(memoTrainingUtils.MemoEvent)),
    mode: PropTypes.oneOf(Object.values(memoTrainingUtils.TrainingMode)),
    phase: PropTypes.oneOf(Object.values(memoTrainingUtils.TrainingPhase)).isRequired,

    decks: PropTypes.array.isRequired,
    solution: PropTypes.array.isRequired,

    deckInd: PropTypes.number.isRequired,
    pairInd: PropTypes.number.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setDeckSize: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,
    finishMemorizationPhase: PropTypes.func.isRequired,
    sagaFinishRecallPhase: PropTypes.func.isRequired,

    sagaGoToNextPair: PropTypes.func.isRequired,
    sagaGoToPrevPair: PropTypes.func.isRequired,
    sagaGoToDeckHead: PropTypes.func.isRequired,
    sagaGoToNextDeck: PropTypes.func.isRequired,

    updateSolution: PropTypes.func.isRequired,
};

export default MemoTrainingCardsTemplate;
