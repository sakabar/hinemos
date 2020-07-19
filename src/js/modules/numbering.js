import {
    // createAction,
    handleActions,
} from 'redux-actions';
// import {
//     call,
//     fork,
//     // join,
//     put,
//     take,
//     select,
// } from 'redux-saga/effects';
// const _ = require('lodash');
// const moment = require('moment');
// const rp = require('request-promise');
// const config = require('../config');
const constant = require('../constant');

// const SAGA_SAVE_NUMBERING = 'SAGA_SAVE_NUMBERING';
// export const sagaSaveNumbering = createAction(SAGA_SAVE_NUMBERING);
// const SAVE_NUMBERING = 'SAVE_NUMBERING';
// const saveNumbering = createAction(SAVE_NUMBERING);

// const LOAD_INITIALLY = 'LOAD_INITIALLY';
// const loadInitially = createAction(LOAD_INITIALLY);
// const SAGA_LOAD_INITIALLY = 'SAGA_LOAD_INITIALLY';
// export const sagaLoadInitially = createAction(SAGA_LOAD_INITIALLY);

const initialState = {
    loadWillSkipped: false,
    part: constant.dummyPartType,
    userName: localStorage.userName,
};

export const numberingReducer = handleActions(
    {

    },
    initialState
);

export function * rootSaga () {

};
