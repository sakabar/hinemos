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
import MemoTrainingMbldTemplate from '../../templates/MemoTrainingMbldTemplate';
import {
    setDeckNum,
    // setDeckSize,
    setPairSize,

    sagaGoToNextPair,
    sagaGoToPrevPair,
    sagaGoToNextDeck,
    sagaGoToDeckHead,

    sagaStartMemorizationPhase,
    sagaFinishMemorizationPhase,
    sagaFinishRecallPhase,

    updateMbldSolution,

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
    deckNum,
    pairSize,
    memoEvent,
    mode,
    phase,
    decks,
    solution,
    deckInd,
    pairInd,
}) => {
    return {
        userName,
        startMemoMiliUnixtime,
        startRecallMiliUnixtime,
        timerMiliUnixtime,
        timeVisible,
        deckNum,
        pairSize,
        memoEvent,
        mode,
        phase,
        decks,
        solution,
        deckInd,
        pairInd,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setDeckNum: (deckNum) => {
            dispatch(setDeckNum({ deckNum, }));
        },
        // setDeckSize: (deckSize) => {
        //     dispatch(setDeckSize({ deckSize, }));
        // },
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
            dispatch(sagaStartMemorizationPhase({ deckNum, deckSize, pairSize, memoEvent: memoTrainingUtils.MemoEvent.mbld, mode, }));
        },
        sagaFinishMemorizationPhase: () => {
            dispatch(sagaFinishMemorizationPhase());
        },
        sagaFinishRecallPhase: () => {
            dispatch(sagaFinishRecallPhase());
        },
        updateMbldSolution: (deckInd, pairInd, pairSize, pairStr) => {
            const payload = {
                deckInd,
                pairInd,
                pairSize,
                pairStr,
            };
            dispatch(updateMbldSolution(payload));
        },
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

const Conn = connect(mapStateToProps, mapDispatchToProps)(MemoTrainingMbldTemplate);

const MemoTrainingMbldPage = () => (
    <Provider store={store}>
        <Conn/>
    </Provider>
);

export default MemoTrainingMbldPage;
