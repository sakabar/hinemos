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

    memoTrainingResultReducer,
    rootSaga,
} from '../../../modules/memoTrainingResult';
// const memoTrainingUtils = require('../../../memoTrainingUtils');

const mapStateToProps = ({
    event,
    mode,
    scores,
}) => {
    return {
        event,
        mode,
        scores,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        sagaFetchScores: (event, mode) => {
            dispatch(sagaFetchScores({ event, mode, }));
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
