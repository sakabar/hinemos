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
    inputTitles,
    sagaLoadThreeStyleQuizProblemList,
    sagaCreateProblemLists,

    threeStyleProblemListReducer,
    rootSaga,
} from '../../../modules/threeStyleProblemList';

const mapStateToProps = ({
    url,
    part,
    userName,
    titles,
    problemLists,
}) => {
    return {
        url,
        part,
        userName,
        titles,
        problemLists,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        inputTitles: (titles) => {
            dispatch(inputTitles({ titles, }));
        },
        sagaLoadThreeStyleQuizProblemList: (url) => {
            dispatch(sagaLoadThreeStyleQuizProblemList({ url, }));
        },
        sagaCreateProblemLists: () => {
            dispatch(sagaCreateProblemLists());
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
