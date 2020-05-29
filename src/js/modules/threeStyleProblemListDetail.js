import {
    createAction,
    handleActions,
} from 'redux-actions';
import {
    call,
    fork,
    // join,
    put,
    take,
    // select,
} from 'redux-saga/effects';
// import {
//     delay,
// } from 'redux-saga';
const constant = require('../constant');
const config = require('../config');
const _ = require('lodash');
const moment = require('moment');
const rp = require('request-promise');

const INPUT_LETTERS = 'INPUT_LETTERS';
export const inputLetters = createAction(INPUT_LETTERS);

const SET_MATCH_TYPE = 'SET_MATCH_TYPE';
export const setMatchType = createAction(SET_MATCH_TYPE);

const SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL = 'SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL';
export const sagaLoadThreeStyleQuizProblemListDetail = createAction(SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL);
const LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL = 'LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL';
const loadThreeStyleQuizProblemListDetail = createAction(LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL);

const SELECT_PROBLEM_LIST = 'SELECT_PROBLEM_LIST';
export const selectProblemList = createAction(SELECT_PROBLEM_LIST);

const ADD_TO_PROBLEM_LIST = 'ADD_TO_PROBLEM_LIST';
export const addToProblemList = createAction(ADD_TO_PROBLEM_LIST);

const DELETE_FROM_PROBLEM_LIST = 'DELETE_FROM_PROBLEM_LIST';
export const deleteFromProblemList = createAction(DELETE_FROM_PROBLEM_LIST);

const CHANGE_SELECT_ALL = 'CHANGE_SELECT_ALL';
export const changeSelectAll = createAction(CHANGE_SELECT_ALL);

const SELECT_ALGORITHM = 'SELECT_ALGORITHM';
export const selectAlgorithm = createAction(SELECT_ALGORITHM);

const requestThreeStyleQuizProblemListDetail = (part, problemListId) => {
    const url = `${config.apiRoot}/getThreeStyleQuizProblemListDetail/${part.name}`;

    // problemListIdがnullの時はそれをAPIに渡さないことで、全手順を出力
    const form = {
        token: localStorage.token,
    };
    if (problemListId) {
        form.problemListId = `${problemListId}`;
    }

    const options = {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form,
    };

    return rp(options)
        .then((result) => {
            return result.success.result.map((record, ind) => {
                return {
                    ...record,
                    stickers: `${record.buffer} ${record.sticker1} ${record.sticker2}`,
                    createdAt: moment(record.createdAt, moment.ISO_8601),
                    updatedAt: moment(record.recordAt, moment.ISO_8601),
                    ind,
                    moves: null,
                    numberOfMoves: null,
                    acc: null,
                    avgSec: null,
                    tps: null,
                    isSelected: false,
                };
            });
        })
        .catch((err) => {
            alert(`3-style問題リストの取得に失敗しました: ${err}`);
            return [];
        });
};

function * handleLoadThreeStyleQuizProblemListDetail () {
    while (true) {
        const action = yield take(sagaLoadThreeStyleQuizProblemListDetail);

        const url = action.payload.url;
        const partStr = url.searchParams.get('part');
        const part = constant.partType[partStr] || null;

        if (!part) {
            continue;
        };

        // problemListIdがnullの時はAPIにproblemListIdを渡さないようにする
        // その場合は、APIは全手順が含まれたリストを返す仕様とする
        const problemListId = parseInt(url.searchParams.get('problemListId')) || null;
        const threeStyleQuizProblemListDetail = yield call(requestThreeStyleQuizProblemListDetail, part, problemListId);

        const payload = {
            url,
            part,
            problemListId,
            threeStyleQuizProblemListDetail,
        };

        yield put(loadThreeStyleQuizProblemListDetail(payload));
    }
}

const initialState = {
    url: null,
    part: null,
    userName: localStorage.userName,
    problemListId: null,
    // targetProblemListId,
    isCheckedSelectAll: false,
    threeStyleQuizProblemListDetail: [],
};

export const threeStyleProblemListDetailReducer = handleActions(
    {
        [loadThreeStyleQuizProblemListDetail]: (state, action) => {
            const url = action.payload.url;
            const part = action.payload.part;
            const problemListId = action.payload.problemListId;
            const threeStyleQuizProblemListDetail = action.payload.threeStyleQuizProblemListDetail;

            return {
                ...state,
                url,
                part,
                problemListId,
                threeStyleQuizProblemListDetail,
            };
        },
        [selectAlgorithm]: (state, action) => {
            const ind = action.payload.ind;
            const newIsSelected = action.payload.newIsSelected;

            const threeStyleQuizProblemListDetail = _.cloneDeep(state.threeStyleQuizProblemListDetail);
            const newData = {
                ...threeStyleQuizProblemListDetail[ind],
                isSelected: newIsSelected,
            };
            threeStyleQuizProblemListDetail[ind] = newData;

            return {
                ...state,
                threeStyleQuizProblemListDetail,
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleLoadThreeStyleQuizProblemListDetail);
};
