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

const moment = require('moment-timezone');

const FETCH_STATS = 'FETCH_STATS';
const fetchStats = createAction(FETCH_STATS);

const SAGA_FETCH_STATS = 'SAGA_FETCH_STATS';
export const sagaFetchStats = createAction(SAGA_FETCH_STATS);

const initialState = {
    userName: localStorage.userName,

    event: '',
    startDate: moment().subtract(7 * 13 - 1, 'days').format('YYYY/MM/DD'),
    endDate: moment().format('YYYY/MM/DD'),

    stats: [],
    scores: [],
    elementIdToElement: {},
};

function * handleFetchStats () {
    while (true) {
        const action = yield take(sagaFetchStats);
        const userName = yield select(state => state.userName);
        const event = action.payload.event;
        const startDate = action.payload.startDate;
        const endDate = action.payload.endDate;

        const startDateMoment = moment(startDate, 'YYYY/MM/DD');
        const endDateMoment = moment(endDate, 'YYYY/MM/DD');

        // elementId => element
        // 初回のみは実際にロードし、state内にキャッシュしておく。その後はstate内のキャッシュを利用。
        let elementIdToElement = yield select(state => state.elementIdToElement);
        if (Object.keys(elementIdToElement).length === 0) {
            elementIdToElement = yield call(memoTrainingUtils.loadElementIdToElement);
        }
        if (Object.keys(elementIdToElement).length === 0) {
            throw new Error('load failed : elementIdToElement');
        }

        // 入力の情報が足りていない時は状態の更新だけ行う
        if (userName === '' || event === '' || !startDateMoment.isSameOrBefore(endDateMoment)) {
            const payload = {
                event,
                startDate,
                endDate,
                stats: [],
                scores: [],
                elementIdToElement,
            };
            yield put(fetchStats(payload));
            continue;
        }

        const resFetchScore = yield call(memoTrainingUtils.fetchScore, userName, event, 'memorization');
        if (!resFetchScore.success) {
            throw new Error('Error fetchScores()');
        }
        const scores = resFetchScore.success.result.scores;

        const resFetchStats = yield call(memoTrainingUtils.requestFetchStats, userName, event, startDate, endDate);
        if (!resFetchStats.success) {
            throw new Error('Error fetchStats()');
        }
        const statsJSON = resFetchStats.success.result;
        const stats = memoTrainingUtils.transformStatsJSONtoArray(statsJSON, event);

        const payload = {
            event,
            startDate,
            endDate,
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
                startDate: action.payload.startDate,
                endDate: action.payload.endDate,
                stats: action.payload.stats,
                scores: action.payload.scores,
                elementIdToElement: action.payload.elementIdToElement,
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleFetchStats);
};
