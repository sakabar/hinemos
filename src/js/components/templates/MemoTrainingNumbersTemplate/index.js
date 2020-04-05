import React from 'react';
import PropTypes from 'prop-types';
import Txt from '../../atoms/Txt';
import Header from '../../organisms/Header';
import MemoTrainingNumbersSetting from '../../organisms/MemoTrainingNumbersSetting';
import MemoTrainingNumbersMemorization from '../../organisms/MemoTrainingNumbersMemorization';
import MemoTrainingNumbersRecall from '../../organisms/MemoTrainingNumbersRecall';
const memoTrainingUtils = require('../../../memoTrainingUtils');

const MemoTrainingNumbersTemplate = (
    {
        startMemoMiliUnixtime,
        startRecallMiliUnixtime,
        timerMiliUnixtime,
        timeVisible,

        deckNum,
        deckSize,
        digitsPerImage,
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

        setDeckNum,
        setDeckSize,
        setDigitsPerImage,
        setPairSize,
        setIsLefty,

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
    }
) => (
    <div>
        <Header title="MemoTraining Numbers" />
        <main className="memoTraining__main" tabIndex="-1" onKeyDown={ (e) => { sagaOnKeyDown(e); } } >
            {
                (() => {
                    if (phase === memoTrainingUtils.TrainingPhase.setting) {
                        return (<MemoTrainingNumbersSetting deckNum={deckNum} deckSize={deckSize} digitsPerImage={digitsPerImage} pairSize={pairSize} isLefty={isLefty} isOpenMemoShortcutModal={isOpenMemoShortcutModal} setDeckNum={setDeckNum} setDeckSize={setDeckSize} setDigitsPerImage={setDigitsPerImage} setPairSize={setPairSize} setIsLefty={setIsLefty} sagaStartMemorizationPhase={sagaStartMemorizationPhase} toggleShortcutModal={toggleShortcutModal}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.memorization) {
                        return (<MemoTrainingNumbersMemorization startMemoMiliUnixtime={startMemoMiliUnixtime} startRecallMiliUnixtime={startRecallMiliUnixtime} timerMiliUnixtime={timerMiliUnixtime} timeVisible={timeVisible} isLefty={isLefty} decks={decks} deckInd={deckInd} pairInd={pairInd} sagaFinishMemorizationPhase={sagaFinishMemorizationPhase} sagaGoToNextPair={sagaGoToNextPair} sagaGoToPrevPair={sagaGoToPrevPair} sagaGoToDeckHead={sagaGoToDeckHead} sagaGoToNextDeck={sagaGoToNextDeck} sagaToggleTimer={sagaToggleTimer}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.recall) {
                        return (<MemoTrainingNumbersRecall timerMiliUnixtime={timerMiliUnixtime} timeVisible={timeVisible} isLefty={isLefty} decks={decks} deckInd={deckInd} pairInd={pairInd} posInd={posInd} solution={solution} handDict={handDict} handSuits={handSuits} sagaFinishRecallPhase={sagaFinishRecallPhase} selectHole={selectHole} goToPrevDeckRecall={goToPrevDeckRecall} goToNextDeckRecall={goToNextDeckRecall} sagaSelectHand={sagaSelectHand} sagaToggleTimer={sagaToggleTimer} />);
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

MemoTrainingNumbersTemplate.propTypes = {
    startMemoMiliUnixtime: PropTypes.number.isRequired,
    startRecallMiliUnixtime: PropTypes.number.isRequired,
    timerMiliUnixtime: PropTypes.number.isRequired,
    timeVisible: PropTypes.bool.isRequired,

    isLefty: PropTypes.bool.isRequired,

    isOpenMemoShortcutModal: PropTypes.bool.isRequired,

    deckNum: PropTypes.number.isRequired,
    deckSize: PropTypes.number,
    digitsPerImage: PropTypes.number,
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

    setDeckNum: PropTypes.func.isRequired,
    setDeckSize: PropTypes.func.isRequired,
    setDigitsPerImage: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,
    setIsLefty: PropTypes.func.isRequired,

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
};

export default MemoTrainingNumbersTemplate;
