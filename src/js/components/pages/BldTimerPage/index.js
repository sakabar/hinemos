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
import BldTimerTemplate from '../../templates/BldTimerTemplate';
import {
    analyzeMoveHistory,
    // moveCube,
    requestConnectCube,
    updateMoveHistory,
    startSolve,
    keyDown,
    keyUp,
    bldTimerReducer,
    rootSaga,
} from '../../../modules/bldTimer';

const mapStateToProps = ({
    moveHistoryStr,
    scrambles,
    scramblesIndex,
    compared,
    mutableScramble,
    sectionResults,
    timerCount,
    timerState,
    lastModified,
    solveStartMiliUnixtime,
    memorizeDoneMiliUnixtime,
    solveDoneMiliUnixtime,
}) => {
    return {
        moveHistoryStr,
        scrambles,
        scramblesIndex,
        compared,
        mutableScramble,
        sectionResults,
        timerCount,
        timerState,
        lastModified,
        solveStartMiliUnixtime,
        memorizeDoneMiliUnixtime,
        solveDoneMiliUnixtime,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        markAsSolved: (miliUnixtime) => {
            dispatch(updateMoveHistory({value: '', miliUnixtime, }));
        },
        moveCube: () => {
            dispatch(moveCube());
        },
        requestConnectCube: () => {
            dispatch(requestConnectCube());
        },
        analyzeMoveHistory: () => {
            dispatch(analyzeMoveHistory());
        },
        updateMoveHistory: (s) => {
            dispatch(updateMoveHistory(s));
        },
        keyDown: (e) => {
            dispatch(keyDown(e));
        },
        keyUp: (e) => {
            dispatch(keyUp(e));
        },
    };
};

const sagaMiddleware = createSagaMiddleware();
const store = createStore(bldTimerReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

const Conn = connect(mapStateToProps, mapDispatchToProps)(BldTimerTemplate);

const BldTimerPage = (props) => (
    <Provider store={store}>
        <Conn />
    </Provider>
);

export default BldTimerPage;
