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

const moment = require('moment-timezone');

const FETCH_STATS = 'FETCH_STATS';
const fetchStats = createAction(FETCH_STATS);

const SAGA_FETCH_STATS = 'SAGA_FETCH_STATS';
export const sagaFetchStats = createAction(SAGA_FETCH_STATS);

const SET_START_DATE = 'SET_START_DATE';
export const setStartDate = createAction(SET_START_DATE);

const SET_END_DATE = 'SET_END_DATE';
export const setEndDate = createAction(SET_END_DATE);

const initialState = {
    userName: localStorage.userName,

    event: '',
    startDate: moment().subtract(7 * 13 - 1, 'days').format('YYYY/MM/DD'),
    endDate: moment().format('YYYY/MM/DD'),

    stats: [],
    scores: [],
    elementIdToElement: {},
};

const requestFetchStats = (userName, event, startDate, endDate) => {
    const options = {
        url: `${config.apiRoot}/getMemoLogStats`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            userName,
            event,
            startDate: moment(startDate, 'YYYY/MM/DD').toISOString(),
            endDate: moment(endDate, 'YYYY/MM/DD').hour(23).minute(59).second(59).toISOString(),
            token: localStorage.token,
        },
    };

    return rp(options);
};

function * handleFetchStats () {
    while (true) {
        const action = yield take(sagaFetchStats);
        const userName = yield select(state => state.userName);
        const event = action.payload.event;
        const startDate = yield select(state => state.startDate);
        const endDate = yield select(state => state.endDate);

        // 入力の情報が足りていない時は状態の更新だけ行う
        if (userName === '' || event === '') {
            const payload = {
                event,
                stats: [],
                scores: [],
                elementIdToElement: {},
            };
            yield put(fetchStats(payload));
            continue;
        }

        // elementId => element
        // 種目選択するたびにロードするのは無駄だが、そんなに時間はかからないので問題ない見込み
        const elementIdToElement = yield call(memoTrainingUtils.loadElementIdToElement);
        if (Object.keys(elementIdToElement).length === 0) {
            throw new Error('load failed : elementIdToElement');
        }

        const resFetchScore = yield call(memoTrainingUtils.fetchScore, userName, event, 'memorization');
        if (!resFetchScore.success) {
            throw new Error('Error fetchScores()');
        }
        const scores = resFetchScore.success.result.scores;

        const resFetchStats = yield call(requestFetchStats, userName, event, startDate, endDate);
        if (!resFetchStats.success) {
            throw new Error('Error fetchStats()');
        }
        const statsJSON = resFetchStats.success.result;
        const stats = memoTrainingUtils.transformStatsJSONtoArray(statsJSON, event);

        const payload = {
            event,
            stats,
            scores,
            elementIdToElement,
        };

        yield put(fetchStats(payload));
    }
};

export const memoTrainingStatsReducer = handleActions(
    {
        [fetchStats]: (state, action) => {
            return {
                ...state,
                event: action.payload.event,
                stats: action.payload.stats,
                scores: action.payload.scores,
                elementIdToElement: action.payload.elementIdToElement,
            };
        },
        [setStartDate]: (state, action) => {
            const startDate = action.payload.startDate ? action.payload.startDate : moment().subtract(7 * 13 - 1, 'days').format('YYYY/MM/DD');

            return {
                ...state,
                startDate,
                // 日付を更新するだけでは統計データを更新しないので、
                // 誤解を招かないようにデータをリセット
                stats: [],
                scores: [],
            };
        },
        [setEndDate]: (state, action) => {
            const endDate = action.payload.endDate ? action.payload.endDate : moment().format('YYYY/MM/DD');

            return {
                ...state,
                endDate,
                // 日付を更新するだけでは統計データを更新しないので、
                // 誤解を招かないようにデータをリセット
                stats: [],
                scores: [],
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleFetchStats);
};
