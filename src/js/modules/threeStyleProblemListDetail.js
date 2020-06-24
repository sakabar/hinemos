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
const utils = require('../utils');
const threeStyleUtils = require('../threeStyleUtils');
const _ = require('lodash');
const moment = require('moment');
const rp = require('request-promise');

const LOAD_INITIALLY = 'LOAD_INITIALLY';
const loadInitially = createAction(LOAD_INITIALLY);
const SAGA_LOAD_INITIALLY = 'SAGA_LOAD_INITIALLY';
export const sagaLoadInitially = createAction(SAGA_LOAD_INITIALLY);

const SELECT_PROBLEM_LIST = 'SELECT_PROBLEM_LIST';
export const selectProblemList = createAction(SELECT_PROBLEM_LIST);

// const ADD_TO_PROBLEM_LIST = 'ADD_TO_PROBLEM_LIST';
// const addToProblemList = createAction(ADD_TO_PROBLEM_LIST);
const SAGA_ADD_TO_PROBLEM_LIST = 'SAGA_ADD_TO_PROBLEM_LIST';
export const sagaAddToProblemList = createAction(SAGA_ADD_TO_PROBLEM_LIST);

const DELETE_FROM_PROBLEM_LIST = 'DELETE_FROM_PROBLEM_LIST';
export const deleteFromProblemList = createAction(DELETE_FROM_PROBLEM_LIST);

const CHANGE_SELECT_ALL = 'CHANGE_SELECT_ALL';
export const toggleSelectAll = createAction(CHANGE_SELECT_ALL);

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
            return {
                buffer: result.success.buffer,
                result: result.success.result,
            };
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

    return rp(options)
        .then(() => {
            alert('保存しました');
        })
        .catch((err) => {
            alert(`3-style問題リストの登録に失敗しました: ${err}`);
            return [];
        });
};

function * handleLoadInitially () {
    while (true) {
        const action = yield take(sagaLoadInitially);

        const url = action.payload.url;
        const partStr = url.searchParams.get('part');
        const part = constant.partType[partStr] || null;

        if (!part) {
            continue;
        };

        // problemListIdがnullの時はAPIにproblemListIdを渡さないようにする
        // その場合は、APIは全手順が含まれたリストを返す仕様とする
        const problemListId = parseInt(url.searchParams.get('problemListId')) || null;
        const detailRes = yield call(requestGetThreeStyleQuizProblemListDetail, part, problemListId);
        const details = detailRes.result;
        const buffer = detailRes.buffer;

        // lettersの昇順でソートしておく
        details.sort((a, b) => {
            if (a.letters < b.letters) return -1;
            if (a.letters === b.letters) return 0;
            if (a.letters > b.letters) return 1;
        });

        const threeStyleQuizProblemListsRes = yield call(threeStyleQuizListUtils.requestGetThreeStyleQuizProblemList, part);

        const threeStyleQuizProblemLists = threeStyleQuizProblemListsRes.success.result.map(record => {
            return {
                problemListId: record.problemListId,
                title: record.title,
            };
        });

        const userName = yield select(state => state.userName);
        const threeStyles = yield call(threeStyleUtils.getThreeStyles, userName, part, buffer);
        const quizLogs = yield call(threeStyleUtils.getThreeStyleQuizLog, userName, part, buffer);

        // 問題リストと3-style手順の情報とクイズ結果の情報をJOIN
        // 1つのstickersに対して複数3-style手順があるので、基本的に問題リストの要素でループしつつも、
        // map()処理ではなく配列にどんどんpush()していく方式
        // クイズの結果の情報も付加

        // stickers -> [threeStyle]
        const stickersToThreeStyles = {};
        threeStyles.map(threeStyle => {
            const stickers = threeStyle.stickers;

            if (stickers in stickersToThreeStyles) {
                stickersToThreeStyles[stickers].push(threeStyle);
            } else {
                stickersToThreeStyles[stickers] = [ threeStyle, ];
            }
        });

        const stickersToQuizLog = {};
        quizLogs.map(log => {
            const stickers = log.stickers;

            const record = {
                buffer: log.buffer,
                sticker1: log.sticker1,
                sticker2: log.sticker2,
                stickers,
                solved: log.solved,
                tried: log.tried,
                avgSec: log['avg_sec'],
                newness: log.newness,
            };

            stickersToQuizLog[stickers] = record;
        });

        const threeStyleQuizProblemListDetail = [];
        details.map(detail => {
            const stickers = detail.stickers;

            const acc = ((stickers in stickersToQuizLog) && stickersToQuizLog[stickers].tried > 0) ? 1.0 * stickersToQuizLog[stickers].solved / stickersToQuizLog[stickers].tried : null;
            const avgSec = (stickers in stickersToQuizLog) ? stickersToQuizLog[stickers].avgSec : null;
            const letters = detail.letters;

            // あるstickerのthreeStyleが無い場合でも、1行だけ用意したいので、 [ null, ]にしている
            const len = stickersToThreeStyles[stickers] ? stickersToThreeStyles[stickers].length : 0;
            (stickersToThreeStyles[stickers] || [ null, ]).map(threeStyle => {
                let tps = null;
                let moves = '';
                let createdAt = null;
                let updatedAt = null;
                if (threeStyle !== null) {
                    tps = ((stickers in stickersToQuizLog) && avgSec > 0) ? 1.0 * threeStyle.numberOfMoves / avgSec : null;
                    moves = utils.showMove(threeStyle.setup, threeStyle.move1, threeStyle.move2);
                    createdAt = moment(threeStyle.createdAt, moment.ISO_8601);
                    updatedAt = moment(threeStyle.updatedAt, moment.ISO_8601);
                }

                let dispLetters = `「${letters}」`;
                if (len >= 2) {
                    dispLetters += '【重複】';
                }

                const record = {
                    ...detail,
                    moves,
                    acc,
                    avgSec,
                    tps,
                    isSelected: false,
                    letters,
                    // 「全て選択」の際、フィルタ条件に"「"が入っている時も正しく処理ができるように、
                    // 表示表にテーブルに渡したカッコ付きの文字列をstateでも持っておく
                    dispLetters,
                    createdAt,
                    updatedAt,
                };

                threeStyleQuizProblemListDetail.push(record);
            });
        });

        // indの情報はレコードの数が確定してから追加する必要があるので最後にやっている
        const detailsWithInd = threeStyleQuizProblemListDetail.map((rec, ind) => {
            return {
                ...rec,
                ind,
                pInd: ind + 1, // 1-origin (positive ind)
            };
        });

        const payload = {
            url,
            part,
            problemListId,
            threeStyleQuizProblemLists,
            threeStyleQuizProblemListDetail: detailsWithInd,
            threeStyles,
        };

        yield put(loadInitially(payload));
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
    part: constant.dummyPartType,
    userName: localStorage.userName,
    problemListId: null,
    isCheckedSelectAll: false,
    threeStyleQuizProblemLists: [], // [ { problemListId: , title: , } ]
    selectedThreeStyleQuizListId: null,
    threeStyleQuizProblemListDetail: [],
};

export const threeStyleProblemListDetailReducer = handleActions(
    {
        [loadInitially]: (state, action) => {
            const url = action.payload.url;
            const part = action.payload.part;
            const problemListId = action.payload.problemListId;
            const threeStyleQuizProblemLists = action.payload.threeStyleQuizProblemLists;
            const threeStyleQuizProblemListDetail = action.payload.threeStyleQuizProblemListDetail;
            const threeStyles = action.payload.threeStyles;

            return {
                ...state,
                url,
                part,
                problemListId,
                threeStyleQuizProblemLists,
                threeStyleQuizProblemListDetail,
                threeStyles,
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
        [toggleSelectAll]: (state, action) => {
            const newIsCheckedSelectAll = !state.isCheckedSelectAll;

            const searchBox = document.querySelector('.sortable-table .search-box .search');
            const searchWord = searchBox ? searchBox.value : '';

            // 画面に見えている手順全てのチェック状態を、newIsCheckedSelectAllと同じにする
            const newThreeStyleQuizProblemListDetail = state.threeStyleQuizProblemListDetail
                .map((row, i) => {
                    if (threeStyleQuizListUtils.isSelectedRow(searchWord, row)) {
                        row.isSelected = newIsCheckedSelectAll;
                        return row;
                    } else {
                        return row;
                    }
                });

            return {
                ...state,
                isCheckedSelectAll: newIsCheckedSelectAll,
                threeStyleQuizProblemListDetail: newThreeStyleQuizProblemListDetail,
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleLoadInitially);
    yield fork(handleAddToProblemList);
};
