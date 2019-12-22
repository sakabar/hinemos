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
        startMiliUnixtime,
        deckNum,
        pairSize,
        memoEvent,
        mode,
        phase,
        decks,
        solution,

        deckInd,
        pairInd,

        setDeckNum,
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
        <Header title="MemoTraining MBLD" />

        <main>
            {
                (() => {
                    if (phase === memoTrainingUtils.TrainingPhase.setting) {
                        return (<MemoTrainingMbldSetting deckNum={deckNum} pairSize={pairSize} setDeckNum={setDeckNum} setPairSize={setPairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.memorization) {
                        return (<MemoTrainingMbldMemorization decks={decks} deckInd={deckInd} pairInd={pairInd} finishMemorizationPhase={finishMemorizationPhase} sagaGoToNextPair={sagaGoToNextPair} sagaGoToPrevPair={sagaGoToPrevPair} sagaGoToDeckHead={sagaGoToDeckHead} sagaGoToNextDeck={sagaGoToNextDeck}/>);
                    } else if (phase === memoTrainingUtils.TrainingPhase.recall) {
                        return (<MemoTrainingMbldRecall decks={decks} solution={solution} sagaFinishRecallPhase={sagaFinishRecallPhase} updateSolution={updateSolution}/>);
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

// <a href="https://www.ac-illust.com/main/profile.php?id=OLC8qIlx&amp;area=1">johan</a>さんによる<a href="https://www.ac-illust.com/">イラストAC</a>からのイラスト

MemoTrainingMbldTemplate.propTypes = {
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

export default MemoTrainingMbldTemplate;
