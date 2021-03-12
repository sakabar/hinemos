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
const threeStyleQuizProblemListUtils = require('../threeStyleQuizProblemListUtils');
const utils = require('../utils');
const numberingUtils = require('../numberingUtils.js');
const threeStyleUtils = require('../threeStyleUtils');
const _ = require('lodash');
const moment = require('moment');

const SET_LOAD_WILL_SKIPPED = 'SET_LOAD_WILL_SKIPPED';
export const setLoadWillSkipped = createAction(SET_LOAD_WILL_SKIPPED);

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

const TOGGLE_ADD_ANCESTORS = 'TOGGLE_ADD_ANCESTORS';
export const toggleAddAncestors = createAction(TOGGLE_ADD_ANCESTORS);

const CHANGE_SELECT_ALL = 'CHANGE_SELECT_ALL';
export const toggleSelectAll = createAction(CHANGE_SELECT_ALL);

const SELECT_ALGORITHM = 'SELECT_ALGORITHM';
export const selectAlgorithm = createAction(SELECT_ALGORITHM);

const SORT_TABLE = 'SORT_TABLE';
const sortTable = createAction(SORT_TABLE);
const SAGA_SORT_TABLE = 'SAGA_SORT_TABLE';
export const sagaSortTable = createAction(SAGA_SORT_TABLE);

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
        const detailRes = yield call(threeStyleQuizProblemListUtils.requestGetThreeStyleQuizProblemListDetail, part, problemListId);
        const details = detailRes.result;
        const buffer = detailRes.buffer;

        const threeStyleQuizProblemListsRes = yield call(threeStyleQuizProblemListUtils.requestGetThreeStyleQuizProblemList, part);

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

            const tryCnt = (stickers in stickersToQuizLog) ? stickersToQuizLog[stickers].tried : 0;
            const solveCnt = (stickers in stickersToQuizLog) ? stickersToQuizLog[stickers].solved : 0;
            const acc = (tryCnt > 0) ? 1.0 * solveCnt / tryCnt : null;
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

                const na = 'N/A';
                // FIXME マジックナンバーがクイズのページとここに分散している
                const MAX_TRY_CNT = 3;
                // テーブルの検索窓でフィルタしやすいように、充分に覚えていない手順についてはaccに*印を付ける
                const dispAcc = (acc === 1.0 && tryCnt >= MAX_TRY_CNT) ? acc.toFixed(2) : (acc === null ? `${(0).toFixed(2)}*` : `${acc.toFixed(2)}*`);
                const dispAvgSec = avgSec ? parseFloat(avgSec.toFixed(2)) : na;
                const dispTps = tps === null ? (0).toFixed(2) : tps.toFixed(2);

                const record = {
                    ...detail,
                    moves,
                    acc,
                    avgSec,
                    tps,
                    isSelectable: true,
                    isSelected: false,
                    letters,
                    // 「全て選択」の際、フィルタ条件に"「"が入っている時も正しく処理ができるように、
                    // 表示表にテーブルに渡したカッコ付きの文字列をstateでも持っておく
                    tryCnt,
                    solveCnt,
                    dispLetters,
                    dispAcc,
                    dispAvgSec,
                    dispTps,
                    createdAt,
                    updatedAt,
                };

                threeStyleQuizProblemListDetail.push(record);
            });
        });

        // tps順asc, タイムdesc, ナンバリングascでソートする
        // indの情報はレコードの数が確定してから追加する必要があるので最後にやっている
        const detailsWithInd = _.orderBy(threeStyleQuizProblemListDetail,
            [ 'dispTps', 'dispAvgSec', 'dispLetters', ],
            [ 'asc', 'desc', 'asc', ])
            .map((rec, ind) => {
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

        if (!selectedProblemListId) {
            alert('対象の問題リストが選択されていません');
            continue;
        }

        const targetAlgs = threeStyleQuizProblemListDetail
            .filter(alg => alg.isSelected);
        const targetStickersList = targetAlgs.map(alg => alg.stickers);

        if (targetAlgs.length === 0) {
            alert('手順が選択されていません');
            continue;
        }

        // 「セットアップ先の手順も併せて追加」にチェックが付いている場合は、
        // 問題リスト一覧を参照して親手順を追加
        // 高々数百手順見ればOKなのでそれほど時間はかからない想定
        const isCheckedAddAncestors = yield select(state => state.isCheckedAddAncestors);
        if (isCheckedAddAncestors) {
            const threeStyleQuizProblemLists = yield select(state => state.threeStyleQuizProblemLists);

            // 注: system_auto_がマジックナンバーだ
            // 例: system_auto_041_むさ_as_[D:にさ]
            const threeStyleQuizProblemListNames = threeStyleQuizProblemLists
                .map(lst => lst.title)
                .filter(title => title.startsWith('system_auto_'))
                .filter(title => !title.endsWith('_as_new'));

            const parentDict = {};
            for (let i = 0; i < threeStyleQuizProblemListNames.length; i++) {
                const title = threeStyleQuizProblemListNames[i];

                const letter = title.split('_')[3];
                const m = title.match(/\[.*:(.*)\]/);
                if (!m) {
                    continue;
                }

                const parent = m[1];
                parentDict[letter] = parent;
            }

            // ナンバリングはstateに保存するほどではないか?
            const userName = yield select(state => state.userName);
            const numberings = yield call(numberingUtils.getNumbering, userName, part);
            const letterToSticker = {};

            for (let i = 0; i < numberings.length; i++) {
                const numbering = numberings[i];
                const letter = numbering.letter;
                const sticker = numbering.sticker;

                letterToSticker[letter] = sticker;
            }
            const bufferSticker = letterToSticker['@'];

            const q = targetAlgs.map(alg => alg.letters);
            // どこかで_as_newの手順にたどり着くので、有限回のループで止まる
            while (q.length > 0) {
                const childLetters = q.pop();
                const parentLetters = parentDict[childLetters];
                if (!parentLetters) {
                    continue;
                }

                const sticker1 = letterToSticker[parentLetters[0]];
                const sticker2 = letterToSticker[parentLetters[1]];
                const stickers = `${bufferSticker} ${sticker1} ${sticker2}`;

                targetStickersList.push(stickers);
                q.push(parentLetters);
            }
        }

        const stickersStr = targetStickersList.join(',');

        const promiseFunc = (part, selectedProblemListId, stickersStr) => {
            return threeStyleQuizProblemListUtils.requestPostThreeStyleQuizProblemListDetail(part, selectedProblemListId, stickersStr)
                .then(() => {
                    alert('保存しました');
                    return [];
                })
                .catch((err) => {
                    alert(`3-style問題リストの登録に失敗しました: ${err}`);
                    return [];
                });
        };

        yield call(promiseFunc, part, selectedProblemListId, stickersStr);
    }
}

function * handleSortTable () {
    while (true) {
        const action = yield take(sagaSortTable);

        const origDetail = yield select(state => state.threeStyleQuizProblemListDetail);
        const origIndsStr = yield select(state => state.threeStyleQuizProblemListDetailIndsStr);

        // dKey, nAscが指定されているときはその設定でソート
        // nullの場合は現在のソート状態を取得してその通りにソート
        let dKey = action.payload.dKey;
        let nAsc = action.payload.nAsc;

        if ((dKey !== null) || (nAsc !== null)) {
            const newDetail = origDetail.slice();
            newDetail.sort((a, b) => {
                if (a[dKey] === b[dKey]) { return 0; }
                if (nAsc ? a[dKey] > b[dKey] : a[dKey] < b[dKey]) { return 1; }
                if (nAsc ? a[dKey] < b[dKey] : a[dKey] > b[dKey]) { return -1; }
                return 0;
            });

            const newIndsStr = newDetail.map(d => String(d.ind)).join(',');

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
            'ナンバリング',
            'ステッカー',
            '手順',
            '正解率',
            '平均タイム',
            'tps',
            '手順作成日時',
            '操作',
        ];

        const col = [
            'checkbox',
            'pInd',
            'letters',
            'stickers',
            'moves',
            'acc',
            'avgSec',
            'tps',
            'createdAt',
            'operation',
        ];

        const tHeadText = th.parentNode.innerText.replace('\n', '');
        dKey = _.zip(tHead, col).filter(pair => pair[0] === tHeadText)[0][1];

        const newDetail = origDetail.slice();
        newDetail.sort((a, b) => {
            if (a[dKey] === b[dKey]) { return 0; }
            if (nAsc ? a[dKey] > b[dKey] : a[dKey] < b[dKey]) { return 1; }
            if (nAsc ? a[dKey] < b[dKey] : a[dKey] > b[dKey]) { return -1; }
            return 0;
        });

        const newIndsStr = newDetail.map(d => String(d.ind)).join(',');

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

const initialState = {
    url: null,
    loadWillSkipped: false,
    part: constant.dummyPartType,
    userName: localStorage.userName,
    problemListId: null,
    isCheckedAddAncestors: true,
    isCheckedSelectAll: false,
    threeStyleQuizProblemLists: [], // [ { problemListId: , title: , } ]
    selectedProblemListId: null,
    threeStyleQuizProblemListDetail: [],
    threeStyleQuizProblemListDetailIndsStr: '',
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
                loadWillSkipped: true,
                isCheckedSelectAll: false,
                part,
                problemListId,
                threeStyleQuizProblemLists,
                threeStyleQuizProblemListDetail,
                threeStyleQuizProblemListDetailIndsStr: threeStyleQuizProblemListDetail.map(d => String(d.ind)).join(','),
                threeStyles,
            };
        },
        [setLoadWillSkipped]: (state, action) => {
            const loadWillSkipped = action.payload.loadWillSkipped || false;
            return {
                ...state,
                loadWillSkipped,
            };
        },
        [selectAlgorithm]: (state, action) => {
            const pInd = action.payload.pInd;
            const newIsSelected = action.payload.newIsSelected;

            const threeStyleQuizProblemListDetail = _.cloneDeep(state.threeStyleQuizProblemListDetail);

            // ソートしていることがあるので、ここのindはレコードに含まれているindカラムの値ではない
            const ind = threeStyleQuizProblemListDetail.findIndex(d => d.pInd === pInd);

            const newData = {
                ...threeStyleQuizProblemListDetail[ind],
                isSelected: newIsSelected,
            };
            threeStyleQuizProblemListDetail[ind] = newData;

            return {
                ...state,
                threeStyleQuizProblemListDetail,
                threeStyleQuizProblemListDetailIndsStr: threeStyleQuizProblemListDetail.map(d => String(d.ind)).join(','),
            };
        },
        [selectProblemList]: (state, action) => {
            const selectedProblemListId = action.payload.selectedProblemListId;
            return {
                ...state,
                selectedProblemListId,
            };
        },
        [toggleAddAncestors]: (state, action) => {
            return {
                ...state,
                isCheckedAddAncestors: !state.isCheckedAddAncestors,
            };
        },
        [toggleSelectAll]: (state, action) => {
            const newIsCheckedSelectAll = !state.isCheckedSelectAll;

            const searchBox = document.querySelector('.sortable-table .search-box .search');
            const searchWord = searchBox ? searchBox.value : '';

            // 画面に見えている手順全てのチェック状態を、newIsCheckedSelectAllと同じにする
            const newThreeStyleQuizProblemListDetail = state.threeStyleQuizProblemListDetail
                .map((row, i) => {
                    if (threeStyleQuizProblemListUtils.isSelectedRow(searchWord, row)) {
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
                threeStyleQuizProblemListDetailIndsStr: newThreeStyleQuizProblemListDetail.map(d => String(d.ind)).join(','),
            };
        },
        [sortTable]: (state, action) => {
            // https://github.com/Grace951/react-table/blob/1ebc9a1fbc2c8d4f113b1d47dad87596fe61c30c/src/SortableTbl.js#L55-L66

            const dKey = action.payload.dKey;
            const nAsc = action.payload.nAsc;
            const threeStyleQuizProblemListDetail = state.threeStyleQuizProblemListDetail.slice();

            threeStyleQuizProblemListDetail.sort((a, b) => {
                if (a[dKey] === b[dKey]) { return 0; }
                if (nAsc ? a[dKey] > b[dKey] : a[dKey] < b[dKey]) { return 1; }
                if (nAsc ? a[dKey] < b[dKey] : a[dKey] > b[dKey]) { return -1; }
                return 0;
            });

            return {
                ...state,
                threeStyleQuizProblemListDetail,
                threeStyleQuizProblemListDetailIndsStr: threeStyleQuizProblemListDetail.map(d => String(d.ind)).join(','),
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleLoadInitially);
    yield fork(handleAddToProblemList);
    yield fork(handleSortTable);
};
