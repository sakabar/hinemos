import {
    createAction,
    handleActions,
} from 'redux-actions';
import {
    call,
    fork,
    put,
    take,
    select,
} from 'redux-saga/effects';
// const memoTrainingUtils = require('../memoTrainingUtils');
const config = require('../config');
const rp = require('request-promise');

// const moment = require('moment');
// const _ = require('lodash');

const FETCH_SCORES = 'FETCH_SCORES';
const fetchScores = createAction(FETCH_SCORES);
const SAGA_FETCH_SCORES = 'SAGA_FETCH_SCORES';
export const sagaFetchScores = createAction(SAGA_FETCH_SCORES);

const initialState = {
    userName: localStorage.userName,
    event: '',
    mode: '',
    scores: [],
    memoLogs: [],
    recallLogs: [],
};

const fetchScore = (userName, event, mode) => {
    const options = {
        url: `${config.apiRoot}/getMemoScore`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            userName,
            event,
            mode,
            token: localStorage.token,
        },
    };

    return rp(options);
};

const fetchMemoLog = (userName) => {
    const options = {
        url: `${config.apiRoot}/getMemoLog`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            userName,
            token: localStorage.token,
        },
    };

    return rp(options);
};

function * handleFetchScores () {
    while (true) {
        const action = yield take(sagaFetchScores);
        const userName = yield select(state => state.userName);
        const event = action.payload.event;
        const mode = action.payload.mode;

        // 入力の情報が足りていない時は状態の更新だけ行う
        if (userName === '' || event === '' || mode === '') {
            const payload = {
                event,
                mode,
                scores: undefined,
                memoLogs: undefined,
                recallLogs: undefined,
            };
            yield put(fetchScores(payload));
            continue;
        }

        const resFetchScore = yield call(fetchScore, userName, event, mode);
        if (!resFetchScore.success) {
            throw new Error('Error fetchScores()');
        }
        const scores = resFetchScore.success.result.scores;

        const resFetchMemoLog = yield call(fetchMemoLog, userName);
        if (!resFetchMemoLog.success) {
            throw new Error('Error fetchScores()');
        }
        const memoLogs = resFetchMemoLog.success.result.logs;

        // FIXME 後でやる
        const recallLogs = [];

        const payload = {
            event,
            mode,
            scores,
            memoLogs,
            recallLogs,
        };

        yield put(fetchScores(payload));
    }
};

export const memoTrainingResultReducer = handleActions(
    {
        [fetchScores]: (state, action) => {
            return {
                ...state,
                event: action.payload.event,
                mode: action.payload.mode,
                scores: action.payload.scores ? action.payload.scores : state.scores,
                memoLogs: action.payload.memoLogs ? action.payload.memoLogs : state.memoLogs,
                recallLogs: action.payload.recallLogs ? action.payload.recallLogs : state.recallLogs,
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleFetchScores);
};
