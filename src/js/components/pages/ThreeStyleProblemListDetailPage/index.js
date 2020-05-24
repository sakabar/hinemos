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
import ThreeStyleProblemListDetailTemplate from '../../templates/ThreeStyleProblemListDetailTemplate';
import {
    // inputLetters,
    // changeRadioMatch,
    // changeSelectAll,
    // sagaSearchAlgorithms,
    // selectAlg,

    threeStyleProblemListDetailReducer,
    rootSaga,
} from '../../../modules/threeStyleProblemListDetail';

const mapStateToProps = ({
    part,
    letters,
    radioMatch,
    radioOrder,
    checkSelectAll,
    threeStyleQuizProblemListDetail,
}) => {
    return {
        part,
        letters,
        radioMatch,
        radioOrder,
        checkSelectAll,
        threeStyleQuizProblemListDetail,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
    };
};

const sagaMiddleware = createSagaMiddleware();
const store = createStore(threeStyleProblemListDetailReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

const Conn = connect(mapStateToProps, mapDispatchToProps)(ThreeStyleProblemListDetailTemplate);

const ThreeStyleProblemListDetailPage = (props) => (
    <Provider store={store}>
        <Conn />
    </Provider>
);

export default ThreeStyleProblemListDetailPage;
