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
    setBo5TooltipIsOpen,
    setAo5TooltipIsOpen,
    setScoresComponentTooltipIsOpen,

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
    isOpenBo5Tooltip,
    isOpenAo5Tooltip,
    isOpenScoresComponentTooltip,
}) => {
    return {
        event,
        startDate,
        endDate,
        stats,
        scores,
        elementIdToElement,
        isOpenBo5Tooltip,
        isOpenAo5Tooltip,
        isOpenScoresComponentTooltip,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sagaFetchStats: (event, startDate, endDate) => {
            dispatch(sagaFetchStats({ event, startDate, endDate, }));
        },
        setBo5TooltipIsOpen: (newIsOpenBo5Tooltip) => {
            dispatch(setBo5TooltipIsOpen({ newIsOpenBo5Tooltip, }));
        },
        setAo5TooltipIsOpen: (newIsOpenAo5Tooltip) => {
            dispatch(setAo5TooltipIsOpen({ newIsOpenAo5Tooltip, }));
        },
        setScoresComponentTooltipIsOpen: (newIsOpenScoresComponentTooltip) => {
            dispatch(setScoresComponentTooltipIsOpen({ newIsOpenScoresComponentTooltip, }));
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
