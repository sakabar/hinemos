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
    setLoadWillSkipped,
    selectAlgorithm,
    sagaLoadInitially,
    selectProblemList,
    sagaAddToProblemList,
    toggleAddAncestors,
    toggleSelectAll,
    sagaSortTable,

    threeStyleProblemListDetailReducer,
    rootSaga,
} from '../../../modules/threeStyleProblemListDetail';

const mapStateToProps = ({
    url,
    loadWillSkipped,
    part,
    userName,
    problemListId,
    isCheckedAddAncestors,
    isCheckedSelectAll,
    threeStyleQuizProblemLists,
    selectedThreeStyleQuizListId,
    threeStyleQuizProblemListDetail,
    threeStyleQuizProblemListDetailIndsStr,
}) => {
    return {
        url,
        loadWillSkipped,
        part,
        userName,
        problemListId,
        isCheckedAddAncestors,
        isCheckedSelectAll,
        threeStyleQuizProblemLists,
        selectedThreeStyleQuizListId,
        threeStyleQuizProblemListDetail,
        threeStyleQuizProblemListDetailIndsStr,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setLoadWillSkipped: (loadWillSkipped) => {
            dispatch(setLoadWillSkipped({ loadWillSkipped, }));
        },
        selectAlgorithm: (pInd, newIsSelected) => {
            dispatch(selectAlgorithm({ pInd, newIsSelected, }));
        },
        sagaLoadInitially: (url) => {
            dispatch(sagaLoadInitially({ url, }));
        },
        selectProblemList: (selectedProblemListId) => {
            dispatch(selectProblemList({ selectedProblemListId, }));
        },
        sagaAddToProblemList: () => {
            dispatch(sagaAddToProblemList());
        },
        toggleAddAncestors: () => {
            dispatch(toggleAddAncestors());
        },
        toggleSelectAll: () => {
            dispatch(toggleSelectAll());
        },
        sagaSortTable: (dKey, nAsc) => {
            dispatch(sagaSortTable({ dKey, nAsc, }));
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
