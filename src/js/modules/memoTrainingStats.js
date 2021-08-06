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
const _ = require('lodash');

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
            endDate: moment(endDate, 'YYYY/MM/DD').toISOString(),
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

        const resFetchStats = yield call(requestFetchStats, userName, event, startDate, endDate);
        if (!resFetchStats.success) {
            throw new Error('Error fetchStats()');
        }
        const statsJSON = resFetchStats.success.result;

        const stats = [];

        const posInds = Object.keys(statsJSON);
        for (let i = 0; i < posInds.length; i++) {
            const posInd = posInds[i];
            const posObj = statsJSON[posInd];

            const elementIds = Object.keys(posObj);
            for (let k = 0; k < elementIds.length; k++) {
                const elementId = elementIds[k];
                const posElementObj = posObj[elementId];

                const recEvent = posElementObj.event;
                if (recEvent !== event) {
                    continue;
                }

                const transformation = posElementObj.transformation;
                const memorization = posElementObj.memorization;
                const recallSum = posElementObj.recallSum;
                const recallData = posElementObj.recallData;

                const sortedRecallData = _.sortBy(recallData, (rec) => { return -rec.count; });

                let acc = 0.0;
                let mistakeCnt = recallSum;
                const mistakes = [];

                for (let n = 0; n < sortedRecallData.length; n++) {
                    const recallDatum = sortedRecallData[n];

                    const solutionElementId = recallDatum.solutionElementId;
                    const count = recallDatum.count;
                    const rate = recallDatum.rate;

                    if (solutionElementId === parseInt(elementId)) {
                        acc = rate;
                        mistakeCnt -= count;
                        continue;
                    } else {
                        mistakes.push(recallDatum);
                    }

                    if (mistakes.length >= 3) {
                        break;
                    }
                }

                const rec = {
                    event: recEvent,
                    posInd: parseInt(posInd),
                    elementId: parseInt(elementId),
                    transformation,
                    memorization,
                    acc,
                    mistakeCnt,
                    mistakes,
                };

                stats.push(rec);
            }
        }

        const payload = {
            event,
            stats,
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
                elementIdToElement: action.payload.elementIdToElement,
            };
        },
        [setStartDate]: (state, action) => {
            const startDate = action.payload.startDate ? action.payload.startDate : moment().subtract(7 * 13 - 1, 'days').format('YYYY/MM/DD');

            return {
                ...state,
                startDate,
            };
        },
        [setEndDate]: (state, action) => {
            const endDate = action.payload.endDate ? action.payload.endDate : moment().format('YYYY/MM/DD');

            return {
                ...state,
                endDate,
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleFetchStats);
};
