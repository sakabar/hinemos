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
    sagaLoadNumbering,
    setLoadWillSkipped,
    sagaSaveNumbering,

    numberingReducer,
    rootSaga,
} from '../../../modules/numbering';

const mapStateToProps = ({
    loadWillSkipped,
    userName,
    numbering,
    wingEdgeSystem,
}) => {
    return {
        loadWillSkipped,
        userName,
        numbering,
        wingEdgeSystem,
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

        sagaLoadNumbering: () => {
            dispatch(sagaLoadNumbering());
        },
        setLoadWillSkipped: (loadWillSkipped) => {
            dispatch(setLoadWillSkipped({ loadWillSkipped, }));
        },
        sagaSaveNumbering: () => {
            dispatch(sagaSaveNumbering());
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
