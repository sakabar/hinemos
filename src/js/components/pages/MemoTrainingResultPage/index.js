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
import MemoTrainingResultTemplate from '../../templates/MemoTrainingResultTemplate';
import {
    sagaFetchScores,
    sagaDecideTrial,

    memoTrainingResultReducer,
    rootSaga,
} from '../../../modules/memoTrainingResult';
// const memoTrainingUtils = require('../../../memoTrainingUtils');

const mapStateToProps = ({
    event,
    mode,
    scores,
    memoLogs,
    recallLogs,
    trialId,
    elementIdToElement,
}) => {
    return {
        event,
        mode,
        scores,
        memoLogs,
        recallLogs,
        trialId,
        elementIdToElement,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sagaFetchScores: (event, mode, trialId) => {
            dispatch(sagaFetchScores({ event, mode, trialId, }));
        },
        sagaDecideTrial: (trialId) => {
            dispatch(sagaDecideTrial({ trialId, }));
        },
    };
};

const sagaMiddleware = createSagaMiddleware();
const store = createStore(memoTrainingResultReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

const Conn = connect(mapStateToProps, mapDispatchToProps)(MemoTrainingResultTemplate);

const MemoTrainingResultPage = () => (
    <Provider store={store}>
        <Conn/>
    </Provider>
);

export default MemoTrainingResultPage;
