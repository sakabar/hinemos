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

    sagaGoToNextPair,
    sagaGoToPrevPair,
    sagaGoToNextDeck,
    sagaGoToDeckHead,

    sagaStartMemorizationPhase,
    sagaFinishMemorizationPhase,
    sagaFinishRecallPhase,

    sagaToggleTimer,

    sagaOnKeyDown,

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

    handDict,
    handSuits,
}) => {
    return {
        userName,
        startMemoMiliUnixtime,
        startRecallMiliUnixtime,
        timerMiliUnixtime,
        timeVisible,

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
