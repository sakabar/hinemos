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
import NumberingTemplate from '../../templates/NumberingTemplate';
import {
    updateNumbering,
    // setLoadWillSkipped,
    // selectAlgorithm,
    // sagaLoadInitially,
    // selectProblemList,
    // sagaAddToProblemList,
    // toggleSelectAll,
    // sagaSortTable,

    numberingReducer,
    rootSaga,
} from '../../../modules/numbering';

const mapStateToProps = ({
    loadWillSkipped,
    userName,
    numbering,
}) => {
    return {
        loadWillSkipped,
        userName,
        numbering,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateNumbering: (partName, sticker, letter) => {
            const payload = {
                partName,
                sticker,
                letter,
            };
            dispatch(updateNumbering(payload));
        },
    };
};

const sagaMiddleware = createSagaMiddleware();
const store = createStore(numberingReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

const Conn = connect(mapStateToProps, mapDispatchToProps)(NumberingTemplate);

const NumberingPage = (props) => (
    <Provider store={store}>
        <Conn />
    </Provider>
);

export default NumberingPage;
