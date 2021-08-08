import React from 'react';
import Txt from '../../atoms/Txt';
import Header from '../../organisms/Header';
import PropTypes from 'prop-types';
import MemoTrainingMbldSetting from '../../organisms/MemoTrainingMbldSetting';
import MemoTrainingMbldMemorization from '../../organisms/MemoTrainingMbldMemorization';
import MemoTrainingMbldRecall from '../../organisms/MemoTrainingMbldRecall';
const memoTrainingUtils = require('../../../memoTrainingUtils');

const MemoTrainingMbldTemplate = (
    {
        startMemoMiliUnixtime,
        startRecallMiliUnixtime,
        timerMiliUnixtime,
        timeVisible,

        deckNum,
        // deckSize,
        pairSize,
        // isLefty,
        isOpenMemoShortcutModal,

        memoEvent,
        mode,

        phase,
        decks,
        solution,

        deckInd,
        pairInd,

        // handDict,
        // handSuits,

        setDeckNum,
        // setDeckSize,
        setPairSize,

        sagaStartMemorizationPhase,
        sagaFinishMemorizationPhase,
        sagaFinishRecallPhase,

        sagaGoToNextPair,
        sagaGoToPrevPair,
        sagaGoToDeckHead,
        sagaGoToNextDeck,

        sagaUpdateMbldSolution,

        sagaToggleTimer,

        sagaOnKeyDown,

        toggleShortcutModal,
    }
) => (
    <div>
        <Header title="MemoTraining MBLD" />

        <main className="memoTraining__main" tabIndex="-1" onKeyDown={ (e) => { sagaOnKeyDown(e); } } >
            {
                (() => {
                    if (phase === memoTrainingUtils.TrainingPhase.setting) {
                        return (<MemoTrainingMbldSetting deckNum={deckNum} pairSize={pairSize} isOpenMemoShortcutModal={isOpenMemoShortcutModal} setDeckNum={setDeckNum} setPairSize={setPairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase} toggleShortcutModal={toggleShortcutModal}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.memorization) {
                        return (<MemoTrainingMbldMemorization startMemoMiliUnixtime={startMemoMiliUnixtime} startRecallMiliUnixtime={startRecallMiliUnixtime} timerMiliUnixtime={timerMiliUnixtime} timeVisible={timeVisible} decks={decks} deckInd={deckInd} pairInd={pairInd} sagaFinishMemorizationPhase={sagaFinishMemorizationPhase} sagaGoToNextPair={sagaGoToNextPair} sagaGoToPrevPair={sagaGoToPrevPair} sagaGoToDeckHead={sagaGoToDeckHead} sagaGoToNextDeck={sagaGoToNextDeck} sagaToggleTimer={sagaToggleTimer}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.recall) {
                        return (<MemoTrainingMbldRecall startMemoMiliUnixtime={startMemoMiliUnixtime} startRecallMiliUnixtime={startRecallMiliUnixtime} decks={decks} pairSize={pairSize} solution={solution} sagaFinishRecallPhase={sagaFinishRecallPhase} sagaUpdateMbldSolution={sagaUpdateMbldSolution}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.result) {
                        return (
                            <div>
                                <Txt>Recall phase</Txt>
                            </div>
                        );
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

MemoTrainingMbldTemplate.propTypes = {
    startMemoMiliUnixtime: PropTypes.number.isRequired,
    startRecallMiliUnixtime: PropTypes.number.isRequired,
    timerMiliUnixtime: PropTypes.number.isRequired,
    timeVisible: PropTypes.bool.isRequired,

    deckNum: PropTypes.number.isRequired,
    // deckSize: PropTypes.number,
    pairSize: PropTypes.number.isRequired,
    // isLefty: PropTypes.bool.isRequired,
    isOpenMemoShortcutModal: PropTypes.bool.isRequired,

    memoEvent: PropTypes.oneOf(Object.values(memoTrainingUtils.MemoEvent)),
    mode: PropTypes.oneOf(Object.values(memoTrainingUtils.TrainingMode)),
    phase: PropTypes.oneOf(Object.values(memoTrainingUtils.TrainingPhase)).isRequired,

    decks: PropTypes.array.isRequired,
    solution: PropTypes.array.isRequired,

    deckInd: PropTypes.number.isRequired,
    pairInd: PropTypes.number.isRequired,

    // handDict: PropTypes.object.isRequired,
    // handSuits: PropTypes.array.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    // setDeckSize: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,
    sagaFinishMemorizationPhase: PropTypes.func.isRequired,
    sagaFinishRecallPhase: PropTypes.func.isRequired,

    sagaGoToNextPair: PropTypes.func.isRequired,
    sagaGoToPrevPair: PropTypes.func.isRequired,
    sagaGoToDeckHead: PropTypes.func.isRequired,
    sagaGoToNextDeck: PropTypes.func.isRequired,

    sagaUpdateMbldSolution: PropTypes.func.isRequired,

    sagaToggleTimer: PropTypes.func.isRequired,

    sagaOnKeyDown: PropTypes.func.isRequired,

    toggleShortcutModal: PropTypes.func.isRequired,
};

export default MemoTrainingMbldTemplate;
