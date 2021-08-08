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
const memoTrainingUtils = require('../memoTrainingUtils');
const config = require('../config');
const rp = require('request-promise');

// const moment = require('moment');
// const _ = require('lodash');

const FETCH_SCORES = 'FETCH_SCORES';
const fetchScores = createAction(FETCH_SCORES);
const SAGA_FETCH_SCORES = 'SAGA_FETCH_SCORES';
export const sagaFetchScores = createAction(SAGA_FETCH_SCORES);

const DECIDE_TRIAL = 'DECIDE_TRIAL';
const decideTrial = createAction(DECIDE_TRIAL);
const SAGA_DECIDE_TRIAL = 'SAGA_DECIDE_TRIAL';
export const sagaDecideTrial = createAction(SAGA_DECIDE_TRIAL);

const initialState = {
    userName: localStorage.userName,
    event: '',
    mode: '',
    scores: [],
    memoLogs: [],
    recallLogs: [],
    trialId: undefined,
    elementIdToElement: {},
};

const fetchMemoLog = (userName, trialId) => {
    const form = {
        userName,
        token: localStorage.token,
    };

    if (trialId) {
        form.trialId = trialId;
    }

    const options = {
        url: `${config.apiRoot}/getMemoLog`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form,
    };

    return rp(options);
};

const fetchRecallLog = (userName, trialId) => {
    const form = {
        userName,
        token: localStorage.token,
    };

    if (trialId) {
        form.trialId = trialId;
    }

    const options = {
        url: `${config.apiRoot}/getRecallLog`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form,
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
                elementIdToElement: {},
            };
            yield put(fetchScores(payload));
            continue;
        }

        const resFetchScore = yield call(memoTrainingUtils.fetchScore, userName, event, mode);
        if (!resFetchScore.success) {
            throw new Error('Error fetchScores()');
        }
        const scores = resFetchScore.success.result.scores;

        // elementId => element
        // 種目選択するたびにロードするのは無駄だが、そんなに時間はかからないので問題ない見込み
        const elementIdToElement = yield call(memoTrainingUtils.loadElementIdToElement);
        if (Object.keys(elementIdToElement).length === 0) {
            throw new Error('load failed : elementIdToElement');
        }

        // 最初はこのタイミングでログを取得していたが、
        // 全件取得で遅くなるのでやめた
        const memoLogs = [];
        const recallLogs = [];

        const payload = {
            event,
            mode,
            scores,
            memoLogs,
            recallLogs,
            elementIdToElement,
        };

        yield put(fetchScores(payload));
    }
};

function * handleDecideTrial () {
    while (true) {
        const action = yield take(sagaDecideTrial);
        const userName = yield select(state => state.userName);
        const trialId = action.payload.trialId;

        const resFetchMemoLog = yield call(fetchMemoLog, userName, trialId);
        if (!resFetchMemoLog.success) {
            throw new Error('Error fetchMemoLog()');
        }
        const memoLogs = resFetchMemoLog.success.result.logs;

        const resFetchRecallLog = yield call(fetchRecallLog, userName, trialId);
        if (!resFetchRecallLog.success) {
            throw new Error('Error fetchRecallLog()');
        }
        const recallLogs = resFetchRecallLog.success.result.logs;

        const payload = {
            ...action.payload,
            memoLogs,
            recallLogs,
        };

        yield put(decideTrial(payload));
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
                trialId: undefined,
                elementIdToElement: action.payload.elementIdToElement,
            };
        },
        [decideTrial]: (state, action) => {
            return {
                ...state,
                trialId: action.payload.trialId,
                memoLogs: action.payload.memoLogs ? action.payload.memoLogs : state.memoLogs,
                recallLogs: action.payload.recallLogs ? action.payload.recallLogs : state.recallLogs,
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleFetchScores);
    yield fork(handleDecideTrial);
};
