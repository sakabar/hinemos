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
        isLefty,

        isOpenMemoShortcutModal,

        memoEvent,
        mode,

        phase,
        decks,
        solution,

        deckInd,
        pairInd,
        posInd,

        handDict,
        handSuits,

        poorDeckNum,
        poorKey,
        startDate,
        endDate,

        setDeckNum,
        setDeckSize,
        setPairSize,
        setIsLefty,
        setHandSuits,

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

        toggleShortcutModal,

        selectHole,
        goToPrevDeckRecall,
        goToNextDeckRecall,
        sagaSelectHand,

        setPoorDeckNum,
        setPoorKey,
        setStartDate,
        setEndDate,
    }
) => (
    <div>
        <Header title="MemoTraining Cards" />
        <main className="memoTraining__main" tabIndex="-1" onKeyDown={ (e) => { sagaOnKeyDown(e); } } >
            {
                (() => {
                    if (phase === memoTrainingUtils.TrainingPhase.setting) {
                        return (<MemoTrainingCardsSetting deckNum={deckNum} deckSize={deckSize} pairSize={pairSize} isLefty={isLefty} handSuits={handSuits} isOpenMemoShortcutModal={isOpenMemoShortcutModal} poorDeckNum={poorDeckNum} poorKey={poorKey} startDate={startDate} endDate={endDate} setDeckNum={setDeckNum} setDeckSize={setDeckSize} setPairSize={setPairSize} setIsLefty={setIsLefty} setHandSuits={setHandSuits} sagaStartMemorizationPhase={sagaStartMemorizationPhase} toggleShortcutModal={toggleShortcutModal} setPoorDeckNum={setPoorDeckNum} setPoorKey={setPoorKey} setStartDate={setStartDate} setEndDate={setEndDate} />);
                    } else if (phase === memoTrainingUtils.TrainingPhase.memorization) {
                        return (<MemoTrainingCardsMemorization startMemoMiliUnixtime={startMemoMiliUnixtime} startRecallMiliUnixtime={startRecallMiliUnixtime} timerMiliUnixtime={timerMiliUnixtime} timeVisible={timeVisible} isLefty={isLefty} decks={decks} deckInd={deckInd} pairInd={pairInd} sagaFinishMemorizationPhase={sagaFinishMemorizationPhase} sagaGoToNextPair={sagaGoToNextPair} sagaGoToPrevPair={sagaGoToPrevPair} sagaGoToDeckHead={sagaGoToDeckHead} sagaGoToNextDeck={sagaGoToNextDeck} sagaToggleTimer={sagaToggleTimer}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.recall) {
                        return (<MemoTrainingCardsRecall timerMiliUnixtime={timerMiliUnixtime} startMemoMiliUnixtime={startMemoMiliUnixtime} startRecallMiliUnixtime={startRecallMiliUnixtime} timeVisible={timeVisible} isLefty={isLefty} decks={decks} deckInd={deckInd} pairInd={pairInd} posInd={posInd} solution={solution} handDict={handDict} handSuits={handSuits} sagaFinishRecallPhase={sagaFinishRecallPhase} selectHole={selectHole} goToPrevDeckRecall={goToPrevDeckRecall} goToNextDeckRecall={goToNextDeckRecall} sagaSelectHand={sagaSelectHand} sagaToggleTimer={sagaToggleTimer} />);
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

    isLefty: PropTypes.bool.isRequired,

    isOpenMemoShortcutModal: PropTypes.bool.isRequired,

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
    posInd: PropTypes.number.isRequired,

    handDict: PropTypes.object.isRequired,
    handSuits: PropTypes.array.isRequired,

    poorDeckNum: PropTypes.number.isRequired,
    poorKey: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setDeckSize: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,
    setIsLefty: PropTypes.func.isRequired,
    setHandSuits: PropTypes.func.isRequired,

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

    toggleShortcutModal: PropTypes.func.isRequired,

    selectHole: PropTypes.func.isRequired,
    goToPrevDeckRecall: PropTypes.func.isRequired,
    goToNextDeckRecall: PropTypes.func.isRequired,
    sagaSelectHand: PropTypes.func.isRequired,

    setPoorDeckNum: PropTypes.func.isRequired,
    setPoorKey: PropTypes.func.isRequired,
    setStartDate: PropTypes.func.isRequired,
    setEndDate: PropTypes.func.isRequired,
};

export default MemoTrainingCardsTemplate;
