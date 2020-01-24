import {
    createAction,
    handleActions,
} from 'redux-actions';
import {
    call,
    fork,
    join,
    put,
    take,
    select,
} from 'redux-saga/effects';
import {
    delay,
} from 'redux-saga';
const memoTrainingUtils = require('../memoTrainingUtils');
const moment = require('moment');
const _ = require('lodash');

// Settingモード
const SET_DECK_NUM = 'SET_DECK_NUM';
const SET_DECK_SIZE = 'SET_DECK_SIZE';
const SET_PAIR_SIZE = 'SET_PAIR_SIZE';
const SET_IS_LEFTY = 'SET_IS_LEFTY';

export const setDeckNum = createAction(SET_DECK_NUM);
export const setDeckSize = createAction(SET_DECK_SIZE);
export const setPairSize = createAction(SET_PAIR_SIZE);
export const setIsLefty = createAction(SET_IS_LEFTY);

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

const FINISH_RECALL_PHASE = 'FINISH_RECALL_PHASE';
const finishRecallPhase = createAction(FINISH_RECALL_PHASE);

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
const updateMbldSolution = createAction(UPDATE_MBLD_SOLUTION);

const SAGA_UPDATE_MBLD_SOLUTION = 'SAGA_UPDATE_MBLD_SOLUTION';
export const sagaUpdateMbldSolution = createAction(SAGA_UPDATE_MBLD_SOLUTION);

const SAGA_ON_KEY_DOWN = 'SAGA_ON_KEY_DOWN';
export const sagaOnKeyDown = createAction(SAGA_ON_KEY_DOWN);

// 今のところコンポーネントからはdispatchしないなので、exportしないでおく
const PUSH_MEMO_LOGS = 'PUSH_MEMO_LOGS';
const pushMemoLogs = createAction(PUSH_MEMO_LOGS);

// 今のところコンポーネントからはdispatchしないなので、exportしないでおく
// const PUSH_RECALL_LOG = 'PUSH_RECALL_LOG';
// const pushRecallLog = createAction(PUSH_RECALL_LOG);

// 最初に動かして色々ロードする
// const INIT_LOAD = 'INIT_LOAD';
// const SAGA_INIT_LOAD = 'SAGA_INIT_LOAD';
// const initLoad = createAction(INIT_LOAD);
// export const sagaInitLoad = createAction(SAGA_INIT_LOAD);

const SELECT_HOLE = 'SELECT_HOLE';
export const selectHole = createAction(SELECT_HOLE);

const GO_TO_PREV_DECK_RECALL = 'GO_TO_PREV_DECK_RECALL';
export const goToPrevDeckRecall = createAction(GO_TO_PREV_DECK_RECALL);

const GO_TO_NEXT_DECK_RECALL = 'GO_TO_NEXT_DECK_RECALL';
export const goToNextDeckRecall = createAction(GO_TO_NEXT_DECK_RECALL);

const SAGA_SELECT_HAND = 'SAGA_SELECT_HAND';
export const sagaSelectHand = createAction(SAGA_SELECT_HAND);

const SELECT_HAND = 'SELECT_HAND';
const selectHand = createAction(SELECT_HAND);

const initialState = {
    userName: localStorage.userName, // ユーザ名
    startMemoMiliUnixtime: 0, // 記憶を開始したミリUnixtime
    startRecallMiliUnixtime: 0, // 記憶を開始したミリUnixtime
    timerMiliUnixtime: 0,
    timeVisible: false,
    isLefty: true,

    trialId: 0,
    trialDeckIds: [],

    deckElementIdPairsList: [ [], ],
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
    posInd: 0,

    handDict: {}, // Cardsで手元に残っているカードを表す辞書。deckInd => tag => bool
    // 手札のスート順。将来はこれを自由に設定できるようにする予定 FIXME
    handSuits: [
        memoTrainingUtils.Suit.heart,
        memoTrainingUtils.Suit.spade,
        memoTrainingUtils.Suit.diamond,
        memoTrainingUtils.Suit.club,
    ],

    // elementType => elementTag => elementId の辞書
    elementIdsDict: {},

    memoLogs: [], // 記憶時間が終わったらpostする。indパラメータはpostする直前に付与

    lastMemoMiliUnixtimePairsList: [ [], ], // そのelementを最後に覚えたミリunixtimestamp
    lastRecallMiliUnixtimePairsList: [ [], ], // そのelementを最後に思い出したミリunixtimestamp
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
        const elementIdsDict = yield call(memoTrainingUtils.loadElementIdsDict);
        if (Object.keys(elementIdsDict).length === 0) {
            throw new Error('load failed : elementIdsDict');
        }

        const elementIdsList = elementsList.map(elements => {
            return elements.map(element => {
                return elementIdsDict[element.type][element.tag];
            });
        });

        // elementListをPOSTする
        // deckElementとdeckのテーブルにレコードが追加される
        // 返ってくるのはdeckIdのリストとdeckElementId
        const resPostDeck = yield call(memoTrainingUtils.postDeck, elementIdsList);
        if (!resPostDeck.success) {
            throw new Error('deck post failed');
        }

        const deckIds = resPostDeck.success.result.deckIds;
        const deckElementIdsDict = resPostDeck.success.result.deckElementIdsDict;
        const deckElementIdsList = deckIds.map(deckId => {
            return deckElementIdsDict[deckId];
        });
        const deckElementIdPairsList = deckElementIdsList
            .map(deckElementIds => _.chunk(deckElementIds, pairSize));

        // trialをPOSTする
        const mode = action.payload.mode;
        const resPostTrial = yield call(memoTrainingUtils.postTrial, userName, memoEvent, mode, deckIds);
        const trialId = resPostTrial.success.result.trialId;
        const trialDeckIds = resPostTrial.success.result.trialDeckIds;

        const payload = {
            ...action.payload,
            trialId,
            trialDeckIds,
            deckElementIdPairsList,
            currentMiliUnixtime,
            deckSize,
            pairSize,
            decks,
            elementIdsDict,
        };

        // <main>にフォーカスすることで、ショートカットキーをすぐに使えるようにする
        document.querySelector('.memoTraining__main').focus();

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
    const deckElementIdPairsList = yield select(state => state.deckElementIdPairsList);
    const deckElementIdPair = deckElementIdPairsList[deckInd][pairInd];

    // DBに登録する秒数の和が実際の消費時間になるようにするために平均する
    const avgSec = 1.0 * sec / deckElementIdPair.length;

    const trialDeckIds = yield select(state => state.trialDeckIds);
    const trialDeckId = trialDeckIds[deckInd];
    const userName = yield select(state => state.userName);

    const memoLogs = deckElementIdPair.map((deckElementId, posInd) => {
        return {
            trialDeckId,
            userName,
            // ind: 後でつけ足す
            deckInd,
            pairInd,
            posInd,
            deckElementId,
            memoSec: avgSec,
        };
    });

    yield put(pushMemoLogs({ memoLogs, }));
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

        // join()を使うことで、最後のmemoLogがstateにpushされるのを
        // 待ってからAPIへPOSTすることができる
        const task = yield fork(handleSwitchPair, currentMiliUnixtime);
        yield join(task);

        // 記憶時間をpost
        const memoLogs = yield select(state => state.memoLogs);
        const resPostMemoLogs = yield call(memoTrainingUtils.postMemoLogs, memoLogs);
        if (!resPostMemoLogs.success) {
            throw new Error('memo logs post failed');
        }

        // 変換練習の場合はここでScoreをPOSTする
        const mode = yield select(state => state.mode);
        if (mode === memoTrainingUtils.TrainingMode.transformation) {
            // 変換練習なのでrecallLogsは空
            const recallLogs = [];
            const postScoreTask = yield fork(handlePostScore, currentMiliUnixtime, recallLogs);
            // wait
            yield join(postScoreTask);
        }

        yield put(finishMemorizationPhase({ currentMiliUnixtime, }));
    }
}

function * handlePostScore (currentMiliUnixtime, recallLogs) {
    const trialId = yield select(state => state.trialId);
    const deckNum = yield select(state => state.deckNum);
    const decks = yield select(state => state.decks);
    const elementIdsDict = yield select(state => state.elementIdsDict);

    const allElementNum = _.sum(decks.map(deck => {
        return _.sum(deck.map(pair => pair.length));
    }));

    const startMemoMiliUnixtime = yield select(state => state.startMemoMiliUnixtime);
    const startRecallMiliUnixtime = yield select(state => state.startRecallMiliUnixtime);

    const mode = yield select(state => state.mode);

    let totalMemoSec = null;
    let totalRecallSec = null;
    if (mode === memoTrainingUtils.TrainingMode.transformation) {
        totalMemoSec = (currentMiliUnixtime - startMemoMiliUnixtime) / 1000.0;
        // totalRecallSecはnullのまま
    } else if (mode === memoTrainingUtils.TrainingMode.memorization) {
        totalMemoSec = (startRecallMiliUnixtime - startMemoMiliUnixtime) / 1000.0;
        totalRecallSec = (currentMiliUnixtime - startRecallMiliUnixtime) / 1000.0;
    } else {
        throw new Error(`Unexpected mode: ${mode}`);
    }

    const memoLogs = yield select(state => state.memoLogs);
    const triedDeckNum = new Set(memoLogs.map(log => log.trialDeckId)).size;
    const triedElementNum = new Set(memoLogs.map(log => log.deckElementId)).size;

    const successDeckNum = (() => {
        if (mode === memoTrainingUtils.TrainingMode.transformation) {
            return null;
        }

        let ans = 0;
        for (let deckInd = 0; deckInd < deckNum; deckInd++) {
            const failureLogs = recallLogs.filter(log => {
                const element = decks[log.deckInd][log.pairInd][log.posInd];
                return log.deckInd === deckInd && elementIdsDict[element.type][element.tag] !== log.solutionElementId;
            });

            if (failureLogs.length === 0) {
                ans += 1;
            }
        }
        return ans;
    })();

    const successElementNum = (() => {
        if (mode === memoTrainingUtils.TrainingMode.transformation) {
            return null;
        }

        return recallLogs.filter(log => {
            const element = decks[log.deckInd][log.pairInd][log.posInd];
            return elementIdsDict[element.type][element.tag] === log.solutionElementId;
        }).length;
    })();

    const arg = {
        trialId,
        totalMemoSec,
        totalRecallSec,

        successDeckNum,
        triedDeckNum,
        allDeckNum: deckNum,

        successElementNum,
        triedElementNum,
        allElementNum,
    };

    const resPostMemoScore = yield call(memoTrainingUtils.postMemoScore, arg);
    if (!resPostMemoScore.success) {
        throw new Error('Error postMemoScore()');
    }
};

function * handleFinishRecallPhase () {
    while (true) {
        yield take(sagaFinishRecallPhase);

        const currentMiliUnixtime = parseInt(moment().format('x'));
        const startRecallMiliUnixtime = yield select(state => state.startRecallMiliUnixtime);
        const threshold = 2000;
        // 誤打防止のため、回答モードに入ってしばらくの間は無効化
        if (currentMiliUnixtime - startRecallMiliUnixtime < threshold) {
            continue;
        }

        const decks = yield select(state => state.decks);
        const solution = yield select(state => state.solution);

        const trialDeckIds = yield select(state => state.trialDeckIds);
        const userName = yield select(state => state.userName);
        const deckElementIdPairsList = yield select(state => state.deckElementIdPairsList);
        const elementIdsDict = yield select(state => state.elementIdsDict);
        const lastMemoMiliUnixtimePairsList = yield select(state => state.lastMemoMiliUnixtimePairsList);
        const lastRecallMiliUnixtimePairsList = yield select(state => state.lastRecallMiliUnixtimePairsList);

        // nullじゃない値の中で最も大きい(新しい)値
        // 全てnullの場合はundefinedとなるので、nullに変える
        const tmpMax = _.max(_.flattenDeep(lastRecallMiliUnixtimePairsList));
        const newestRecallMiliUnixtime = tmpMax || null;

        const recallLogs = [];

        for (let deckInd = 0; deckInd < decks.length; deckInd++) {
            const deck = decks[deckInd];
            const trialDeckId = trialDeckIds[deckInd];

            for (let pairInd = 0; pairInd < deck.length; pairInd++) {
                const pair = deck[pairInd];
                const deckElementIdPair = deckElementIdPairsList[deckInd][pairInd];

                for (let posInd = 0; posInd < pair.length; posInd++) {
                    const deckElementId = deckElementIdPair[posInd];

                    let solutionElement = null;
                    if (solution[deckInd]) {
                        if (solution[deckInd][pairInd]) {
                            if (solution[deckInd][pairInd][posInd]) {
                                solutionElement = solution[deckInd][pairInd][posInd];
                            }
                        }
                    }

                    const solutionElementId = solutionElement ? elementIdsDict[solutionElement.type][solutionElement.tag] : null;

                    let lastMemoMiliUnixtime = null;
                    if (lastMemoMiliUnixtimePairsList[deckInd]) {
                        if (lastMemoMiliUnixtimePairsList[deckInd][pairInd]) {
                            if (lastMemoMiliUnixtimePairsList[deckInd][pairInd][posInd]) {
                                lastMemoMiliUnixtime = lastMemoMiliUnixtimePairsList[deckInd][pairInd][posInd];
                            }
                        }
                    }

                    let lastRecallMiliUnixtime = null;
                    if (lastRecallMiliUnixtimePairsList[deckInd]) {
                        if (lastRecallMiliUnixtimePairsList[deckInd][pairInd]) {
                            if (lastRecallMiliUnixtimePairsList[deckInd][pairInd][posInd]) {
                                lastRecallMiliUnixtime = lastRecallMiliUnixtimePairsList[deckInd][pairInd][posInd];
                            }
                        }
                    }

                    // 回答null - 記憶null = null
                    // 回答 - 記憶null = null
                    // 回答null - 記憶 = 回答タイミングは全体で最も新しい回答タイミングとして計算
                    // 回答 - 記憶 = (そのまま計算)
                    const losingMemorySec = (() => {
                        if (lastMemoMiliUnixtime === null) {
                            return null;
                        }

                        if (lastRecallMiliUnixtime !== null) {
                            return (lastRecallMiliUnixtime - lastMemoMiliUnixtime) / 1000.0;
                        }

                        if (newestRecallMiliUnixtime === null) {
                            return null;
                        } else {
                            return (newestRecallMiliUnixtime - lastMemoMiliUnixtime) / 1000.0;
                        }
                    })();

                    const log = {
                        trialDeckId,
                        userName,
                        deckInd,
                        pairInd,
                        posInd,
                        deckElementId,
                        solutionElementId,
                        losingMemorySec,
                    };

                    recallLogs.push(log);
                }
            }
        }

        const resPostRecallLogs = yield call(memoTrainingUtils.postRecallLogs, recallLogs);
        if (!resPostRecallLogs.success) {
            throw new Error('recall logs post failed');
        }

        // 記憶練習のはずなので、ここでScoreをPOSTする
        const postScoreTask = yield fork(handlePostScore, currentMiliUnixtime, recallLogs);
        // wait
        yield join(postScoreTask);

        yield put(finishRecallPhase({ currentMiliUnixtime, }));
    }
};

function * handleToggleTimer () {
    while (true) {
        yield take(sagaToggleTimer);
        const timeVisible = yield select(state => state.timeVisible);
        const newTimeVisible = !timeVisible;

        yield fork(handleUpdateTimer);
        yield put(toggleTimer({ newTimeVisible, }));

        const sec = 3;
        for (let i = 0; i < sec; i++) {
            yield call(delay, 1000);
            yield fork(handleUpdateTimer);
        }
        yield put(toggleTimer({ newTimeVisible: !newTimeVisible, }));
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

function * handleUpdateMbldSolution () {
    while (true) {
        const action = yield take(sagaUpdateMbldSolution);

        const currentMiliUnixtime = parseInt(moment().format('x'));

        const payload = {
            ...action.payload,
            currentMiliUnixtime,
        };

        yield put(updateMbldSolution(payload));
    }
}

function * handleSelectHand () {
    while (true) {
        const action = yield take(sagaSelectHand);

        const currentMiliUnixtime = parseInt(moment().format('x'));

        const payload = {
            ...action.payload,
            currentMiliUnixtime,
        };

        yield put(selectHand(payload));
    }
}

// function * handleInitLoad () {
//     while (true) {
//         yield take(sagaInitLoad);
//         console.dir('LOADEDDDDDD');
//         const elementIdsDict = call(memoTrainingUtils.loadElementIdsDict);

//         const payload = {
//             elementIdsDict,
//         };

//         yield put(initLoad(payload));
//     }
// };

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
        [setIsLefty]: (state, action) => {
            return {
                ...state,
                isLefty: action.payload.isLefty,
            };
        },
        [startMemorizationPhase]: (state, action) => {
            if (typeof state.mode === 'undefined') {
                return {
                    ...state,
                    trialId: action.payload.trialId,
                    trialDeckIds: action.payload.trialDeckIds,
                    deckElementIdPairsList: action.payload.deckElementIdPairsList,
                    switchedPairMiliUnixtime: action.payload.currentMiliUnixtime,

                    memoEvent: action.payload.memoEvent,
                    deckSize: action.payload.deckSize,
                    decks: action.payload.decks,
                    startMemoMiliUnixtime: action.payload.currentMiliUnixtime,
                    mode: action.payload.mode,
                    phase: memoTrainingUtils.TrainingPhase.memorization,
                    elementIdsDict: action.payload.elementIdsDict,
                };
            }

            // Modeが既に決定しているのにまたModeを決定するのは意図していないので、何もしない
            return {
                ...state,
            };
        },
        [finishMemorizationPhase]: (state, action) => {
            // 変換練習だったら、記憶時間の終了 = 練習の終了なので初期状態に戻す
            // 記録ページができたらそっちに飛んだほうがいいかも? FIXME

            const currentMiliUnixtime = action.payload.currentMiliUnixtime;
            const decks = state.decks;
            const deckInd = state.deckInd;
            const pairInd = state.pairInd;

            const newLastMemoMiliUnixtimePairsList = _.cloneDeep(state.lastMemoMiliUnixtimePairsList);
            if (!newLastMemoMiliUnixtimePairsList[deckInd]) {
                newLastMemoMiliUnixtimePairsList[deckInd] = [];
            }

            if (!newLastMemoMiliUnixtimePairsList[deckInd][pairInd]) {
                newLastMemoMiliUnixtimePairsList[deckInd][pairInd] = [];
            }

            // ここはdecksでforを回すので注意
            for (let posInd = 0; posInd < decks[deckInd][pairInd].length; posInd++) {
                newLastMemoMiliUnixtimePairsList[deckInd][pairInd][posInd] = currentMiliUnixtime;
            }

            if (state.mode === memoTrainingUtils.TrainingMode.transformation) {
                return {
                    ...initialState,
                    // 一部の設定は引き継ぐ
                    deckNum: state.deckNum,
                    deckSize: state.deckSize,
                    pairSize: state.pairSize,
                    isLefty: state.isLefty,
                };
            } else if (state.mode === memoTrainingUtils.TrainingMode.memorization) {
                return {
                    ...state,
                    phase: memoTrainingUtils.TrainingPhase.recall,
                    startRecallMiliUnixtime: currentMiliUnixtime,
                    timeVisible: false,
                    handDict: memoTrainingUtils.cardsDefaultHand(state.deckNum),
                    deckInd: 0,
                    pairInd: 0,
                    lastMemoMiliUnixtimePairsList: newLastMemoMiliUnixtimePairsList,
                };
            } else {
                throw new Error(`unexpected mode : ${state.mode}`);
            }
        },
        [finishRecallPhase]: (state, action) => {
            // 記録ページができたらそっちに飛んだほうがいいかも? FIXME
            return {
                ...initialState,
                // 一部の設定は引き継ぐ
                deckNum: state.deckNum,
                deckSize: state.deckSize,
                pairSize: state.pairSize,
                isLefty: state.isLefty,
            };
        },
        [goToNextPair]: (state, action) => {
            const switchedPairMiliUnixtime = action.payload.currentMiliUnixtime;
            const newLastMemoMiliUnixtimePairsList = _.cloneDeep(state.lastMemoMiliUnixtimePairsList);
            const decks = state.decks;
            const deckInd = state.deckInd;
            const pairInd = state.pairInd;

            if (!newLastMemoMiliUnixtimePairsList[deckInd]) {
                newLastMemoMiliUnixtimePairsList[deckInd] = [];
            }

            if (!newLastMemoMiliUnixtimePairsList[deckInd][pairInd]) {
                newLastMemoMiliUnixtimePairsList[deckInd][pairInd] = [];
            }

            // ここはdecksでforを回すので注意
            for (let posInd = 0; posInd < decks[deckInd][pairInd].length; posInd++) {
                newLastMemoMiliUnixtimePairsList[deckInd][pairInd][posInd] = switchedPairMiliUnixtime;
            }

            if (pairInd === state.decks[deckInd].length - 1) {
                // 右端
                if (deckInd === state.decks.length - 1) {
                    // ペアもデッキも右端なので何もしない
                    // saga-*のイベントは起こるので、タイムは更新しておく
                    return {
                        ...state,
                        switchedPairMiliUnixtime,
                        lastMemoMiliUnixtimePairsList: newLastMemoMiliUnixtimePairsList,
                    };
                } else {
                    // 次のデッキに進む
                    return {
                        ...state,
                        switchedPairMiliUnixtime,
                        lastMemoMiliUnixtimePairsList: newLastMemoMiliUnixtimePairsList,
                        deckInd: deckInd + 1,
                        pairInd: 0,
                    };
                }
            } else {
                // 右端じゃないので1つ進むだけ
                return {
                    ...state,
                    switchedPairMiliUnixtime,
                    lastMemoMiliUnixtimePairsList: newLastMemoMiliUnixtimePairsList,
                    pairInd: pairInd + 1,
                };
            }
        },
        [goToPrevPair]: (state, action) => {
            const switchedPairMiliUnixtime = action.payload.currentMiliUnixtime;
            const newLastMemoMiliUnixtimePairsList = _.cloneDeep(state.lastMemoMiliUnixtimePairsList);
            const decks = state.decks;
            const deckInd = state.deckInd;
            const pairInd = state.pairInd;

            if (!newLastMemoMiliUnixtimePairsList[deckInd]) {
                newLastMemoMiliUnixtimePairsList[deckInd] = [];
            }

            if (!newLastMemoMiliUnixtimePairsList[deckInd][pairInd]) {
                newLastMemoMiliUnixtimePairsList[deckInd][pairInd] = [];
            }

            // ここはdecksでforを回すので注意
            for (let posInd = 0; posInd < decks[deckInd][pairInd].length; posInd++) {
                newLastMemoMiliUnixtimePairsList[deckInd][pairInd][posInd] = switchedPairMiliUnixtime;
            }

            if (pairInd === 0) {
                // 左端
                if (deckInd === 0) {
                    // ペアもデッキも左端なので何もしない
                    // saga-*のイベントは起こるので、タイムは更新しておく
                    return {
                        ...state,
                        switchedPairMiliUnixtime,
                        lastMemoMiliUnixtimePairsList: newLastMemoMiliUnixtimePairsList,
                    };
                } else {
                    // 前のデッキに戻る
                    const newDeckInd = deckInd - 1;
                    return {
                        ...state,
                        switchedPairMiliUnixtime,
                        lastMemoMiliUnixtimePairsList: newLastMemoMiliUnixtimePairsList,
                        deckInd: newDeckInd,
                        pairInd: state.decks[newDeckInd].length - 1,
                    };
                }
            } else {
                // 左端じゃないので1つ戻るだけ
                return {
                    ...state,
                    switchedPairMiliUnixtime,
                    lastMemoMiliUnixtimePairsList: newLastMemoMiliUnixtimePairsList,
                    pairInd: pairInd - 1,
                };
            }
        },
        [goToDeckHead]: (state, action) => {
            const switchedPairMiliUnixtime = action.payload.currentMiliUnixtime;
            const newLastMemoMiliUnixtimePairsList = _.cloneDeep(state.lastMemoMiliUnixtimePairsList);
            const decks = state.decks;
            const deckInd = state.deckInd;
            const pairInd = state.pairInd;

            if (!newLastMemoMiliUnixtimePairsList[deckInd]) {
                newLastMemoMiliUnixtimePairsList[deckInd] = [];
            }

            if (!newLastMemoMiliUnixtimePairsList[deckInd][pairInd]) {
                newLastMemoMiliUnixtimePairsList[deckInd][pairInd] = [];
            }

            // ここはdecksでforを回すので注意
            for (let posInd = 0; posInd < decks[deckInd][pairInd].length; posInd++) {
                newLastMemoMiliUnixtimePairsList[deckInd][pairInd][posInd] = switchedPairMiliUnixtime;
            }

            // もし先頭のペアを見ている時は、前のデッキに戻る
            return {
                ...state,
                switchedPairMiliUnixtime,
                lastMemoMiliUnixtimePairsList: newLastMemoMiliUnixtimePairsList,
                deckInd: pairInd === 0 && deckInd > 0 ? deckInd - 1 : deckInd,
                pairInd: 0,

            };
        },
        [goToNextDeck]: (state, action) => {
            const switchedPairMiliUnixtime = action.payload.currentMiliUnixtime;
            const newLastMemoMiliUnixtimePairsList = _.cloneDeep(state.lastMemoMiliUnixtimePairsList);
            const decks = state.decks;
            const deckInd = state.deckInd;
            const pairInd = state.pairInd;

            if (!newLastMemoMiliUnixtimePairsList[deckInd]) {
                newLastMemoMiliUnixtimePairsList[deckInd] = [];
            }

            if (!newLastMemoMiliUnixtimePairsList[deckInd][pairInd]) {
                newLastMemoMiliUnixtimePairsList[deckInd][pairInd] = [];
            }

            // ここはdecksでforを回すので注意
            for (let posInd = 0; posInd < decks[deckInd][pairInd].length; posInd++) {
                newLastMemoMiliUnixtimePairsList[deckInd][pairInd][posInd] = switchedPairMiliUnixtime;
            }

            if (deckInd === state.decks.length - 1) {
                // デッキが右端なので何もしない
                // saga-*のイベントは起こるので、タイムは更新しておく
                return {
                    ...state,
                    switchedPairMiliUnixtime,
                    lastMemoMiliUnixtimePairsList: newLastMemoMiliUnixtimePairsList,
                };
            } else {
                // 次のデッキに進む
                return {
                    ...state,
                    switchedPairMiliUnixtime,
                    lastMemoMiliUnixtimePairsList: newLastMemoMiliUnixtimePairsList,
                    deckInd: deckInd + 1,
                    pairInd: 0,
                };
            }
        },
        [updateMbldSolution]: (state, action) => {
            const decks = state.decks;

            const currentMiliUnixtime = action.payload.currentMiliUnixtime;
            const deckInd = action.payload.deckInd;
            const pairInd = action.payload.pairInd;

            // 設定したpairSizeと実際に生成されたpairのsizeが異なる場合がある
            const actualPairSize = decks[deckInd][pairInd].length;

            // tagPair = [ "あい", "う", ]
            // MBLDなのでchunkする幅は2文字ずつで固定としている
            const tmpTagPair = _.chunk(action.payload.pairStr, 2).map(chars => chars.join(''));

            // 出題されたpairより多く入力された場合は切り捨てる
            const tagPair = _.take(tmpTagPair, actualPairSize);
            const elementPair = tagPair.map(letters => new memoTrainingUtils.MbldElement(letters));

            const newSolution = _.cloneDeep(state.solution);
            if (typeof newSolution[deckInd] === 'undefined') {
                newSolution[deckInd] = [];
            }
            newSolution[deckInd][pairInd] = elementPair;

            const newLastRecallMiliUnixtimePairsList = _.cloneDeep(state.lastRecallMiliUnixtimePairsList);

            // 初めて回答したならlastRecallMiliUnixtimeをを更新
            if (!newLastRecallMiliUnixtimePairsList[deckInd] ||
                !newLastRecallMiliUnixtimePairsList[deckInd][pairInd] ||
                newLastRecallMiliUnixtimePairsList[deckInd][pairInd].length === 0) {
                if (!newLastRecallMiliUnixtimePairsList[deckInd]) {
                    newLastRecallMiliUnixtimePairsList[deckInd] = [];
                }

                if (!newLastRecallMiliUnixtimePairsList[deckInd][pairInd]) {
                    newLastRecallMiliUnixtimePairsList[deckInd][pairInd] = [];
                }

                for (let posInd = 0; posInd < actualPairSize; posInd++) {
                    newLastRecallMiliUnixtimePairsList[deckInd][pairInd][posInd] = currentMiliUnixtime;
                }
            } else {
                // 入れた答えが合っている場合はlastRecallMiliUnixtimePairsListを更新
                for (let posInd = 0; posInd < tagPair.length; posInd++) {
                    const elementTag = tagPair[posInd];
                    if (elementTag === decks[deckInd][pairInd][posInd].tag) {
                        newLastRecallMiliUnixtimePairsList[deckInd][pairInd][posInd] = currentMiliUnixtime;
                    }
                }
            }

            return {
                ...state,
                solution: newSolution,
                lastRecallMiliUnixtimePairsList: newLastRecallMiliUnixtimePairsList,
            };
        },
        [toggleTimer]: (state, action) => {
            const newTimeVisible = (typeof action.payload.newTimeVisible !== 'undefined') ? action.payload.newTimeVisible : !state.timeVisible;

            return {
                ...state,
                timeVisible: newTimeVisible,
            };
        },
        [updateTimer]: (state, action) => {
            return {
                ...state,
                timerMiliUnixtime: action.payload.timerMiliUnixtime,
            };
        },
        [pushMemoLogs]: (state, action) => {
            return {
                ...state,
                memoLogs: state.memoLogs.concat(action.payload.memoLogs),
            };
        },
        // [initLoad]: (state, action) => {
        //     return {
        //         ...state,
        //         elementIdsDict: action.payload.elementIdsDict,
        //     };
        // },
        [selectHole]: (state, action) => {
            const holeDeckInd = action.payload.holeDeckInd;
            const holePairInd = action.payload.holePairInd;
            const holePosInd = action.payload.holePosInd;

            const newSolution = _.cloneDeep(state.solution);
            const newHandDict = _.cloneDeep(state.handDict);
            // 既に穴にelementが入っている場合は外す
            if (newSolution[holeDeckInd] && newSolution[holeDeckInd][holePairInd] && newSolution[holeDeckInd][holePairInd][holePosInd]) {
                const element = newSolution[holeDeckInd][holePairInd][holePosInd];
                const tag = element.tag;
                newHandDict[holeDeckInd][tag] = true;
                newSolution[holeDeckInd][holePairInd][holePosInd] = null;
            }

            return {
                ...state,
                deckInd: holeDeckInd,
                pairInd: holePairInd,
                posInd: holePosInd,
                solution: newSolution,
                handDict: newHandDict,
            };
        },
        [goToPrevDeckRecall]: (state, action) => {
            const deckInd = state.deckInd;
            return {
                ...state,
                deckInd: deckInd === 0 ? 0 : deckInd - 1,
            };
        },
        [goToNextDeckRecall]: (state, action) => {
            const deckInd = state.deckInd;
            return {
                ...state,
                deckInd: deckInd === state.decks.length - 1 ? state.deckInd : state.deckInd + 1,
            };
        },
        [selectHand]: (state, action) => {
            const currentMiliUnixtime = action.payload.currentMiliUnixtime;
            const element = action.payload.element;
            const decks = state.decks;
            const deckInd = state.deckInd;
            const pairInd = state.pairInd;
            const posInd = state.posInd;

            const newSolution = _.cloneDeep(state.solution);
            const newHandDict = _.cloneDeep(state.handDict);

            // 選択している回答欄が空いていたらそこに埋める

            if (!newSolution[deckInd]) {
                newSolution[deckInd] = [];
            }
            if (!newSolution[deckInd][pairInd]) {
                newSolution[deckInd][pairInd] = [];
            }

            if (!newSolution[deckInd][pairInd][posInd]) {
                newSolution[deckInd][pairInd][posInd] = element;
                newHandDict[deckInd][element.tag] = false;
            }

            // 初めて回答したならlastRecallMiliUnixtimeをを更新
            const newLastRecallMiliUnixtimePairsList = _.cloneDeep(state.lastRecallMiliUnixtimePairsList);
            if (!newLastRecallMiliUnixtimePairsList[deckInd] ||
                !newLastRecallMiliUnixtimePairsList[deckInd][pairInd] ||
                newLastRecallMiliUnixtimePairsList[deckInd][pairInd].length === 0) {
                if (!newLastRecallMiliUnixtimePairsList[deckInd]) {
                    newLastRecallMiliUnixtimePairsList[deckInd] = [];
                }

                if (!newLastRecallMiliUnixtimePairsList[deckInd][pairInd]) {
                    newLastRecallMiliUnixtimePairsList[deckInd][pairInd] = [];
                }

                newLastRecallMiliUnixtimePairsList[deckInd][pairInd][posInd] = currentMiliUnixtime;
            } else {
                // 入れた答えが合っている場合はlastRecallMiliUnixtimePairsListを更新
                if (_.isEqual(decks[deckInd][pairInd][posInd], element)) {
                    newLastRecallMiliUnixtimePairsList[deckInd][pairInd][posInd] = currentMiliUnixtime;
                }
            }

            // カーソルを進める
            const nextCoordinate = memoTrainingUtils.getHoleNextCoordinate(decks, deckInd, pairInd, posInd, newSolution);
            const nextDeckInd = nextCoordinate.deckInd;
            const nextPairInd = nextCoordinate.pairInd;
            const nextPosInd = nextCoordinate.posInd;

            return {
                ...state,
                deckInd: nextDeckInd,
                pairInd: nextPairInd,
                posInd: nextPosInd,
                solution: newSolution,
                handDict: newHandDict,
                lastRecallMiliUnixtimePairsList: newLastRecallMiliUnixtimePairsList,
            };
        },
    },
    initialState
);

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

    yield fork(handleUpdateMbldSolution);
    yield fork(handleSelectHand);

    // yield fork(handleInitLoad);
};
