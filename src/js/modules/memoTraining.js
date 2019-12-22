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
// import {
//     delay,
// } from 'redux-saga';
// const moment = require('moment');
const memoTrainingUtils = require('../memoTrainingUtils');
const _ = require('lodash');

// Settingモード
const SET_DECK_NUM = 'SET_DECK_NUM';
const SET_DECK_SIZE = 'SET_DECK_SIZE';
const SET_PAIR_SIZE = 'SET_PAIR_SIZE';

export const setDeckNum = createAction(SET_DECK_NUM);
export const setDeckSize = createAction(SET_DECK_SIZE);
export const setPairSize = createAction(SET_PAIR_SIZE);

// モード選択系のアクション
const START_MEMORIZATION_PHASE = 'START_MEMORIZATION_PHASE';
const FINISH_MEMORIZATION_PHASE = 'FINISH_MEMORIZATION_PHASE';

// 外からはsaga-*アクションを動かすので、exportしない
const startMemorizationPhase = createAction(START_MEMORIZATION_PHASE);
export const finishMemorizationPhase = createAction(FINISH_MEMORIZATION_PHASE);

const SAGA_START_MEMORIZATION_PHASE = 'SAGA_START_TRANSFORMATION_PHASE';
export const sagaStartMemorizationPhase = createAction(SAGA_START_MEMORIZATION_PHASE);

const SAGA_FINISH_RECALL_PHASE = 'SAGA_FINISH_RECALL_PHASE';
export const sagaFinishRecallPhase = createAction(SAGA_FINISH_RECALL_PHASE);

// 移動する系のアクション
const GO_TO_NEXT_PAIR = 'GO_TO_NEXT_PAIR';
const GO_TO_PREV_PAIR = 'GO_TO_PREV_PAIR';
const GO_TO_NEXT_DECK = 'GO_TO_NEXT_DECK';
const GO_TO_DECK_HEAD = 'GO_TO_DECK_HEAD';

// 外からはsaga-*アクションを動かすので、exportしない
const goToNextPair = createAction(GO_TO_NEXT_PAIR);
const goToPrevPair = createAction(GO_TO_PREV_PAIR);
const goToNextDeck = createAction(GO_TO_NEXT_DECK);
const goToDeckHead = createAction(GO_TO_DECK_HEAD);

// redux-sagaがハンドルするアクション
const SAGA_GO_TO_NEXT_PAIR = 'SAGA_GO_TO_NEXT_PAIR';
const SAGA_GO_TO_PREV_PAIR = 'SAGA_GO_TO_PREV_PAIR';
const SAGA_GO_TO_NEXT_DECK = 'SAGA_GO_TO_NEXT_DECK';
const SAGA_GO_TO_DECK_HEAD = 'SAGA_GO_TO_DECK_HEAD';

export const sagaGoToNextPair = createAction(SAGA_GO_TO_NEXT_PAIR);
export const sagaGoToPrevPair = createAction(SAGA_GO_TO_PREV_PAIR);
export const sagaGoToNextDeck = createAction(SAGA_GO_TO_NEXT_DECK);
export const sagaGoToDeckHead = createAction(SAGA_GO_TO_DECK_HEAD);

// const SHOW_TIME = 'SHOW_TIME';
// export const showTime = createAction(SHOW_TIME);

// 回答phaseでのアクション
const UPDATE_SOLUTION = 'UPDATE_SOLUTION';
export const updateSolution = createAction(UPDATE_SOLUTION);

const initialState = {
    userName: localStorage.userName, // ユーザ名
    startMiliUnixtime: 0, // 記憶を開始したミリUnixtime
    deckNum: 1, // 束数
    deckSize: undefined, // 1束の枚数。UIで指定されなかった場合は記憶/分析の開始時に種目ごとのデフォルト値に設定する
    pairSize: 1, // 何イメージをペアにするか
    memoEvent: undefined, // 'cards, numbers,'
    mode: undefined, // 'transformation, memorization'
    phase: memoTrainingUtils.TrainingPhase.setting,
    decks: [ [], ],
    solution: [ [], ],
    deckInd: 0,
    pairInd: 0,
};

function * handleStartMemorizationPhase () {
    while (true) {
        const action = yield take(sagaStartMemorizationPhase);

        const memoEvent = action.payload.memoEvent;
        const deckNum = action.payload.deckNum;

        // もしselectがデフォルトのままで渡されたdeckSizeがundefinedなら、種目ごとのデフォルト値を設定する
        const deckSize = (() => {
            if (action.payload.deckSize) {
                return action.payload.deckSize;
            }
            if (memoEvent === memoTrainingUtils.MemoEvent.cards) {
                return 52;
            }
            return 1;
        })();

        // もしselectがデフォルトのままで渡されたpairSizeがundefinedなら、1を設定する
        console.dir(`${JSON.stringify(action.payload)}`);
        const pairSize = action.payload.pairSize ? action.payload.pairSize : 1;
        console.dir(`deckSize, pairSize = ${deckSize}, ${pairSize}`);

        const userName = yield select(state => state.userName);

        const numberingCorner = yield call(memoTrainingUtils.fetchNumberingCorner, userName);
        const numberingEdge = yield call(memoTrainingUtils.fetchNumberingEdge, userName);

        // 本来は複数人が同じスクランブルをやる時のために、
        // 最初に[[element]] を生成してからその人のpairSizeごとに分割するべきだが、
        // それはまだ構想段階なので今はやらない。
        // 代わりに、その人のためのdecksを生成してからそれをaggしてpairを消してpostすることにした。
        // これで、上の構想を実現する時にもテーブルに矛盾は起こらないはず

        const decks = (() => {
            if (memoEvent === memoTrainingUtils.MemoEvent.mbld) {
                return memoTrainingUtils.generateMbldDecks(numberingCorner, numberingEdge, deckNum, pairSize);
            } else if (memoEvent === memoTrainingUtils.MemoEvent.cards) {
                console.dir(`${JSON.stringify({ deckNum, deckSize, pairSize, })}`);
                return memoTrainingUtils.generateCardsDecks(deckNum, deckSize, pairSize);
            } else {
                throw new Error('Unexpected event');
            }
        })();

        // console.dir(JSON.stringify(decks));

        const elementsList = (() => {
            if (memoEvent === memoTrainingUtils.MemoEvent.mbld) {
                return memoTrainingUtils.mbldDecksToElementsList(decks);
            } else if (memoEvent === memoTrainingUtils.MemoEvent.cards) {
                return memoTrainingUtils.generateCardsDecks(deckNum, deckSize, pairSize);
            } else {
                throw new Error('Unexpected event');
            }
        })();

        // attemptをPOSTする。何か返ってくる
        const res = yield call(memoTrainingUtils.postTrial, elementsList);
        // 一応表示しておく。
        console.dir(JSON.stringify(res));

        const payload = {
            ...action.payload,
            deckSize,
            pairSize,
            decks,
        };

        yield put(startMemorizationPhase(payload));
    }
};

function * handleGoToNextPair () {
    while (true) {
        yield take(sagaGoToNextPair);
        memoTrainingUtils.postMemoLog();
        yield put(goToNextPair());
    }
};

function * handleGoToPrevPair () {
    while (true) {
        yield take(sagaGoToPrevPair);
        memoTrainingUtils.postMemoLog();
        yield put(goToPrevPair());
    }
};

function * handleGoToNextDeck () {
    while (true) {
        yield take(sagaGoToNextDeck);
        memoTrainingUtils.postMemoLog();
        yield put(goToNextDeck());
    }
};

function * handleGoToDeckHead () {
    while (true) {
        yield take(sagaGoToDeckHead);
        memoTrainingUtils.postMemoLog();
        yield put(goToDeckHead());
    }
};

function * handleFinishRecallPhase () {
    while (true) {
        yield take(sagaFinishRecallPhase);

        const decks = yield select(state => state.decks);
        const solution = yield select(state => state.solution);

        for (let i = 0; i < decks.length; i++) {
            const deck = decks[i];

            for (let k = 0; k < deck.length; k++) {
                const pair = deck[k];

                for (let m = 0; m < pair.length; m++) {
                    let solutionElement = {
                        elementType: 'letter',
                        element: '',
                    };
                    if (typeof solution[i] !== 'undefined') {
                        if (typeof solution[i][k] !== 'undefined') {
                            if (typeof solution[i][k][m] !== 'undefined') {
                                solutionElement = solution[i][k][m];
                            }
                        }
                    }

                    if (_.isEqual(pair[m], solutionElement)) {
                        // 正解をpostする
                        memoTrainingUtils.postRecallLog(`OK: ${JSON.stringify(pair[m])}`);
                    } else {
                        // 不正解をpostする?
                        memoTrainingUtils.postRecallLog(`NG: ${JSON.stringify(pair[m])} !== ${JSON.stringify(solutionElement)}`);
                    }
                }
            }
        }
    }
};

// FIXME
// focusSolutionPairのアクションがいるかもね

export const memoTrainingReducer = handleActions(
    {
        [setDeckNum]: (state, action) => {
            return {
                ...state,
                deckNum: action.payload.deckNum,
            };
        },
        [setDeckSize]: (state, action) => {
            return {
                ...state,
                deckSize: action.payload.deckSize,
            };
        },
        [setPairSize]: (state, action) => {
            return {
                ...state,
                pairSize: action.payload.pairSize,
            };
        },
        [startMemorizationPhase]: (state, action) => {
            if (typeof state.mode === 'undefined') {
                return {
                    ...state,
                    memoEvent: action.payload.memoEvent,
                    deckSize: action.payload.deckSize,
                    decks: action.payload.decks,
                    startMiliUnixtime: action.payload.currentMiliUnixtime,
                    mode: action.payload.mode,
                    phase: memoTrainingUtils.TrainingPhase.memorization,
                };
            }

            // Modeが既に決定しているのにまたModeを決定するのは意図していないので、何もしない
            return {
                ...state,
            };
        },
        [finishMemorizationPhase]: (state, action) => {
            return {
                ...state,
                phase: memoTrainingUtils.TrainingPhase.recall,
                deckInd: 0,
                pairInd: 0,
            };
        },
        [goToNextPair]: (state, action) => {
            if (state.pairInd === state.decks[state.deckInd].length - 1) {
                // 右端
                if (state.deckInd === state.decks.length - 1) {
                    // ペアもデッキも右端なので何もしない
                    return {
                        ...state,
                    };
                } else {
                    // 次のデッキに進む
                    return {
                        ...state,
                        deckInd: state.deckInd + 1,
                        pairInd: 0,
                    };
                }
            } else {
                // 右端じゃないので1つ進むだけ
                return {
                    ...state,
                    pairInd: state.pairInd + 1,
                };
            }
        },
        [goToPrevPair]: (state, action) => {
            if (state.pairInd === 0) {
                // 左端
                if (state.deckInd === 0) {
                    // ペアもデッキも左端なので何もしない
                    return {
                        ...state,
                    };
                } else {
                    // 前のデッキに戻る
                    const newDeckInd = state.deckInd - 1;
                    return {
                        ...state,
                        deckInd: newDeckInd,
                        pairInd: state.decks[newDeckInd].length - 1,
                    };
                }
            } else {
                // 左端じゃないので1つ戻るだけ
                return {
                    ...state,
                    pairInd: state.pairInd - 1,
                };
            }
        },
        [goToDeckHead]: (state, action) => {
            // もし先頭のペアを見ている時は、前のデッキに戻る
            return {
                ...state,
                deckInd: state.pairInd === 0 && state.deckInd > 0 ? state.deckInd - 1 : state.deckInd,
                pairInd: 0,

            };
        },
        [goToNextDeck]: (state, action) => {
            if (state.deckInd === state.decks.length - 1) {
                // デッキが右端なので何もしない
                return {
                    ...state,
                };
            } else {
                // 次のデッキに進む
                return {
                    ...state,
                    deckInd: state.deckInd + 1,
                    pairInd: 0,
                };
            }
        },
        [updateSolution]: (state, action) => {
            const newSolution = _.cloneDeep(state.solution);
            // FIXME ここでsplitしていいのか?
            // なんか切り方が雑~
            const pair = action.payload.input.split(/(.{1})/).filter(s => s !== '' && s !== ' ').map(letter => {
                return {
                    elementType: 'letter',
                    element: letter,
                };
            });
            if (typeof newSolution[action.payload.deckInd] === 'undefined') {
                newSolution[action.payload.deckInd] = [];
            }
            newSolution[action.payload.deckInd][action.payload.pairInd] = pair;

            return {
                ...state,
                solution: newSolution,
            };
        },
    },
    initialState
);

// FIXME
// finishRecallPhaseしたら、結果をDBにPOSTして結果画面に遷移
// postが終わったらReducerを初期化して次に遷移してきた時は最初からスタート
// [finishRecallPhase]: (state, action) => {
//     return {
//         ...state,
//         phase: memoTrainingUtils.TrainingPhase.result,
//     };
// },

export function * rootSaga () {
    yield fork(handleStartMemorizationPhase);

    yield fork(handleGoToNextPair);
    yield fork(handleGoToPrevPair);
    yield fork(handleGoToNextDeck);
    yield fork(handleGoToDeckHead);

    yield fork(handleFinishRecallPhase);
};
