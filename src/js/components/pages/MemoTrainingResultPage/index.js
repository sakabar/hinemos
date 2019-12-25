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
    memoTrainingResultReducer,
    rootSaga,
} from '../../../modules/memoTrainingResult';
const memoTrainingUtils = require('../../../memoTrainingUtils');

const mapStateToProps = ({
dummy
}) => {
    return {
dummy
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    aaaaAction: () => {
            dispatch(aaaaAction());
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
