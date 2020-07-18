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
import ThreeStyleProblemListTemplate from '../../templates/ThreeStyleProblemListTemplate';
import {
    setLoadWillSkipped,
    inputTitles,
    sagaLoadThreeStyleQuizProblemList,
    sagaCreateProblemLists,
    sagaSortTable,
    selectRow,
    sagaDeleteProblemLists,
    toggleSelectAll,

    threeStyleProblemListReducer,
    rootSaga,
} from '../../../modules/threeStyleProblemList';

const mapStateToProps = ({
    url,
    loadWillSkipped,
    part,
    userName,
    titles,
    problemLists,
}) => {
    return {
        url,
        loadWillSkipped,
        part,
        userName,
        titles,
        problemLists,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setLoadWillSkipped: (loadWillSkipped) => {
            dispatch(setLoadWillSkipped({ loadWillSkipped, }));
        },
        inputTitles: (titles) => {
            dispatch(inputTitles({ titles, }));
        },
        sagaLoadThreeStyleQuizProblemList: (url) => {
            dispatch(sagaLoadThreeStyleQuizProblemList({ url, }));
        },
        sagaCreateProblemLists: () => {
            dispatch(sagaCreateProblemLists());
        },
        sagaSortTable: (dKey, nAsc) => {
            dispatch(sagaSortTable({ dKey, nAsc, }));
        },
        selectRow: (pInd, newIsSelected) => {
            dispatch(selectRow({ pInd, newIsSelected, }));
        },
        sagaDeleteProblemLists: () => {
            dispatch(sagaDeleteProblemLists());
        },
        toggleSelectAll: () => {
            dispatch(toggleSelectAll());
        },
    };
};

const sagaMiddleware = createSagaMiddleware();
const store = createStore(threeStyleProblemListReducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

const Conn = connect(mapStateToProps, mapDispatchToProps)(ThreeStyleProblemListTemplate);

const ThreeStyleProblemListPage = () => (
    <Provider store={store}>
        <Conn />
    </Provider>
);

export default ThreeStyleProblemListPage;
