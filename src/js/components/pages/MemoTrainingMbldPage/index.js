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
    setPairSize,

    sagaGoToNextPair,
    sagaGoToPrevPair,
    sagaGoToNextDeck,
    sagaGoToDeckHead,

    sagaStartMemorizationPhase,
    finishMemorizationPhase,
    sagaFinishRecallPhase,

    updateSolution,

    memoTrainingReducer,
    rootSaga,
} from '../../../modules/memoTraining';
const memoTrainingUtils = require('../../../memoTrainingUtils');

const mapStateToProps = ({
    userName,
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
}) => {
    return {
        userName,
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
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setDeckNum: (deckNum) => {
            dispatch(setDeckNum({ deckNum, }));
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
        sagaStartMemorizationPhase: (currentMiliUnixtime, deckNum, deckSize, pairSize, mode) => {
            dispatch(sagaStartMemorizationPhase({ currentMiliUnixtime, deckNum, deckSize, pairSize, memoEvent: memoTrainingUtils.MemoEvent.mbld, mode, }));
        },
        finishMemorizationPhase: () => {
            dispatch(finishMemorizationPhase());
        },
        sagaFinishRecallPhase: () => {
            dispatch(sagaFinishRecallPhase());
        },
        updateSolution: (deckInd, pairInd, input) => {
            const payload = {
                deckInd,
                pairInd,
                input,
            };
            dispatch(updateSolution(payload));
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
