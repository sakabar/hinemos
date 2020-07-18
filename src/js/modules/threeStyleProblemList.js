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
const _ = require('lodash');
const moment = require('moment');
const rp = require('request-promise');
const config = require('../config');
const constant = require('../constant');
const threeStyleQuizListUtils = require('../threeStyleQuizListUtils');

const SET_LOAD_WILL_SKIPPED = 'SET_LOAD_WILL_SKIPPED';
export const setLoadWillSkipped = createAction(SET_LOAD_WILL_SKIPPED);

const INPUT_TITLES = 'INPUT_TITLES';
export const inputTitles = createAction(INPUT_TITLES);

const CREATE_PROBLEM_LISTS = 'CREATE_PROBLEM_LISTS';
const createProblemLists = createAction(CREATE_PROBLEM_LISTS);
const SAGA_CREATE_PROBLEM_LISTS = 'SAGA_CREATE_PROBLEM_LISTS';
export const sagaCreateProblemLists = createAction(SAGA_CREATE_PROBLEM_LISTS);

const LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST = 'LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST';
const loadThreeStyleQuizProblemList = createAction(LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST);
const SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST = 'SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST';
export const sagaLoadThreeStyleQuizProblemList = createAction(SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST);

const SORT_TABLE = 'SORT_TABLE';
const sortTable = createAction(SORT_TABLE);
const SAGA_SORT_TABLE = 'SAGA_SORT_TABLE';
export const sagaSortTable = createAction(SAGA_SORT_TABLE);

const SELECT_ROW = 'SELECT_ROW';
export const selectRow = createAction(SELECT_ROW);

const SAGA_DELETE_PROBLEM_LISTS = 'SAGA_DELETE_PROBLEM_LISTS';
export const sagaDeleteProblemLists = createAction(SAGA_DELETE_PROBLEM_LISTS);
const DELETE_PROBLEM_LISTS = 'DELETE_PROBLEM_LISTS';
const deleteProblemLists = createAction(DELETE_PROBLEM_LISTS);

const TOGGLE_SELECT_ALL = 'TOGGLE_SELECT_ALL';
export const toggleSelectAll = createAction(TOGGLE_SELECT_ALL);

const requestPostProblemListName = (part, titles) => {
    const options = {
        url: `${config.apiRoot}/postThreeStyleQuizProblemListName/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            titles,
            token: localStorage.token,
        },
    };

    return rp(options);
};

function * handleLoadThreeStyleQuizProblemList () {
    while (true) {
        const action = yield take(sagaLoadThreeStyleQuizProblemList);

        const url = action.payload.url;
        const partStr = url.searchParams.get('part');
        const part = constant.partType[partStr] || null;

        if (!part) {
            return;
        }

        const threeStyleQuizProblemList = yield call(threeStyleQuizListUtils.requestGetThreeStyleQuizProblemList, part);

        const payload = {
            url,
            part,
            problemLists: threeStyleQuizProblemList.success.result.map(problemList => {
                return {
                    ...problemList,
                    createdAt: moment(problemList.createdAt, moment.ISO_8601),
                    updatedAt: moment(problemList.updatedAt, moment.ISO_8601),
                    isSelectable: true,
                    isSelected: false,
                };
            }),
        };

        yield put(loadThreeStyleQuizProblemList(payload));
    }
};

function * handleCreateProblemLists () {
    while (true) {
        yield take(sagaCreateProblemLists);

        const part = yield select(state => state.part);
        const titles = yield select(state => state.titles);

        if (titles.indexOf(' ') !== -1) {
            alert('問題リスト名にスペースが含まれています');
            continue;
        }

        const ans = yield call(requestPostProblemListName, part, titles);

        const newProblemLists = ans.success.result.map(problemList => {
            return {
                ...problemList,
                createdAt: moment(problemList.createdAt, moment.ISO_8601),
                updatedAt: moment(problemList.updatedAt, moment.ISO_8601),
                numberOfAlgs: 0,
                isSelectable: true,
                isSelected: false,
            };
        });

        yield put(createProblemLists({ newProblemLists, }));
    }
};

function * handleSortTable () {
    while (true) {
        const action = yield take(sagaSortTable);

        const origProblemLists = yield select(state => state.problemLists);
        const origIndsStr = yield select(state => state.problemListsIndsStr);

        // dKey, nAscが指定されているときはその設定でソート
        // nullの場合は現在のソート状態を取得してその通りにソート
        let dKey = action.payload.dKey;
        let nAsc = action.payload.nAsc;

        if ((dKey !== null) || (nAsc !== null)) {
            const newProblemLists = origProblemLists.slice();
            newProblemLists.sort((a, b) => {
                if (a[dKey] === b[dKey]) { return 0; }
                if (nAsc ? a[dKey] > b[dKey] : a[dKey] < b[dKey]) { return 1; }
                if (nAsc ? a[dKey] < b[dKey] : a[dKey] > b[dKey]) { return -1; }
                return 0;
            });

            const newIndsStr = newProblemLists.map(d => String(d.ind)).join(',');

            // 無限にソートと発火を繰り返すのを防ぐ
            if (origIndsStr === newIndsStr) {
                continue;
            }

            const payload = {
                dKey,
                nAsc,
            };

            yield put(sortTable(payload));
            continue;
        }

        // 降順ソートの時は 'fa-sort-amount-desc',
        // 昇順ソートの時は 'fa-sort-amount-asc'の
        // CSS classの要素がある

        const ascTh = document.querySelector('.fa-sort-amount-asc');
        const descTh = document.querySelector('.fa-sort-amount-desc');

        let th;
        if (ascTh) {
            th = ascTh;
            nAsc = true;
        } else if (descTh) {
            th = descTh;
            nAsc = false;
        }

        // thがnull、つまりソートされているカラムが無い場合は何もしない
        if (!th) {
            continue;
        }

        // FIXME これTemplateと重複しているが、どう抽出して持つといいのか分からん
        const tHead = [
            '',
            '連番',
            'リスト名',
            '手順数',
            '作成日時',
            '',
            '',
        ];

        const col = [
            'checkbox',
            'pInd',
            'title',
            'numberOfAlgs',
            'createdAt',
            'detail',
            'quiz',
        ];

        const tHeadText = th.parentNode.innerText.replace('\n', '');
        dKey = _.zip(tHead, col).filter(pair => pair[0] === tHeadText)[0][1];

        const newProblemLists = origProblemLists.slice();
        newProblemLists.sort((a, b) => {
            if (a[dKey] === b[dKey]) { return 0; }
            if (nAsc ? a[dKey] > b[dKey] : a[dKey] < b[dKey]) { return 1; }
            if (nAsc ? a[dKey] < b[dKey] : a[dKey] > b[dKey]) { return -1; }
            return 0;
        });

        const newIndsStr = newProblemLists.map(d => String(d.ind)).join(',');

        // 無限にソートと発火を繰り返すのを防ぐ
        if (origIndsStr === newIndsStr) {
            continue;
        }

        const payload = {
            dKey,
            nAsc,
        };

        yield put(sortTable(payload));
    }
}

const requestDeleteProblemListName = (part, problemListIds) => {
    const options = {
        url: `${config.apiRoot}/deleteThreeStyleQuizProblemListName/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            problemListIdsStr: problemListIds.join(','),
            token: localStorage.token,
        },
    };

    return rp(options);
};

function * handleDeleteProblemList () {
    while (true) {
        yield take(sagaDeleteProblemLists);
        const part = yield select(state => state.part);
        const problemLists = yield select(state => state.problemLists);

        const selectedProblemLists = problemLists.filter(rec => rec.isSelected);

        // パフォーマンス向上のため、削除処理は非同期に行う
        const problemListIds = selectedProblemLists.map(rec => rec.problemListId);
        requestDeleteProblemListName(part, problemListIds);

        const payload = {};
        yield put(deleteProblemLists(payload));
    }
}

const initialState = {
    url: null,
    loadWillSkipped: false,
    part: constant.dummyPartType,
    userName: localStorage.userName,
    titles: '',

    problemLists: [
        {
            ind: 0,
            pInd: 1,
            problemListId: null,
            userName: localStorage.userName,
            title: 'system_全手順',
            createdAt: moment('2018/01/01 00:00', 'YYYY/MM/DD HH:mm'),
            updatedAt: moment('2018/01/01 00:00', 'YYYY/MM/DD HH:mm'),
            numberOfAlgs: null,
            isSelectable: false,
            isSelected: false,
        },
    ],

    problemListsIndsStr: '',
    isCheckedSelectAll: false,
};

export const threeStyleProblemListReducer = handleActions(
    {
        [setLoadWillSkipped]: (state, action) => {
            const loadWillSkipped = action.payload.loadWillSkipped || false;
            return {
                ...state,
                loadWillSkipped,
            };
        },
        [inputTitles]: (state, action) => {
            const titles = action.payload.titles;
            return {
                ...state,
                titles,
            };
        },
        [loadThreeStyleQuizProblemList]: (state, action) => {
            const url = action.payload.url;
            const part = action.payload.part;

            const newProblemLists = action.payload.problemLists;
            const problemLists = _.cloneDeep(initialState.problemLists).concat(newProblemLists);

            // indとpIndを振り直す
            for (let i = 0; i < problemLists.length; i++) {
                problemLists[i].ind = i;
                problemLists[i].pInd = i + 1;
            }

            return {
                ...state,
                url,
                loadWillSkipped: true,
                part,
                problemLists,
            };
        },
        [createProblemLists]: (state, action) => {
            const newProblemLists = action.payload.newProblemLists;

            const problemLists = _.cloneDeep(state.problemLists).concat(newProblemLists);

            // indとpIndを振り直す
            for (let i = 0; i < problemLists.length; i++) {
                problemLists[i].ind = i;
                problemLists[i].pInd = i + 1;
            }

            return {
                ...state,
                titles: '',
                problemLists,
                problemListsIndsStr: problemLists.map(d => String(d.ind)).join(','),
            };
        },
        [sortTable]: (state, action) => {
            // https://github.com/Grace951/react-table/blob/1ebc9a1fbc2c8d4f113b1d47dad87596fe61c30c/src/SortableTbl.js#L55-L66

            const dKey = action.payload.dKey;
            const nAsc = action.payload.nAsc;
            const problemLists = state.problemLists.slice();

            problemLists.sort((a, b) => {
                if (a[dKey] === b[dKey]) { return 0; }
                if (nAsc ? a[dKey] > b[dKey] : a[dKey] < b[dKey]) { return 1; }
                if (nAsc ? a[dKey] < b[dKey] : a[dKey] > b[dKey]) { return -1; }
                return 0;
            });

            return {
                ...state,
                problemLists,
                problemListsIndsStr: problemLists.map(d => String(d.ind)).join(','),
            };
        },
        [selectRow]: (state, action) => {
            const pInd = action.payload.pInd;
            const newIsSelected = action.payload.newIsSelected;

            const problemLists = state.problemLists.slice();

            // ソートしていることがあるので、ここのindはレコードに含まれているindカラムの値ではない
            const ind = problemLists.findIndex(d => d.pInd === pInd);

            const newData = {
                ...problemLists[ind],
                isSelected: newIsSelected,
            };
            problemLists[ind] = newData;

            return {
                ...state,
                problemLists,
                problemListsIndsStr: problemLists.map(d => String(d.ind)).join(','),
            };
        },
        [deleteProblemLists]: (state, action) => {
            // DB内のデータの削除リクエストはhandleDeleteProblemList()で行われているので、
            // このReducer内では単に非表示にさせるだけ
            // indの振り直しはしない

            const problemLists = state.problemLists.filter(rec => !rec.isSelected);

            return {
                ...state,
                problemLists,
                problemListsIndsStr: problemLists.map(d => String(d.ind)).join(','),
            };
        },
        [toggleSelectAll]: (state, action) => {
            // threeStyleProblemListDetailのtoggleSelectAll()とほぼ同じ
            const newIsCheckedSelectAll = !state.isCheckedSelectAll;

            const searchBox = document.querySelector('.sortable-table .search-box .search');
            const searchWord = searchBox ? searchBox.value : '';

            // 画面に見えている問題リスト全てのチェック状態を、newIsCheckedSelectAllと同じにする
            // ただし、isSelectableがtrueの問題リストのみ。 (ここがthreeStyleProblemListDetailと違うところ)
            const newProblemLists = state.problemLists
                .map((row, i) => {
                    if (row.isSelectable && threeStyleQuizListUtils.isSelectedRow(searchWord, row)) {
                        row.isSelected = newIsCheckedSelectAll;
                        return row;
                    } else {
                        return row;
                    }
                });

            return {
                ...state,
                isCheckedSelectAll: newIsCheckedSelectAll,
                problemLists: newProblemLists,
                problemListsIndsStr: newProblemLists.map(d => String(d.ind)).join(','),
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleCreateProblemLists);
    yield fork(handleLoadThreeStyleQuizProblemList);
    yield fork(handleSortTable);
    yield fork(handleDeleteProblemList);
};
