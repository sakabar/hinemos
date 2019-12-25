import {
    createAction,
    handleActions,
} from 'redux-actions';
import {
    // call,
    fork,
    // put,
    take,
    // select,
} from 'redux-saga/effects';
// const memoTrainingUtils = require('../memoTrainingUtils');
// const moment = require('moment');
// const _ = require('lodash');

// Settingモード
const AAAA_ACTION = 'AAAA_ACTION';
const aaaaAction = createAction(AAAA_ACTION);

const initialState = {
    dummy: 1,
};

// FIXME
// focusSolutionPairのアクションがいるかもね

export const memoTrainingResultReducer = handleActions(
    {
        [aaaaAction]: (state, action) => {
            return {
                ...state,
            };
        },
    },
    initialState
);

function * handleAaaaAction () {
    while (true) {
        yield take(aaaaAction);
    }
};

export function * rootSaga () {
    yield fork(handleAaaaAction);
};
