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
    sagaCreateProblemLists,

    threeStyleProblemListReducer,
    rootSaga,
} from '../../../modules/threeStyleProblemList';


// const mapStateToProps = ({
//     problemListIds,
// }) => {
//     return {
//         problemListIds,
//     };
// };

const mapDispatchToProps = (dispatch) => {
    return {
        sagaCreateProblemLists (listNames) {
            dispatch(sagaCreateProblemLists({ listNames, });)
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
