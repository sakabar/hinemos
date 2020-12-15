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
import MemoTrainingCardsTemplate from '../../templates/MemoTrainingCardsTemplate';
import {
    setDeckNum,
    setDeckSize,
    setPairSize,
    setIsLefty,
    setHandSuits,

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

    isOpenMemoShortcutModal,

    trialId,
    deckElementList,
    switchedPairMiliUnixtime,

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
    posInd,

    handDict,
    handSuits,
}) => {
    return {
        userName,
        startMemoMiliUnixtime,
        startRecallMiliUnixtime,
        timerMiliUnixtime,
        timeVisible,
        isLefty,

        isOpenMemoShortcutModal,

        trialId,
        deckElementList,
        switchedPairMiliUnixtime,

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
        posInd,

        handDict,
        handSuits,
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
        setPairSize: (pairSize) => {
            dispatch(setPairSize({ pairSize, }));
        },
        setIsLefty: (isLefty) => {
            dispatch(setIsLefty({ isLefty, }));
        },
        setHandSuits: (handSuits) => {
            // FIXME 文字列("C,D,H,S")から配列への変換をここでやっているので注意
            dispatch(setHandSuits({ handSuits: handSuits.split(','), }));
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
            dispatch(sagaStartMemorizationPhase({ deckNum, deckSize, pairSize, memoEvent: memoTrainingUtils.MemoEvent.cards, mode, }));
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
    };
};

const sagaMiddleware = createSagaMiddleware();
const store = createStore(memoTrainingReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

const Conn = connect(mapStateToProps, mapDispatchToProps)(MemoTrainingCardsTemplate);

const MemoTrainingCardsPage = () => (
    <Provider store={store}>
        <Conn/>
    </Provider>
);

export default MemoTrainingCardsPage;
