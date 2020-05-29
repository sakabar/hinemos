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
    select,
} from 'redux-saga/effects';
// import {
//     delay,
// } from 'redux-saga';
const constant = require('../constant');
const config = require('../config');
const threeStyleQuizListUtils = require('../threeStyleQuizListUtils');
const _ = require('lodash');
const moment = require('moment');
const rp = require('request-promise');

const LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL = 'LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL';
const loadThreeStyleQuizProblemListDetail = createAction(LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL);
const SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL = 'SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL';
export const sagaLoadThreeStyleQuizProblemListDetail = createAction(SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST_DETAIL);

const SELECT_PROBLEM_LIST = 'SELECT_PROBLEM_LIST';
export const selectProblemList = createAction(SELECT_PROBLEM_LIST);

// const ADD_TO_PROBLEM_LIST = 'ADD_TO_PROBLEM_LIST';
// const addToProblemList = createAction(ADD_TO_PROBLEM_LIST);
const SAGA_ADD_TO_PROBLEM_LIST = 'SAGA_ADD_TO_PROBLEM_LIST';
export const sagaAddToProblemList = createAction(SAGA_ADD_TO_PROBLEM_LIST);

const DELETE_FROM_PROBLEM_LIST = 'DELETE_FROM_PROBLEM_LIST';
export const deleteFromProblemList = createAction(DELETE_FROM_PROBLEM_LIST);

const CHANGE_SELECT_ALL = 'CHANGE_SELECT_ALL';
export const changeSelectAll = createAction(CHANGE_SELECT_ALL);

const SELECT_ALGORITHM = 'SELECT_ALGORITHM';
export const selectAlgorithm = createAction(SELECT_ALGORITHM);

const requestGetThreeStyleQuizProblemListDetail = (part, problemListId) => {
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

const requestPostThreeStyleQuizProblemListDetail = (part, problemListId, stickersStr) => {
    const url = `${config.apiRoot}/postThreeStyleQuizProblemListDetail/${part.name}`;

    const options = {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            token: localStorage.token,
            problemListId,
            stickersStr,
        },
    };

    alert(JSON.stringify(options));

    return rp(options)
        .then(() => {
            alert('保存しました');
        })
        .catch((err) => {
            alert(`3-style問題リストの登録に失敗しました: ${err}`);
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
        const threeStyleQuizProblemListDetail = yield call(requestGetThreeStyleQuizProblemListDetail, part, problemListId);

        const threeStyleQuizProblemListsRes = yield call(threeStyleQuizListUtils.requestGetThreeStyleQuizProblemList, part);

        const threeStyleQuizProblemLists = threeStyleQuizProblemListsRes.success.result.map(record => {
            return {
                problemListId: record.problemListId,
                title: record.title,
            };
        });

        const payload = {
            url,
            part,
            problemListId,
            threeStyleQuizProblemLists,
            threeStyleQuizProblemListDetail,
        };

        yield put(loadThreeStyleQuizProblemListDetail(payload));
    }
}

function * handleAddToProblemList () {
    while (true) {
        yield take(sagaAddToProblemList);

        const part = yield select(state => state.part);
        const selectedProblemListId = yield select(state => state.selectedProblemListId);

        const threeStyleQuizProblemListDetail = yield select(state => state.threeStyleQuizProblemListDetail);

        const stickersStr = threeStyleQuizProblemListDetail
            .filter(alg => alg.isSelected)
            .map(alg => alg.stickers)
            .join(',');

        yield call(requestPostThreeStyleQuizProblemListDetail, part, selectedProblemListId, stickersStr);
    }
}

const initialState = {
    url: null,
    part: null,
    userName: localStorage.userName,
    problemListId: null,
    // targetProblemListId,
    isCheckedSelectAll: false,
    threeStyleQuizProblemLists: [], // [ { problemListId: , title: , } ]
    selectedThreeStyleQuizListId: null,
    threeStyleQuizProblemListDetail: [],
};

export const threeStyleProblemListDetailReducer = handleActions(
    {
        [loadThreeStyleQuizProblemListDetail]: (state, action) => {
            const url = action.payload.url;
            const part = action.payload.part;
            const problemListId = action.payload.problemListId;
            const threeStyleQuizProblemLists = action.payload.threeStyleQuizProblemLists;
            const threeStyleQuizProblemListDetail = action.payload.threeStyleQuizProblemListDetail;

            return {
                ...state,
                url,
                part,
                problemListId,
                threeStyleQuizProblemLists,
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
        [selectProblemList]: (state, action) => {
            const selectedProblemListId = action.payload.selectedProblemListId;
            return {
                ...state,
                selectedProblemListId,
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleLoadThreeStyleQuizProblemListDetail);
    yield fork(handleAddToProblemList);
};
