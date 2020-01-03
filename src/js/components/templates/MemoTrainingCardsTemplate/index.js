import React from 'react';
import PropTypes from 'prop-types';
import Txt from '../../atoms/Txt';
import Header from '../../organisms/Header';
import MemoTrainingCardsSetting from '../../organisms/MemoTrainingCardsSetting';
import MemoTrainingCardsMemorization from '../../organisms/MemoTrainingCardsMemorization';
import MemoTrainingCardsRecall from '../../organisms/MemoTrainingCardsRecall';
const memoTrainingUtils = require('../../../memoTrainingUtils');

const MemoTrainingCardsTemplate = (
    {
        startMemoMiliUnixtime,
        startRecallMiliUnixtime,
        timerMiliUnixtime,
        timeVisible,

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

        handDict,
        handSuits,

        setDeckNum,
        setDeckSize,
        setPairSize,

        sagaStartMemorizationPhase,
        sagaFinishMemorizationPhase,
        sagaFinishRecallPhase,

        sagaGoToNextPair,
        sagaGoToPrevPair,
        sagaGoToDeckHead,
        sagaGoToNextDeck,

        // updateMbldSolution,

        sagaToggleTimer,

        sagaOnKeyDown,
    }
) => (
    <div>
        <Header title="MemoTraining Cards" />
        <main className="memoTraining__main" tabIndex="-1" onKeyDown={ (e) => { sagaOnKeyDown(e); } } >
            {
                (() => {
                    if (phase === memoTrainingUtils.TrainingPhase.setting) {
                        return (<MemoTrainingCardsSetting deckNum={deckNum} deckSize={deckSize} pairSize={pairSize} setDeckNum={setDeckNum} setDeckSize={setDeckSize} setPairSize={setPairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.memorization) {
                        return (<MemoTrainingCardsMemorization startMemoMiliUnixtime={startMemoMiliUnixtime} startRecallMiliUnixtime={startRecallMiliUnixtime} timerMiliUnixtime={timerMiliUnixtime} timeVisible={timeVisible} decks={decks} deckInd={deckInd} pairInd={pairInd} sagaFinishMemorizationPhase={sagaFinishMemorizationPhase} sagaGoToNextPair={sagaGoToNextPair} sagaGoToPrevPair={sagaGoToPrevPair} sagaGoToDeckHead={sagaGoToDeckHead} sagaGoToNextDeck={sagaGoToNextDeck} sagaToggleTimer={sagaToggleTimer}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.recall) {
                        return (<MemoTrainingCardsRecall decks={decks} deckInd={deckInd} pairInd={pairInd} handDict={handDict} handSuits={handSuits} sagaGoToNextPair={sagaGoToNextPair} sagaGoToPrevPair={sagaGoToPrevPair} sagaGoToDeckHead={sagaGoToDeckHead} sagaGoToNextDeck={sagaGoToNextDeck} sagaFinishRecallPhase={sagaFinishRecallPhase}/>);
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
    startMemoMiliUnixtime: PropTypes.number.isRequired,
    startRecallMiliUnixtime: PropTypes.number.isRequired,
    timerMiliUnixtime: PropTypes.number.isRequired,
    timeVisible: PropTypes.bool.isRequired,

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

    handDict: PropTypes.object.isRequired,
    handSuits: PropTypes.array.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setDeckSize: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,
    sagaFinishMemorizationPhase: PropTypes.func.isRequired,
    sagaFinishRecallPhase: PropTypes.func.isRequired,

    sagaGoToNextPair: PropTypes.func.isRequired,
    sagaGoToPrevPair: PropTypes.func.isRequired,
    sagaGoToDeckHead: PropTypes.func.isRequired,
    sagaGoToNextDeck: PropTypes.func.isRequired,

    // updateMbldSolution: PropTypes.func.isRequired,

    sagaToggleTimer: PropTypes.func.isRequired,

    sagaOnKeyDown: PropTypes.func.isRequired,
};

export default MemoTrainingCardsTemplate;
