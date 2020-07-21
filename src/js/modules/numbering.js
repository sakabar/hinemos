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
const _ = require('lodash');
const rp = require('request-promise');
const config = require('../config');
const constant = require('../constant');
const numberingUtils = require('../numberingUtils');
const utils = require('../utils');

const UPDATE_NUMBERING = 'UPDATE_NUMBERING';
export const updateNumbering = createAction(UPDATE_NUMBERING);

const SAGA_LOAD_NUMBERING = 'SAGA_LOAD_NUMBERING';
export const sagaLoadNumbering = createAction(SAGA_LOAD_NUMBERING);
const LOAD_NUMBERING = 'LOAD_NUMBERING';
const loadNumbering = createAction(LOAD_NUMBERING);

const SET_LOAD_WILL_SKIPPED = 'SET_LOAD_WILL_SKIPPED';
export const setLoadWillSkipped = createAction(SET_LOAD_WILL_SKIPPED);

const SAGA_SAVE_NUMBERING = 'SAGA_SAVE_NUMBERING';
export const sagaSaveNumbering = createAction(SAGA_SAVE_NUMBERING);
// const SAVE_NUMBERING = 'SAVE_NUMBERING';
// const saveNumbering = createAction(SAVE_NUMBERING);

const WingEdgeSystem = {
    UFr: 'UFr',
    FUr: 'FUr',
    unknown: 'unknown',
};

function * handleLoadNumbering () {
    while (true) {
        yield take(sagaLoadNumbering);

        const userName = yield select(state => state.userName);

        const stateNumbering = _.cloneDeep(initialState.numbering);

        const partTypes = Object.values(constant.partType);
        for (let i = 0; i < partTypes.length; i++) {
            const partType = partTypes[i];
            const numberings = yield call(numberingUtils.getNumbering, userName, partType);

            numberings.map(numbering => {
                const sticker = numbering.sticker;
                const letter = numbering.letter;
                stateNumbering[partType.name][sticker] = {
                    letter,
                    disabled: false,
                };
            });

            // エッジとコーナーで、バッファと同じパーツには入力させない
            if (partType === constant.partType.edgeMiddle) {
                const bufferSticker = numberings.filter(numbering => numbering.letter === '@')[0].sticker;

                const stickerInBufferPiece = `${bufferSticker[1]}${bufferSticker[0]}`;
                stateNumbering[partType.name][stickerInBufferPiece] = {
                    letter: '',
                    disabled: true,
                };
            } else if (partType === constant.partType.corner) {
                const bufferSticker = numberings.filter(numbering => numbering.letter === '@')[0].sticker;

                const stickerInBufferPieceList = [
                    utils.sortSticker(`${bufferSticker[1]}${bufferSticker[0]}${bufferSticker[2]}`),
                    utils.sortSticker(`${bufferSticker[2]}${bufferSticker[0]}${bufferSticker[1]}`),
                ];

                stickerInBufferPieceList.map(stickerInBufferPiece => {
                    stateNumbering[partType.name][stickerInBufferPiece] = {
                        letter: '',
                        disabled: true,
                    };
                });
            }
        }

        let wingEdgeSystem = WingEdgeSystem.unknown;
        const edgeWingStickers = Object.keys(stateNumbering[constant.partType.edgeWing.name]);
        if (edgeWingStickers.every(s => constant.edgesFUr.includes(s))) {
            wingEdgeSystem = WingEdgeSystem.FUr;
        } else if (edgeWingStickers.every(s => constant.edgesUFr.includes(s))) {
            wingEdgeSystem = WingEdgeSystem.UFr;
        } else {
            throw new Error(`Unexpected WingEdge: ${edgeWingStickers}`);
        }
        const payload = {
            numbering: stateNumbering,
            wingEdgeSystem,
        };

        yield put(loadNumbering(payload));
    }
}

const postNumberings = (token, part, numberings) => {
    const numberingOptions = {
        url: `${config.apiRoot}/numbering/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            numberings,
            token,
        },
    };

    return rp(numberingOptions);
};

function * handleSaveNumbering () {
    while (true) {
        yield take(sagaSaveNumbering);

        const stateNumbering = yield select(state => state.numbering);
        const token = yield select(state => state.token);

        // 3BLDのナンバリングは別ページで登録するので、
        // ここでは登録しない
        const partTypes = [
            constant.partType.edgeWing,
            constant.partType.centerX,
            constant.partType.centerT,
        ];

        const STICKER_SIZE_DICT = {};
        STICKER_SIZE_DICT[constant.partType.edgeWing.name] = 24;
        STICKER_SIZE_DICT[constant.partType.centerX.name] = 24;
        STICKER_SIZE_DICT[constant.partType.centerT.name] = 24;

        for (let i = 0; i < partTypes.length; i++) {
            const partType = partTypes[i];

            const stickers = Object.keys(stateNumbering[partType.name]);

            const numberings = [];
            stickers.map(sticker => {
                const letter = stateNumbering[partType.name][sticker].letter;

                if (letter !== '') {
                    const instance = {
                        sticker,
                        letter,
                    };
                    numberings.push(instance);
                }
            });

            const isEnoughSize = numberings.length === STICKER_SIZE_DICT[partType.name];
            if (!isEnoughSize) {
                alert(`ERROR: ${partType.japanese}のナンバリングが${STICKER_SIZE_DICT[partType.name]}文字ではありません。\n${partType.japanese}の保存をスキップしました`);
                continue;
            }

            const countDict = _.countBy(numberings, (numbering) => numbering.letter);
            const letters = Object.keys(countDict);
            let isOK = true;
            for (let i = 0; i < letters.length; i++) {
                const letter = letters[i];
                const cnt = countDict[letter];

                if (cnt > 1) {
                    alert(`ERROR: ${partType.japanese}内に「${letter}」が複数存在します。\n${partType.japanese}の保存をスキップしました`);
                    isOK = false;
                    break;
                }
            }
            if (!isOK) {
                continue;
            }

            const bufferStickers = numberings.filter(rec => rec.letter === '@');
            if (bufferStickers.length !== 1) {
                alert(`ERROR: ${partType.japanese}内でバッファ「@」が指定されていません。\n${partType.japanese}の保存をスキップしました`);
                continue;
            }

            // ここまででバリデーションは済んでいる (引っかかった場合はここに到達しない) 想定
            try {
                yield call(postNumberings, token, partType, numberings);
                alert(`${partType.japanese}のナンバリングを保存しました`);
            } catch {
                alert(`ERROR: ${partType.japanese}のナンバリングの保存に失敗しました`);
            }
        }
    }
}

const initialState = {
    loadWillSkipped: false,
    userName: localStorage.userName,
    token: localStorage.token,

    // part => sticker => { letters, disabled, }
    numbering: (() => {
        const obj = {};
        obj[constant.partType.corner.name] = {};
        obj[constant.partType.edgeMiddle.name] = {};
        obj[constant.partType.edgeWing.name] = {};
        obj[constant.partType.centerX.name] = {};
        obj[constant.partType.centerT.name] = {};

        obj[constant.dummyPartType.name] = {};
        const frontArr = [ 'U', 'L', 'F', 'R', 'B', 'D', ];
        frontArr.map(face => {
            obj[constant.dummyPartType.name][face] = {
                letter: face,
                disabled: true,
            };
        });

        return obj;
    })(),

    // UFr系 or FUr系
    wingEdgeSystem: WingEdgeSystem.unknown,
};

export const numberingReducer = handleActions(
    {
        [updateNumbering]: (state, action) => {
            const partName = action.payload.partName;
            const sticker = action.payload.sticker;
            const letter = action.payload.letter;

            const numbering = _.cloneDeep(state.numbering);
            if (sticker in numbering[partName]) {
                numbering[partName][sticker].letter = letter;
            } else {
                numbering[partName][sticker] = {
                    letter,
                    disabled: false,
                };
            }

            // WingEdgeで、系が異なるステッカーをdisableにする
            let wingEdgeSystem = state.wingEdgeSystem;
            if (partName === constant.partType.edgeWing.name && wingEdgeSystem === WingEdgeSystem.unknown) {
                if (constant.edgesFUr.includes(sticker)) {
                    wingEdgeSystem = WingEdgeSystem.FUr;

                    constant.edgesUFr.map(wingEdge => {
                        numbering[partName][wingEdge] = {
                            letter: '',
                            disabled: true,
                        };
                    });
                } else if (constant.edgesUFr.includes(sticker)) {
                    wingEdgeSystem = WingEdgeSystem.UFr;

                    constant.edgesFUr.map(wingEdge => {
                        numbering[partName][wingEdge] = {
                            letter: '',
                            disabled: true,
                        };
                    });
                } else {
                    throw new Error(`Unexpected WingEdge: ${sticker}`);
                }
            }

            // WingEdgeで、何も入力されていない状態の時はdisableを解除する
            if (partName === constant.partType.edgeWing.name && letter === '' && wingEdgeSystem !== WingEdgeSystem.unknown) {
                if (wingEdgeSystem === WingEdgeSystem.FUr) {
                    const allEmpty = constant.edgesFUr.map(wingEdge => numbering[partName][wingEdge] || { letter: '', }).every(w => w.letter === '');
                    if (allEmpty) {
                        wingEdgeSystem = WingEdgeSystem.unknown;

                        constant.edgesUFr.map(wingEdge => {
                            numbering[partName][wingEdge] = {
                                letter: '',
                                disabled: false,
                            };
                        });
                    }
                } else if (wingEdgeSystem === WingEdgeSystem.UFr) {
                    const allEmpty = constant.edgesUFr.map(wingEdge => numbering[partName][wingEdge] || { letter: '', }).every(w => w.letter === '');

                    if (allEmpty) {
                        wingEdgeSystem = WingEdgeSystem.unknown;

                        constant.edgesFUr.map(wingEdge => {
                            numbering[partName][wingEdge] = {
                                letter: '',
                                disabled: false,
                            };
                        });
                    }
                } else {
                    throw new Error(`Unexpected WingEdge: ${sticker}`);
                }
            }

            return {
                ...state,
                numbering,
                wingEdgeSystem,
            };
        },
        [setLoadWillSkipped]: (state, action) => {
            const loadWillSkipped = action.payload.loadWillSkipped || false;
            return {
                ...state,
                loadWillSkipped,
            };
        },
        [loadNumbering]: (state, action) => {
            // DBから取ってきたナンバリングで上書きする
            // 現状のStateに対する部分更新だと、どこまでがDBに登録されているのかがわかりにくくなる

            const numbering = action.payload.numbering;
            const wingEdgeSystem = action.payload.wingEdgeSystem;

            // WingEdgeで、系が異なるステッカーをdisableにする
            // TODO FIXME これ自体をアクションにしたほうがいいかも
            if (wingEdgeSystem === WingEdgeSystem.FUr) {
                constant.edgesUFr.map(wingEdge => {
                    numbering[constant.partType.edgeWing.name][wingEdge] = {
                        letter: '',
                        disabled: true,
                    };
                });
            } else if (wingEdgeSystem === WingEdgeSystem.UFr) {
                constant.edgesFUr.map(wingEdge => {
                    numbering[constant.partType.edgeWing.name][wingEdge] = {
                        letter: '',
                        disabled: true,
                    };
                });
            }

            return {
                ...state,
                numbering,
                wingEdgeSystem,
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleLoadNumbering);
    yield fork(handleSaveNumbering);
};
