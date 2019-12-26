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
import {
    delay,
} from 'redux-saga';
// const moment = require('moment');
const memoTrainingUtils = require('../memoTrainingUtils');
const moment = require('moment');
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
// 外からはsaga-*アクションを動かすので、exportしない
const startMemorizationPhase = createAction(START_MEMORIZATION_PHASE);

const FINISH_MEMORIZATION_PHASE = 'FINISH_MEMORIZATION_PHASE';
const finishMemorizationPhase = createAction(FINISH_MEMORIZATION_PHASE);

const SAGA_FINISH_MEMORIZATION_PHASE = 'SAGA_FINISH_MEMORIZATION_PHASE';
export const sagaFinishMemorizationPhase = createAction(SAGA_FINISH_MEMORIZATION_PHASE);

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

const TOGGLE_TIMER = 'TOGGLE_TIMER';
const SAGA_TOGGLE_TIMER = 'SAGA_TOGGLE_TIMER';
const toggleTimer = createAction(TOGGLE_TIMER);
export const sagaToggleTimer = createAction(SAGA_TOGGLE_TIMER);

const UPDATE_TIMER = 'UPDATE_TIMER';
const updateTimer = createAction(UPDATE_TIMER);

// 回答phaseでのアクション
const UPDATE_MBLD_SOLUTION = 'UPDATE_MBLD_SOLUTION';
export const updateMbldSolution = createAction(UPDATE_MBLD_SOLUTION);

const SAGA_ON_KEY_DOWN = 'SAGA_ON_KEY_DOWN';
export const sagaOnKeyDown = createAction(SAGA_ON_KEY_DOWN);

const initialState = {
    userName: localStorage.userName, // ユーザ名
    startMemoMiliUnixtime: 0, // 記憶を開始したミリUnixtime
    startRecallMiliUnixtime: 0, // 記憶を開始したミリUnixtime
    timerMiliUnixtime: 0,
    timeVisible: false,

    trialId: 0,
    deckElementIdPairsLists: [ [], ],
    switchedPairMiliUnixtime: 0,

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

        const currentMiliUnixtime = parseInt(moment().format('x'));

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
        const pairSize = action.payload.pairSize ? action.payload.pairSize : 1;

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
                return memoTrainingUtils.generateCardsDecks(deckNum, deckSize, pairSize);
            } else {
                throw new Error('Unexpected event');
            }
        })();

        const elementsList = memoTrainingUtils.decksToElementsList(decks);

        // trialをPOSTする。何か返ってくる
        const mode = action.payload.mode;
        const res = yield call(memoTrainingUtils.postTrial, mode, elementsList);

        // 一応表示しておく。
        console.dir(JSON.stringify(res));

        const trialId = res.trialId;
        const deckElementIdPairsLists = res.deckElementIdsList
            .map(deckElementIds => _.chunk(deckElementIds, pairSize));

        const payload = {
            ...action.payload,
            trialId,
            deckElementIdPairsLists,
            currentMiliUnixtime,
            deckSize,
            pairSize,
            decks,
        };

        yield put(startMemorizationPhase(payload));
    }
};

function * handleSwitchPair (currentMiliUnixtime) {
    const switchedPairMiliUnixtime = yield select(state => state.switchedPairMiliUnixtime);
    const sec = (currentMiliUnixtime - switchedPairMiliUnixtime) / 1000.0;

    // const decks = yield select(state => state.decks);
    // const pair = decks[deckInd][pairInd];

    const deckInd = yield select(state => state.deckInd);
    const pairInd = yield select(state => state.pairInd);
    const deckElementIdPairsLists = yield select(state => state.deckElementIdPairsLists);
    const deckElementIdPair = deckElementIdPairsLists[deckInd][pairInd];

    // DBに登録する秒数の和が実際の消費時間になるようにするために平均する
    const avgSec = 1.0 * sec / deckElementIdPair.length;

    const trialId = yield select(state => state.trialId);
    for (let posInd = 0; posInd < deckElementIdPair.length; posInd++) {
        // const element = pair[posInd];
        const deckElementId = deckElementIdPair[posInd];
        const arg = {
            trialId,
            deckInd,
            pairInd,
            posInd,
            deckElementId,
            sec: avgSec,
        };
        memoTrainingUtils.postMemoLog(arg);
    }
};

function * handleGoToNextPair () {
    while (true) {
        yield take(sagaGoToNextPair);

        const currentMiliUnixtime = parseInt(moment().format('x'));
        yield fork(handleSwitchPair, currentMiliUnixtime);

        yield put(goToNextPair({ currentMiliUnixtime, }));
    }
};

function * handleGoToPrevPair () {
    while (true) {
        yield take(sagaGoToPrevPair);

        const currentMiliUnixtime = parseInt(moment().format('x'));
        yield fork(handleSwitchPair, currentMiliUnixtime);

        yield put(goToPrevPair({ currentMiliUnixtime, }));
    }
};

function * handleGoToNextDeck () {
    while (true) {
        yield take(sagaGoToNextDeck);

        const currentMiliUnixtime = parseInt(moment().format('x'));
        yield fork(handleSwitchPair, currentMiliUnixtime);

        yield put(goToNextDeck({ currentMiliUnixtime, }));
    }
};

function * handleGoToDeckHead () {
    while (true) {
        yield take(sagaGoToDeckHead);

        const currentMiliUnixtime = parseInt(moment().format('x'));
        yield fork(handleSwitchPair, currentMiliUnixtime);

        yield put(goToDeckHead({ currentMiliUnixtime, }));
    }
};

function * handleFinishMemorizationPhase () {
    while (true) {
        yield take(sagaFinishMemorizationPhase);

        const currentMiliUnixtime = parseInt(moment().format('x'));
        yield fork(handleSwitchPair, currentMiliUnixtime);

        yield put(finishMemorizationPhase({ currentMiliUnixtime, }));
    }
}

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

function * handleToggleTimer () {
    while (true) {
        yield take(sagaToggleTimer);

        yield fork(handleUpdateTimer);
        yield put(toggleTimer());
        // yield put(delayToggleTimer());

        const sec = 3;
        for (let i = 0; i < sec; i++) {
            yield call(delay, 1000);
            yield fork(handleUpdateTimer);
        }
        yield put(toggleTimer());
    }
};

function * handleUpdateTimer () {
    const currentMiliUnixtime = parseInt(moment().format('x'));
    const phase = yield select(state => state.phase);
    const startMemoMiliUnixtime = yield select(state => state.startMemoMiliUnixtime);
    const startRecallMiliUnixtime = yield select(state => state.startRecallMiliUnixtime);

    const timerMiliUnixtime = (() => {
        if (phase === memoTrainingUtils.TrainingPhase.memorization) {
            return currentMiliUnixtime - startMemoMiliUnixtime;
        } else if (phase === memoTrainingUtils.TrainingPhase.recall) {
            return currentMiliUnixtime - startRecallMiliUnixtime;
        } else {
            return 0;
        }
    })();

    const payload = {
        timerMiliUnixtime,
    };

    yield put(updateTimer(payload));
};

const ENTER_KEYCODE = 13;
const LEFT_KEYCODE = 37;
const UP_KEYCODE = 38;
const RIGHT_KEYCODE = 39;
const DOWN_KEYCODE = 40;

function * handleKeyDown () {
    while (true) {
        const action = yield take(sagaOnKeyDown);
        const phase = yield select(state => state.phase);

        if (phase === memoTrainingUtils.TrainingPhase.memorization) {
            if (action.payload.keyCode === LEFT_KEYCODE) {
                yield put(sagaGoToPrevPair());
                continue;
            } else if (action.payload.keyCode === RIGHT_KEYCODE) {
                yield put(sagaGoToNextPair());
                continue;
            } else if (action.payload.keyCode === UP_KEYCODE) {
                yield put(sagaGoToDeckHead());
                continue;
            } else if (action.payload.keyCode === DOWN_KEYCODE) {
                yield put(sagaGoToNextDeck());
                continue;
            } else if (action.payload.keyCode === ENTER_KEYCODE) {
                yield put(sagaFinishMemorizationPhase());
                continue;
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
                    trialId: action.payload.trialId,
                    deckElementIdPairsLists: action.payload.deckElementIdPairsLists,
                    switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,

                    memoEvent: action.payload.memoEvent,
                    deckSize: action.payload.deckSize,
                    decks: action.payload.decks,
                    startMemoMiliUnixtime: action.payload.currentMiliUnixtime,
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
                startRecallMiliUnixtime: action.payload.currentMiliUnixtime,
                deckInd: 0,
                pairInd: 0,
            };
        },
        [goToNextPair]: (state, action) => {
            if (state.pairInd === state.decks[state.deckInd].length - 1) {
                // 右端
                if (state.deckInd === state.decks.length - 1) {
                    // ペアもデッキも右端なので何もしない
                    // saga-*のイベントは起こるので、タイムは更新しておく
                    return {
                        ...state,
                        switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,
                    };
                } else {
                    // 次のデッキに進む
                    return {
                        ...state,
                        switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,
                        deckInd: state.deckInd + 1,
                        pairInd: 0,
                    };
                }
            } else {
                // 右端じゃないので1つ進むだけ
                return {
                    ...state,
                    switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,
                    pairInd: state.pairInd + 1,
                };
            }
        },
        [goToPrevPair]: (state, action) => {
            if (state.pairInd === 0) {
                // 左端
                if (state.deckInd === 0) {
                    // ペアもデッキも左端なので何もしない
                    // saga-*のイベントは起こるので、タイムは更新しておく
                    return {
                        ...state,
                        switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,
                    };
                } else {
                    // 前のデッキに戻る
                    const newDeckInd = state.deckInd - 1;
                    return {
                        ...state,
                        switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,
                        deckInd: newDeckInd,
                        pairInd: state.decks[newDeckInd].length - 1,
                    };
                }
            } else {
                // 左端じゃないので1つ戻るだけ
                return {
                    ...state,
                    switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,
                    pairInd: state.pairInd - 1,
                };
            }
        },
        [goToDeckHead]: (state, action) => {
            // もし先頭のペアを見ている時は、前のデッキに戻る
            return {
                ...state,
                switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,
                deckInd: state.pairInd === 0 && state.deckInd > 0 ? state.deckInd - 1 : state.deckInd,
                pairInd: 0,

            };
        },
        [goToNextDeck]: (state, action) => {
            if (state.deckInd === state.decks.length - 1) {
                // デッキが右端なので何もしない
                // saga-*のイベントは起こるので、タイムは更新しておく
                return {
                    ...state,
                    switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,
                };
            } else {
                // 次のデッキに進む
                return {
                    ...state,
                    switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,
                    deckInd: state.deckInd + 1,
                    pairInd: 0,
                };
            }
        },
        [updateMbldSolution]: (state, action) => {
            const pairSize = action.payload.pairSize;
            // pair = [ "あい", "う", ]
            const pair = _.chunk(action.payload.pairStr, pairSize).map(chars => chars.join(''));
            const elementPair = pair.map(letters => new memoTrainingUtils.MbldElement(letters));

            const newSolution = _.cloneDeep(state.solution);
            if (typeof newSolution[action.payload.deckInd] === 'undefined') {
                newSolution[action.payload.deckInd] = [];
            }
            newSolution[action.payload.deckInd][action.payload.pairInd] = elementPair;

            return {
                ...state,
                solution: newSolution,
            };
        },
        [toggleTimer]: (state, action) => {
            return {
                ...state,
                timeVisible: !state.timeVisible,
            };
        },
        [updateTimer]: (state, action) => {
            return {
                ...state,
                timerMiliUnixtime: action.payload.timerMiliUnixtime,
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
    yield fork(handleFinishMemorizationPhase);
    yield fork(handleFinishRecallPhase);

    yield fork(handleGoToNextPair);
    yield fork(handleGoToPrevPair);
    yield fork(handleGoToNextDeck);
    yield fork(handleGoToDeckHead);

    yield fork(handleToggleTimer);
    yield fork(handleUpdateTimer);

    yield fork(handleKeyDown);
};
