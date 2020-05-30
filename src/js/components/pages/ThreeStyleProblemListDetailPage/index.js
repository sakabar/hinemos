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
    // sagaSearchAlgorithms,
    selectAlgorithm,
    sagaLoadThreeStyleQuizProblemListDetail,
    selectProblemList,
    sagaAddToProblemList,
    toggleSelectAll,

    threeStyleProblemListDetailReducer,
    rootSaga,
} from '../../../modules/threeStyleProblemListDetail';

const mapStateToProps = ({
    url,
    part,
    userName,
    problemListId,
    isCheckedSelectAll,
    threeStyleQuizProblemLists,
    selectedThreeStyleQuizListId,
    threeStyleQuizProblemListDetail,
}) => {
    return {
        url,
        part,
        userName,
        problemListId,
        isCheckedSelectAll,
        threeStyleQuizProblemLists,
        selectedThreeStyleQuizListId,
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
        selectProblemList: (selectedProblemListId) => {
            dispatch(selectProblemList({ selectedProblemListId, }));
        },
        sagaAddToProblemList: () => {
            dispatch(sagaAddToProblemList());
        },
        toggleSelectAll: () => {
            dispatch(toggleSelectAll());
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
