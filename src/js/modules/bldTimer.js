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

// F D D L' D' R R U' U' L U' D D F B' B' U F F U' U' L' L' U' R2' U' U' F' F' D D L' F' F'
const exampleHistory2 = `
F 1542901299469
D 1542901301015
D 1542901301524
L' 1542901303239
D' 1542901304198
R 1542901306238
R 1542901306598
U' 1542901308697
U' 1542901308878
L 1542901311337
U' 1542901312476
D 1542901313795
D 1542901314335
F 1542901316075
B' 1542901318895
B' 1542901319074
U 1542901322134
F 1542901323034
F 1542901323993
U' 1542901324896
U' 1542901325013
L' 1542901327352
L' 1542901327475
U' 1542901329571
R2' 1542901331730
U' 1542901334010
U' 1542901334070
F' 1542901336649
F' 1542901337129
D 1542901339768
D 1542901340129
L' 1542901346786
F' 1542901349368
F' 1542901349605

@ 1542901356349

L' 1542901409889
U' 1542901410008
L 1542901410128
U 1542901410248
L 1542901410428
L 1542901410547
R2' 1542901410788
D' 1542901410848
L' 1542901411027
D 1542901411088
L 1542901411268
D' 1542901411988
D' 1542901412048
L 1542901412228
R' 1542901412234
B' 1542901412407
B' 1542901412468
R' 1542901412588
L 1542901412593
U 1542901413007
R 1542901413127
U' 1542901413247
L 1542901413427
L 1542901413486
R' 1542901413667
R' 1542901413787
D 1542901413847
R' 1542901413967
D' 1542901414087
F 1542901414447
L' 1542901414627
L' 1542901414687
F' 1542901414986
L 1542901415107
L 1542901415166
R' 1542901415346
R' 1542901415466
B 1542901415586
L' 1542901415827
L' 1542901415886
B' 1542901416186

U' 1542901416786
U' 1542901416906
L 1542901417026
R' 1542901417266
F' 1542901417326
F' 1542901417333
L 1542901417506
R' 1542901417512
R 1542901417985
D 1542901418046
R' 1542901418105
D' 1542901418225
L 1542901418405
L 1542901418466
R' 1542901418706
R' 1542901418766
U 1542901418886
R 1542901419065
U' 1542901419305
R' 1542901419485
R 1542901419905
B' 1542901420025
R' 1542901420205
B 1542901420385
L 1542901420805
R 1542901420865
L 1542901421105
R 1542901421110
F' 1542901421285
R 1542901421525
F 1542901421585
R' 1542901421704
D' 1542901422004
L 1542901422125
D 1542901422305
L 1542901422544
L 1542901422607
R' 1542901422785
R' 1542901422845
U' 1542901422964
L' 1542901423144
U 1542901423264
U 1542901423804
R 1542901423984
R 1542901424104
U' 1542901424224
L 1542901424403
L 1542901424464
R' 1542901424643
R' 1542901424763
D 1542901424824
R 1542901425003
R 1542901425184
D' 1542901425303
D' 1542901425604
L' 1542901425904
L' 1542901425963
D 1542901426084
L 1542901426323
R' 1542901427163
L 1542901427283
R' 1542901427343
U' 1542901427883
L' 1542901428183
L' 1542901428243
U 1542901428363

U' 1542901432802
L 1542901432981
R' 1542901433101
F' 1542901433161
L 1542901433401
R' 1542901433406
D' 1542901433582
L 1542901433761
R' 1542901433766
B' 1542901433941
L' 1542901434181
R 1542901434187

D' 1542901434481
R' 1542901434661
L 1542901434666
B' 1542901434841
L 1542901434961
R' 1542901434965
U' 1542901435080
L 1542901435260
R' 1542901435261
F' 1542901435380
L 1542901435562
R' 1542901435568
F' 1542901436281
R 1542901436380

F 1542901436580
L 1542901436941
R' 1542901437239
L 1542901437243
R' 1542901437320

B' 1542901437420
R' 1542901437600
B 1542901438019
U 1542901449237
D 1542901449296
R 1542901449716
U 1542901449956
D 1542901450316
R' 1542901450555
U' 1542901450676
R 1542901450798
D' 1542901450916
R' 1542901451156
U 1542901451276
R 1542901451397
U' 1542901451576
R' 1542901451755
D' 1542901452055
U' 1542901452060
D 1542901453075
D 1542901453675
R 1542901453855
D' 1542901454335
L' 1542901454818
L' 1542901454935
D 1542901455355
R' 1542901455475
D' 1542901455655
L 1542901455894
L 1542901455955
D' 1542901456494
R 1542901459194
R 1542901459254
U' 1542901459554
R' 1542901459733
U' 1542901459914
R 1542901460154
U 1542901460213
R' 1542901460334
F' 1542901460453
R 1542901460573
U 1542901460753
R' 1542901460873
U' 1542901460993
R' 1542901461353
F 1542901461473
`.slice(1);

// const exampleHistory = `
// D 1542529047860
// D 1542529048040
// F' 1542529049300
// U' 1542529050020
// U' 1542529050080
// F 1542529050920
// D 1542529052120
// D 1542529052300
// F 1542529053379
// R 1542529054280
// R 1542529054339
// U' 1542529057160
// U' 1542529057219
// F 1542529060340
// D 1542529061359
// D 1542529061659
// F 1542529062019
// F 1542529062319
// D 1542529062559
// D 1542529062799
// R' 1542529063639
// U 1542529064179
// F' 1542529065019
// L 1542529067900
// R 1542529068500
// R 1542529068559
// U' 1542529071019
// B' 1542529073119
// F 1542529075039
// U' 1542529075999
// B 1542529078579
// R' 1542529080919
// R' 1542529081039

// @ 1542529084112
// U' 1542529144639
// L 1542529144757
// R' 1542529144817
// F' 1542529144937
// R' 1542529145057
// L 1542529145063
// D' 1542529145237
// L 1542529145358
// R' 1542529145363
// B' 1542529145538
// L' 1542529145778
// R 1542529145782
// D' 1542529146317
// R' 1542529146438
// L 1542529146443
// B' 1542529146617
// R' 1542529146737
// L 1542529146742
// U' 1542529146917
// L 1542529147037

// R' 1542529147100

// F' 1542529147217
// L 1542529147397
// R' 1542529147402
// L' 1542529149318
// D' 1542529149437
// L 1542529149497
// D 1542529149677
// L 1542529149917
// L 1542529149977
// R' 1542529150097
// R' 1542529150217
// U' 1542529150397
// L' 1542529150577
// U 1542529150697
// L 1542529150937
// B 1542529151417
// L 1542529151717
// B' 1542529151957
// L 1542529152437
// R' 1542529152618
// L 1542529152738
// R' 1542529152742
// F 1542529153097
// L' 1542529153397
// F' 1542529153577
// L 1542529154957
// L 1542529155017
// R' 1542529155257
// R' 1542529155317
// D 1542529155557
// U 1542529155976
// R 1542529156217
// R 1542529156337
// U' 1542529156517
// L 1542529156757
// R' 1542529156997
// F 1542529157237

// R2 1542529157417

// F' 1542529157777

// L' 1542529158017
// R 1542529158197
// D' 1542529158497
// B' 1542529159457
// R' 1542529159817
// B 1542529159877
// L 1542529160297
// R' 1542529160304
// L 1542529160596
// R' 1542529160600
// F' 1542529160776
// R 1542529160957
// F 1542529161377
// D' 1542529161977
// D' 1542529162097
// L 1542529162277
// R' 1542529162281
// B' 1542529162577
// B' 1542529162639
// L 1542529162937
// R' 1542529162940
// R 1542529163536
// B' 1542529163716
// R' 1542529164016
// B 1542529164196
// L 1542529164617
// L 1542529164917
// R2' 1542529164923
// F' 1542529165156
// R 1542529165397
// F 1542529165577
// R' 1542529165637
// D' 1542529166116
// L 1542529166237
// D 1542529166417
// L 1542529166897
// R' 1542529166902
// L 1542529167197
// R' 1542529167202
// U' 1542529167557
// L' 1542529167796
// U 1542529167917
// R 1542529168517
// U 1542529168637
// R' 1542529168757
// U' 1542529169117
// L 1542529169417
// L 1542529169477
// R2' 1542529169837
// D 1542529169897
// R 1542529170196
// D' 1542529170202
// R' 1542529170376
// F 1542529170917
// L' 1542529171097
// L' 1542529171157
// F' 1542529171457
// L 1542529171756
// R' 1542529171762
// L 1542529171997
// R' 1542529172002
// B 1542529172357
// L' 1542529172656
// L' 1542529172717
// B' 1542529173016
// B' 1542529173197
// R 1542529173497
// R 1542529173617
// B 1542529174036
// L 1542529174456
// R' 1542529174462
// R' 1542529174696
// L 1542529174702
// F' 1542529174996
// R 1542529175236
// R 1542529175297
// F 1542529175656
// R 1542529176436
// F' 1542529176442
// R' 1542529176736
// F 1542529177456
// R' 1542529177876
// L 1542529177881
// R' 1542529178297
// L 1542529178356
// B' 1542529178656
// R 1542529178956
// B 1542529179076
// R' 1542529179197
// R 1542529180276
// U' 1542529180397
// R' 1542529180517
// U' 1542529180696
// R 1542529180877
// U 1542529180996
// R' 1542529181116
// F' 1542529181236
// R 1542529181357
// U 1542529181477
// R' 1542529181596
// U' 1542529181716
// R' 1542529182016
// F 1542529182076
// R 1542529182196
// D 1542529182616
// F' 1542529182917
// R 1542529183276
// U' 1542529183397
// R' 1542529183576
// U' 1542529183756
// R 1542529183936
// U 1542529184056
// R' 1542529184237
// F' 1542529184356
// R 1542529184476
// U 1542529184657
// R' 1542529184716
// U' 1542529184957
// R' 1542529185256
// F 1542529185316
// R 1542529185437
// F 1542529187056
// D' 1542529187656
// R' 1542529188497
// D' 1542529188796
// U' 1542529188802
// R' 1542529189036
// D 1542529189336

// R 1542529189700

// U' 1542529189757

// R' 1542529189936
// D' 1542529190116
// R 1542529190356
// D 1542529190536
// U 1542529190596
// U 1542529190896

// R 1542529191076
// R 1542529192816
// D 1542529193116
// D 1542529193416
// R' 1542529193656
// U 1542529193715
// R 1542529193836
// D' 1542529193956
// R' 1542529194316
// U' 1542529194436
// R 1542529194556
// D' 1542529194736
// R' 1542529195036

// R' 1542529195956
// U' 1542529195996
// R' 1542529196236
// U' 1542529196356
// R 1542529196596
// U 1542529196715
// R2' 1542529196776
// R 1542529196836
// F' 1542529196956
// R 1542529197136
// U 1542529197255
// R' 1542529197316
// U' 1542529197496
// R' 1542529197796
// F 1542529197917
// R' 1542529198036
// `.slice(1);

// eslint-disable-next-line quotes
// const dummyScrambles = [ "U R' D U' F2".split(' '), "F D2 L' D' R2 U2 L U' D2 F B2 U F2 U2 L2 U' R2' U2 F2 D2 L' F2".split(' '), ];

const initialState = {
    // キューブとの接続
    cubeConnection: undefined,

    // moveHistoryStr: '',
    // moveHistoryStr: exampleHistory,
    moveHistoryStr: exampleHistory2,

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
            const newScramblesIndex = Math.min(state.scramblesIndex + 1, state.scrambles.length - 1);
            const mutableScramble = state.scrambles[newScramblesIndex];

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
                mutableScramble: scrambles[scramblesIndex],
                inputScramblesStr: '',
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
