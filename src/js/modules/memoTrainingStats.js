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
const letterPairTableUtils = require('../letterPairTableUtils');

const moment = require('moment-timezone');

const FETCH_STATS = 'FETCH_STATS';
const fetchStats = createAction(FETCH_STATS);

const SAGA_FETCH_STATS = 'SAGA_FETCH_STATS';
export const sagaFetchStats = createAction(SAGA_FETCH_STATS);

const SET_BO5_TOOLTIP_IS_OPEN = 'SET_BO5_TOOLTIP_IS_OPEN';
export const setBo5TooltipIsOpen = createAction(SET_BO5_TOOLTIP_IS_OPEN);

const SET_AO5_TOOLTIP_IS_OPEN = 'SET_AO5_TOOLTIP_IS_OPEN';
export const setAo5TooltipIsOpen = createAction(SET_AO5_TOOLTIP_IS_OPEN);

const SET_SCORES_COMPONENT_TOOLTIP_IS_OPEN = 'SET_SCORES_COMPONENT_TOOLTIP_IS_OPEN';
export const setScoresComponentTooltipIsOpen = createAction(SET_SCORES_COMPONENT_TOOLTIP_IS_OPEN);

const initialState = {
    userName: localStorage.userName,

    event: '',
    startDate: moment().subtract(7 * 13 - 1, 'days').format('YYYY/MM/DD'),
    endDate: moment().format('YYYY/MM/DD'),

    stats: [],
    scores: [],
    elementIdToElement: {},
    // 2文字→レターペアの配列
    letterPairDict: {},

    isOpenBo5Tooltip: false,
    isOpenAo5Tooltip: false,
    isOpenScoresComponentTooltip: false,
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
                letterPairDict: {},
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

        // 2文字→レターペアの配列
        // 種目選択するたびにロードするのは無駄だが、そんなに時間はかからないので問題ない見込み
        // FIXME ここも、module/memoTrainingResultと重複
        let letterPairDict = {};
        if (event === memoTrainingUtils.MemoEvent.mbld) {
            letterPairDict = yield call(letterPairTableUtils.fetchLetterPair, userName);
        }

        const payload = {
            event,
            startDate,
            endDate,
            stats,
            scores,
            elementIdToElement,
            letterPairDict,
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
                letterPairDict: action.payload.letterPairDict,
            };
        },
        [setBo5TooltipIsOpen]: (state, action) => {
            return {
                ...state,
                isOpenBo5Tooltip: action.payload.newIsOpenBo5Tooltip,
            };
        },
        [setAo5TooltipIsOpen]: (state, action) => {
            return {
                ...state,
                isOpenAo5Tooltip: action.payload.newIsOpenAo5Tooltip,
            };
        },
        [setScoresComponentTooltipIsOpen]: (state, action) => {
            return {
                ...state,
                isOpenScoresComponentTooltip: action.payload.newIsOpenScoresComponentTooltip,
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleFetchStats);
};
