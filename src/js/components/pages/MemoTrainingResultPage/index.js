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
// import {
//     // rootSaga,
// } from '../../../modules/memoTraining';

// const mapStateToProps = ({
//     dummy
// }) => {
//     return {
//         dummy
//     };
// };

// const mapDispatchToProps = (dispatch) => {
//     return {
//     };
// }

// const sagaMiddleware = createSagaMiddleware();
// const store = createStore(memoTrainingReducer, applyMiddleware(sagaMiddleware));
// sagaMiddleware.run(rootSaga);

// const Conn = connect(mapStateToProps, mapDispatchToProps)(MemoTrainingResultTemplate);

// const MemoTrainingResultPage = () => (
//     <Provider store={store}>
//         <Conn/>
//     </Provider>
// );

const MemoTrainingResultPage = () => (
    <MemoTrainingResultTemplate />
);

export default MemoTrainingResultPage;
