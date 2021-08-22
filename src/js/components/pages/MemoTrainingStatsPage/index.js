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
import MemoTrainingStatsTemplate from '../../templates/MemoTrainingStatsTemplate';
import {
    sagaFetchStats,

    memoTrainingStatsReducer,
    rootSaga,
} from '../../../modules/memoTrainingStats';
// const memoTrainingUtils = require('../../../memoTrainingUtils');

const mapStateToProps = ({
    event,
    startDate,
    endDate,
    stats,
    scores,
    elementIdToElement,
}) => {
    return {
        event,
        startDate,
        endDate,
        stats,
        scores,
        elementIdToElement,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sagaFetchStats: (event, startDate, endDate) => {
            dispatch(sagaFetchStats({ event, startDate, endDate, }));
        },
    };
};

const sagaMiddleware = createSagaMiddleware();
const store = createStore(memoTrainingStatsReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

const Conn = connect(mapStateToProps, mapDispatchToProps)(MemoTrainingStatsTemplate);

const MemoTrainingStatsPage = () => (
    <Provider store={store}>
        <Conn/>
    </Provider>
);

export default MemoTrainingStatsPage;
