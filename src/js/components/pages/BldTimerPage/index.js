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
    markAsSolved,
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
    sectionResults,
    timerCount,
    timerState,
}) => {
    return {
        moveHistoryStr,
        sectionResults,
        timerCount,
        timerState,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        markAsSolved: () => {
            dispatch(markAsSolved());
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
