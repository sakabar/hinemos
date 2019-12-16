import React from 'react';
import {
    Link,
} from 'react-router-dom';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Txt from '../../atoms/Txt';
import Header from '../../organisms/Header';
import MemoTrainingMbldSetting from '../../organisms/MemoTrainingMbldSetting';
import MemoTrainingMbldMemorization from '../../organisms/MemoTrainingMbldMemorization';
import MemoTrainingMbldRecall from '../../organisms/MemoTrainingMbldRecall';
const memoTrainingUtils = require('../../../memoTrainingUtils');
const config = require('../../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

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

        sagaStartMemorizationMode,
        sagaStartTransformationMode,
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
                        return (<MemoTrainingMbldSetting deckNum={deckNum} pairSize={pairSize} setDeckNum={setDeckNum} setPairSize={setPairSize} sagaStartMemorizationMode={sagaStartMemorizationMode} sagaStartTransformationMode={sagaStartTransformationMode}/>);
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

export default MemoTrainingMbldTemplate;
