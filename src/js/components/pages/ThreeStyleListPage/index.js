import React from 'react';
import { connect, Provider } from 'react-redux';
import { createStore } from 'redux';
import ThreeStyleListTemplate from '../../templates/ThreeStyleListTemplate';
import {
    inputLetters,
    changeRadioOrder,
    changeRadioMatch,
    changeSelectAll,
    searchAlgorithms,
    selectAlg,
    threeStyleListReducer,
} from '../../../modules/threeStyleList';

const mapStateToProps = ({
    part,
    letters,
    radioMatch,
    radioOrder,
    checkSelectAll,
    algorithms,
}) => {
    return {
        part,
        letters,
        radioMatch,
        radioOrder,
        checkSelectAll,
        algorithms,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        inputLetters(letters) {
            dispatch(inputLetters(letters));
        },
        changeRadioOrder(radioOrder) {
            dispatch(changeRadioOrder(radioOrder));
        },
        changeRadioMatch(radioMatch) {
            dispatch(changeRadioMatch(radioMatch));
        },
        changeSelectAll(checkSelectAll) {
            dispatch(changeSelectAll(checkSelectAll));
        },
        searchAlgorithms(letters) {
            dispatch(searchAlgorithms(letters));
        },
        selectAlg(ind, isCheckedNew) {
            dispatch(selectAlg(ind, isCheckedNew));
        },
    };
};

const store = createStore(threeStyleListReducer);

const Conn = connect(mapStateToProps, mapDispatchToProps)(ThreeStyleListTemplate);

const ThreeStyleListPage = (props) => (
    <Provider store={store}>
        <Conn />
    </Provider>
);

export default ThreeStyleListPage;
