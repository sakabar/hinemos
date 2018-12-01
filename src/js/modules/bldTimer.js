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
import GiiKER from 'giiker';
const moment = require('moment');
const bldTimerUtils = require('../bldTimerUtils');

// const ENTER_KEYCODE = 13;
const SPACE_KEYCODE = 32;

const REQUEST_CONNECT_CUBE = 'REQUEST_CONNECT_CUBE';
const SUCCESS_CONNECT_CUBE = 'SUCCESS_CONNECT_CUBE';
const FAILURE_CONNECT_CUBE = 'FAILURE_CONNECT_CUBE';

// const MOVE_CUBE = 'MOVE_CUBE';
const UPDATE_MOVE_HISTORY = 'UPDATE_MOVE_HISTORY';

const ANALYZE_MOVE_HISTORY = 'ANALYZE_MOVE_HISTORY';

const STOP_TO_HOLDING = 'STOP_TO_HOLDING';
const HOLDING_TO_STOP = 'HOLDING_TO_STOP';
const HOLDING_TO_READY = 'HOLDING_TO_UPDATING';
const READY_TO_STOP = 'READY_TO_STOP';
const READY_TO_UPDATING = 'READY_TO_UPDATING';
const UPDATING_TO_STOP = 'UPDATING_TO_STOP';

const TRY_TO_READY = 'TRY_TO_READY';

const UPDATE_TIMER = 'UPDATE_TIMER';

const KEY_DOWN = 'KEY_DOWN';
const KEY_UP = 'KEY_UP';
const KEY_DOWN_ENTER = 'KEY_DOWN_ENTER';
const KEY_UP_ENTER = 'KEY_UP_ENTER';

const TOGGLE_MODAL = 'TOGGLE_MODAL';
const UPDATE_INPUT_SCRAMBLES_STR = 'UPDATE_INPUT_SCRAMBLES_STR';
const ADD_SCRAMBLES = 'ADD_SCRAMBLES';
const CHANGE_SCRAMBLE = 'CHANGE_SCRAMBLE';

export const requestConnectCube = createAction(REQUEST_CONNECT_CUBE);
export const successConnectCube = createAction(SUCCESS_CONNECT_CUBE);
export const failureConnectCube = createAction(FAILURE_CONNECT_CUBE);

// export const moveCube = createAction(MOVE_CUBE);

export const updateMoveHistory = createAction(UPDATE_MOVE_HISTORY);

export const analyzeMoveHistory = createAction(ANALYZE_MOVE_HISTORY);

export const stopToHolding = createAction(STOP_TO_HOLDING);
export const holdingToStop = createAction(HOLDING_TO_STOP);
export const holdingToReady = createAction(HOLDING_TO_READY);
export const readyToStop = createAction(READY_TO_STOP);
export const readyToUpdating = createAction(READY_TO_UPDATING);
export const updatingToStop = createAction(UPDATING_TO_STOP);

export const tryToReady = createAction(TRY_TO_READY);

export const updateTimer = createAction(UPDATE_TIMER);

export const keyDown = createAction(KEY_DOWN);
export const keyUp = createAction(KEY_UP);
export const keyDownEnter = createAction(KEY_DOWN_ENTER);
export const keyUpEnter = createAction(KEY_UP_ENTER);

export const toggleModal = createAction(TOGGLE_MODAL);
export const addScrambles = createAction(ADD_SCRAMBLES);
export const updateInputScramblesStr = createAction(UPDATE_INPUT_SCRAMBLES_STR);
export const changeScramble = createAction(CHANGE_SCRAMBLE);

// テキストボックスの値をJSの機能で変えた時にイベントを発火させるには、ひと手間必要
// https://github.com/facebook/react/issues/10135
function setNativeValue (element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }
}

const writeTextbox = (s) => {
    const textbox = document.querySelector('.moveSeqTextbox');
    setNativeValue(textbox, textbox.value + s);

    // onChange()を発火
    const event = new Event('input', { bubbles: true, });
    textbox.dispatchEvent(event);
};

function * handleRequestConnectCube () {
    while (true) {
        yield take(REQUEST_CONNECT_CUBE);
        const cubeConnection = yield select(state => state.cubeConnection);

        // 既に接続できていたら何もしない
        if (cubeConnection) {
            continue;
        }

        try {
            const cubeConnection = yield call(GiiKER.connect);
            cubeConnection.on('move', (move) => {
                writeTextbox(`${move.notation} ${parseInt(moment().format('x'))}` + '\n');
            });

            if (cubeConnection) {
                yield put(successConnectCube(cubeConnection));
            } else {
                yield put(failureConnectCube(new Error('cube connection failed')));
            }
        } catch (e) {
            yield put(failureConnectCube(new Error(`cube connection failed: ${e}`)));
        }
    }
}

// 押したキーの種類によって分岐
function * handleOnKeyDown () {
    while (true) {
        const keyDownAction = yield take(KEY_DOWN);

        const timerState = yield select(state => state.timerState);
        const mutableScramble = yield select(state => state.mutableScramble);
        const memorizeDoneMiliUnixtime = yield select(state => state.memorizeDoneMiliUnixtime);

        const miliUnixtime = parseInt(moment().format('x'));

        if (timerState === bldTimerUtils.TimerState.stop) {
            if (mutableScramble === '' && keyDownAction.payload.keyCode === SPACE_KEYCODE) {
                // スクランブルが完了した状態でスペースを押した時
                yield fork(emitDelayTryToReady);
                yield put(stopToHolding(miliUnixtime));
            }
        } else if (timerState === bldTimerUtils.TimerState.holding || timerState === bldTimerUtils.TimerState.ready) {
            // waitの時に、さらに別のキーを押されても何もしない
        } else if (timerState === bldTimerUtils.TimerState.updating) {
            // どのキーでもよい
            if (typeof memorizeDoneMiliUnixtime !== 'undefined') {
                // 分析記憶時間が登録済であれば、タイマー止める
                // 自動的に解析
                yield put(updatingToStop(miliUnixtime));
                yield put(analyzeMoveHistory());
            } else {
                // 何もしない
            }
        } else {
            throw new Error(`Unexpected timerState: ${timerState}`);
        }
    }
}

// 離したキーの種類によって分岐
function * handleOnKeyUp () {
    while (true) {
        const keyUpAction = yield take(KEY_UP);

        const timerState = yield select(state => state.timerState);
        const mutableScramble = yield select(state => state.mutableScramble);
        const miliUnixtime = parseInt(moment().format('x'));

        if (timerState === bldTimerUtils.TimerState.stop) {
            // 何もしない
        } else if (timerState === bldTimerUtils.TimerState.holding) {
            if (keyUpAction.payload.keyCode === SPACE_KEYCODE) {
                yield put(holdingToStop(miliUnixtime));
            }
        } else if (timerState === bldTimerUtils.TimerState.ready) {
            if (keyUpAction.payload.keyCode === SPACE_KEYCODE) {
                if (mutableScramble !== '') {
                    // スクランブルが完了していなかったらstopに戻す
                    yield put(readyToStop(miliUnixtime));
                } else {
                    yield put(readyToUpdating(miliUnixtime));
                    yield fork(handleUpdateTimer);
                }
            }
        } else if (timerState === bldTimerUtils.TimerState.updating) {
            // 何もしない
        }
    }
}

function * emitDelayTryToReady () {
    yield call(delay, bldTimerUtils.WAIT_THRESHOLD_MILISEC);
    const miliUnixtime = parseInt(moment().format('x'));
    yield put(tryToReady(miliUnixtime));
};

// STOPの状態でエンターを押し始めてから、時間が経った後にも条件が満たされていたらReadyに遷移
function * handleTryToReady () {
    while (true) {
        const tryToReadyAction = yield take(TRY_TO_READY);
        const nowMiliUnixtime = tryToReadyAction.payload;

        const timerState = yield select(state => state.timerState);
        const mutableScramble = yield select(state => state.mutableScramble);
        const lastModified = yield select(state => state.lastModified);

        if (mutableScramble === '' && timerState === bldTimerUtils.TimerState.holding && nowMiliUnixtime - lastModified >= bldTimerUtils.WAIT_THRESHOLD_MILISEC) {
            yield put(holdingToReady(nowMiliUnixtime));
        } else {
            // 何もしない
        }
    }
};

function * handleUpdateTimer () {
    const timerState = yield select(state => state.timerState);

    if (timerState === bldTimerUtils.TimerState.updating) {
        const delayMiliSec = 100;
        yield call(delay, delayMiliSec);

        const miliUnixtime = parseInt(moment().format('x'));
        yield put(updateTimer(miliUnixtime));
        yield fork(handleUpdateTimer);
    } else {
        // 何もしない
    }
}

const initialState = {
    // キューブとの接続
    cubeConnection: undefined,

    moveHistoryStr: '',
    sectionResults: [],

    scrambles: [],
    scramblesIndex: 0,
    compared: undefined,
    mutableScramble: '',
    // scrambles: dummyScrambles,
    // compared: bldTimerUtils.compareMovesAndScramble(exampleHistory2.split('\n').map(s => s.split(' ')[0]).filter(s => s !== '' && s !== '@'), dummyScrambles[0]),
    // mutableScramble: bldTimerUtils.modifyScramble(exampleHistory2.split('\n').map(s => s.split(' ')[0]).filter(s => s !== '' && s !== '@'), dummyScrambles[0]),

    inputScramblesStr: '',
    isOpen: false,

    timerCount: 0.0,
    timerState: bldTimerUtils.TimerState.stop,
    lastModified: 0,
    solveStartMiliUnixtime: undefined,
    memorizeDoneMiliUnixtime: undefined,
    solveDoneMiliUnixtime: undefined,
};

export const bldTimerReducer = handleActions(
    {
        [successConnectCube]: (state, action) => {
            const cubeConnection = action.payload;
            return ({
                ...state,
                cubeConnection,
            });
        },
        [updateMoveHistory]: (state, action) => {
            let memorizeDoneMiliUnixtime = state.memorizeDoneMiliUnixtime;
            let moveHistoryStr = action.payload.value;

            // ソルブのスタート後にキューブを動かした場合は分析記憶が完了したと見なす
            // 便宜的に、キューブを動かす100ミリ秒前に分析記憶が完了したとする
            if (state.solveStartMiliUnixtime && !state.memorizeDoneMiliUnixtime) {
                const miliUnixtime = action.payload.miliUnixtime;
                const CONST_DIFF = 100;

                const tmpLst = action.payload.value.split('\n');

                const prev = tmpLst.filter(line => line !== '' && line.split(' ')[0] !== '@' && parseInt(line.split(' ')[1]) < state.solveStartMiliUnixtime);
                const aft = tmpLst.filter(line => line !== '' && line.split(' ')[0] !== '@' && parseInt(line.split(' ')[1]) >= state.solveStartMiliUnixtime);

                memorizeDoneMiliUnixtime = miliUnixtime - CONST_DIFF;
                moveHistoryStr = prev.join('\n') + '\n' + `@ ${memorizeDoneMiliUnixtime}` + '\n' + aft.join('\n') + '\n';
            }

            const moves = moveHistoryStr.split('\n').map(s => s.split(' ')[0]).filter(s => s !== '' && s !== '@');
            const scramble = state.scrambles[state.scramblesIndex];
            const mutableScramble = (state.timerState === bldTimerUtils.TimerState.updating) ? '' : bldTimerUtils.modifyScramble(moves, scramble);

            return {
                ...state,
                moveHistoryStr,
                compared: bldTimerUtils.compareMovesAndScramble(moves, scramble),
                mutableScramble,
                memorizeDoneMiliUnixtime,
            };
        },
        [analyzeMoveHistory]: (state, action) => {
            const moveOpsSeq = bldTimerUtils.parseMoveHistoryStr(state.moveHistoryStr);
            const merged = bldTimerUtils.mergeSliceAuto(moveOpsSeq);
            const rotated = bldTimerUtils.mergeRotation(merged);
            const sectionResults = bldTimerUtils.splitMoveOpsSeq(rotated);

            return {
                ...state,
                sectionResults,
            };
        },
        [stopToHolding]: (state, action) => {
            return {
                ...state,
                timerState: bldTimerUtils.TimerState.holding,
                lastModified: action.payload,
            };
        },
        [holdingToStop]: (state, action) => {
            return {
                ...state,
                timerState: bldTimerUtils.TimerState.stop,
                lastModified: action.payload,
            };
        },
        [readyToStop]: (state, action) => {
            return {
                ...state,
                timerState: bldTimerUtils.TimerState.stop,
                lastModified: action.payload,
            };
        },
        [holdingToReady]: (state, action) => {
            return {
                ...state,
                timerState: bldTimerUtils.TimerState.ready,
                lastModified: action.payload,
            };
        },
        [readyToUpdating]: (state, action) => {
            const nowMiliUnixtime = action.payload;

            return {
                ...state,
                timerState: bldTimerUtils.TimerState.updating,
                lastModified: nowMiliUnixtime,
                solveStartMiliUnixtime: nowMiliUnixtime,
                memorizeDoneMiliUnixtime: undefined,
                solveDoneMiliUnixtime: undefined,
            };
        },
        [updatingToStop]: (state, action) => {
            const nowMiliUnixtime = action.payload;
            const newScramblesIndex = Math.max(0, Math.min(state.scramblesIndex + 1, state.scrambles.length - 1));
            const mutableScramble = state.scrambles[newScramblesIndex].join(' ');

            return {
                ...state,
                timerState: bldTimerUtils.TimerState.stop,
                lastModified: nowMiliUnixtime,
                solveDoneMiliUnixtime: nowMiliUnixtime,
                // 次のスクランブルへ。もし最後だったら入力欄を開く
                scramblesIndex: newScramblesIndex,
                mutableScramble,
                isOpen: (state.scramblesIndex === state.scrambles.length - 1) ? true : state.isOpen,
            };
        },
        [updateTimer]: (state, action) => {
            const nowMiliUnixtime = action.payload;

            const miliSec = (typeof state.solveDoneMiliUnixtime === 'undefined')
                ? nowMiliUnixtime - state.solveStartMiliUnixtime
                : state.solveDoneMiliUnixtime - state.solveStartMiliUnixtime;
            return {
                ...state,
                timerCount: miliSec / 1000.0,
            };
        },
        [toggleModal]: (state, action) => {
            return {
                ...state,
                isOpen: !state.isOpen,
            };
        },
        [updateInputScramblesStr]: (state, action) => {
            return {
                ...state,
                inputScramblesStr: action.payload,
            };
        },
        [addScrambles]: (state, action) => {
            const inputScramblesStr = state.inputScramblesStr;
            const newScrambles = inputScramblesStr.split('\n').filter(s => s !== '').map(s => s.split(' '));
            const scrambles = state.scrambles.concat(newScrambles);
            // 新しく追加したスクランブルの1番目に移動
            const scramblesIndex = scrambles.length - newScrambles.length;

            return {
                ...state,
                scrambles,
                scramblesIndex,
                compared: undefined,
                mutableScramble: scrambles[scramblesIndex].join(' '),
                inputScramblesStr: '',
            };
        },
        [changeScramble]: (state, action) => {
            const offset = action.payload;
            if (state.scrambles.length === 0) {
                return {
                    ...state,
                };
            }

            const scramblesIndex = Math.max(0, Math.min(state.scramblesIndex + offset, state.scrambles.length - 1));
            const mutableScramble = state.scrambles[scramblesIndex].join(' ');

            return {
                ...state,
                scramblesIndex,
                compared: undefined,
                mutableScramble,
            };
        },
        // [moveCube]: (state, action) => {
        //     const move = action.payload;
        //     console.log(move.face); // => "F"
        //     console.log(move.amount); // => -1
        //     console.log(move.notation); // => "F'"

        //     console.log(JSON.stringify(state.cube));

        //     return ({
        //         ...state,
        //     });
        // },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleRequestConnectCube);
    yield fork(handleOnKeyDown);
    yield fork(handleOnKeyUp);
    yield fork(handleTryToReady);
};
