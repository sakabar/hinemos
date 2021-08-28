import React from 'react';
import {
    connect,
    Provider,
} from 'react-redux';
import {
    createStore,
    applyMiddleware,
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import MemoTrainingNumbersTemplate from '../../templates/MemoTrainingNumbersTemplate';
import {
    setDeckNum,
    setDeckSize,
    setDigitsPerImage,
    setPairSize,

    setIsLefty,
    setIsUniqInDeck,

    sagaGoToNextPair,
    sagaGoToPrevPair,
    sagaGoToNextDeck,
    sagaGoToDeckHead,

    sagaStartMemorizationPhase,
    sagaFinishMemorizationPhase,
    sagaFinishRecallPhase,

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

    inputNumbersDelimiter,

    memoTrainingReducer,
    rootSaga,
} from '../../../modules/memoTraining';
const memoTrainingUtils = require('../../../memoTrainingUtils');

const mapStateToProps = ({
    userName,
    startMemoMiliUnixtime,
    startRecallMiliUnixtime,
    timerMiliUnixtime,
    timeVisible,
    isLefty,
    isUniqInDeck,

    isOpenMemoShortcutModal,

    trialId,
    deckElementList,
    switchedPairMiliUnixtime,

    deckNum,
    deckSize,
    digitsPerImage,
    pairSize,
    numbersDelimiter,

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
}) => {
    return {
        userName,
        startMemoMiliUnixtime,
        startRecallMiliUnixtime,
        timerMiliUnixtime,
        timeVisible,
        isLefty,
        isUniqInDeck,

        isOpenMemoShortcutModal,

        trialId,
        deckElementList,
        switchedPairMiliUnixtime,

        deckNum,
        deckSize,
        digitsPerImage,
        pairSize,
        numbersDelimiter,

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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setDeckNum: (deckNum) => {
            dispatch(setDeckNum({ deckNum, }));
        },
        setDeckSize: (deckSize) => {
            dispatch(setDeckSize({ deckSize, }));
        },
        setDigitsPerImage: (digitsPerImage) => {
            dispatch(setDigitsPerImage({ digitsPerImage, }));
        },
        setPairSize: (pairSize) => {
            dispatch(setPairSize({ pairSize, }));
        },
        setIsLefty: (isLefty) => {
            dispatch(setIsLefty({ isLefty, }));
        },
        setIsUniqInDeck: (isUniqInDeck) => {
            dispatch(setIsUniqInDeck({ isUniqInDeck, }));
        },
        setPoorDeckNum: (poorDeckNum) => {
            dispatch(setPoorDeckNum({ poorDeckNum, }));
        },
        setPoorKey: (poorKey) => {
            dispatch(setPoorKey({ poorKey, }));
        },
        setStartDate: (dateStr) => {
            dispatch(setStartDate({ startDate: dateStr, }));
        },
        setEndDate: (dateStr) => {
            dispatch(setEndDate({ endDate: dateStr, }));
        },
        sagaGoToNextPair: () => {
            dispatch(sagaGoToNextPair());
        },
        sagaGoToPrevPair: () => {
            dispatch(sagaGoToPrevPair());
        },
        sagaGoToDeckHead: () => {
            dispatch(sagaGoToDeckHead());
        },
        sagaGoToNextDeck: () => {
            dispatch(sagaGoToNextDeck());
        },
        sagaStartMemorizationPhase: (deckNum, deckSize, pairSize, mode) => {
            dispatch(sagaStartMemorizationPhase({ deckNum, deckSize, pairSize, memoEvent: memoTrainingUtils.MemoEvent.numbers, mode, }));
        },
        sagaFinishMemorizationPhase: () => {
            dispatch(sagaFinishMemorizationPhase());
        },
        sagaFinishRecallPhase: () => {
            dispatch(sagaFinishRecallPhase());
        },
        // updateSolution: (deckInd, pairInd, input) => {
        //     const payload = {
        //         deckInd,
        //         pairInd,
        //         input,
        //     };
        //     dispatch(updateSolution(payload));
        // },
        sagaToggleTimer: () => {
            dispatch(sagaToggleTimer());
        },
        sagaOnKeyDown: (e) => {
            dispatch(sagaOnKeyDown(e));
        },
        toggleShortcutModal: (newIsOpen) => {
            dispatch(toggleShortcutModal({ newIsOpen, }));
        },
        selectHole: (holeDeckInd, holePairInd, holePosInd) => {
            dispatch(selectHole({ holeDeckInd, holePairInd, holePosInd, }));
        },
        goToPrevDeckRecall: () => {
            dispatch(goToPrevDeckRecall());
        },
        goToNextDeckRecall: () => {
            dispatch(goToNextDeckRecall());
        },
        sagaSelectHand: (element) => {
            dispatch(sagaSelectHand({ element, }));
        },
        inputNumbersDelimiter: (numbersDelimiter) => {
            dispatch(inputNumbersDelimiter({ numbersDelimiter, }));
        },
    };
};

const sagaMiddleware = createSagaMiddleware();
const store = createStore(memoTrainingReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

const Conn = connect(mapStateToProps, mapDispatchToProps)(MemoTrainingNumbersTemplate);

const MemoTrainingNumbersPage = () => (
    <Provider store={store}>
        <Conn/>
    </Provider>
);

export default MemoTrainingNumbersPage;
