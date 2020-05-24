import {
    createAction,
    handleActions,
} from 'redux-actions';
import {
    call,
    fork,
    // join,
    put,
    // take,
    select,
} from 'redux-saga/effects';
// import {
//     delay,
// } from 'redux-saga';
const constant = require('../constant');
const config = require('../config');
const moment = require('moment');
const rp = require('request-promise');

const INPUT_LETTERS = 'INPUT_LETTERS';
export const inputLetters = createAction(INPUT_LETTERS);

const SET_MATCH_TYPE = 'SET_MATCH_TYPE';
export const setMatchType = createAction(SET_MATCH_TYPE);

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

// const SELECT_ALG = 'SELECT_ALG';
// export const selectAlg = createAction(SELECT_ALG);

const requestThreeStyleQuizProblemListDetail = (part, problemListId) => {
    // problemListIdがnullの時はそれをAPIに渡さないことで、全手順を出力
    const url = problemListId ? `${config.apiRoot}/threeStyleQuizProblemListDetail/${part.name}?problemListId=${problemListId}` : `${config.apiRoot}/threeStyleQuizProblemListDetail/${part.name}`;

    const options = {
        url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            token: localStorage.token,
        },
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
                };
            });
        })
        .catch((err) => {
            alert(`3-style問題リストの取得に失敗しました: ${err}`);
            return [];
        });
};

function * handleLoadThreeStyleQuizProblemListDetail () {
    const part = yield select(state => state.part);
    const problemListId = yield select(state => state.problemListId);
    const threeStyleQuizProblemListDetail = yield call(requestThreeStyleQuizProblemListDetail, part, problemListId);

    const payload = {
        threeStyleQuizProblemListDetail,
    };
    yield put(loadThreeStyleQuizProblemListDetail(payload));
}

const initialState = (() => {
    const url = new URL(location.href);
    const partStr = url.searchParams.get('part');
    const part = constant.partType[partStr] || null;
    const problemListId = parseInt(url.searchParams.get('problemListId')) || null;

    // problemListIdがnullの時はAPIにproblemListIdを渡さないようにする
    // その場合は、APIは全手順が含まれたリストを返す仕様とする

    if (!part) {
        alert(`partパラメータが不正です: ${partStr}`);
    }

    return {
        part,
        userName: localStorage.userName,
        problemListId,
        letters: '',
        isForwardMatch: true,
        isCheckedSelectAll: false,
        threeStyleQuizProblemListDetail: [],
    };
})();

export const threeStyleProblemListDetailReducer = handleActions(
    {
        [loadThreeStyleQuizProblemListDetail]: (state, action) => {
            return {
                ...state,
                threeStyleQuizProblemListDetail: action.payload.threeStyleQuizProblemListDetail,
            };
        },

    },
    initialState
);

export function * rootSaga () {
    yield fork(handleLoadThreeStyleQuizProblemListDetail);
};
