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
    selectAlgorithm,
    sagaLoadThreeStyleQuizProblemListDetail,

    threeStyleProblemListDetailReducer,
    rootSaga,
} from '../../../modules/threeStyleProblemListDetail';

const mapStateToProps = ({
    url,
    part,
    userName,
    problemListId,
    isCheckedSelectAll,
    threeStyleQuizProblemListDetail,
}) => {
    return {
        url,
        part,
        userName,
        problemListId,
        isCheckedSelectAll,
        threeStyleQuizProblemListDetail,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectAlgorithm: (ind, newIsSelected) => {
            dispatch(selectAlgorithm({ ind, newIsSelected, }));
        },
        sagaLoadThreeStyleQuizProblemListDetail: (url) => {
            dispatch(sagaLoadThreeStyleQuizProblemListDetail({ url, }));
        },
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
