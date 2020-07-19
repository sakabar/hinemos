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
// const moment = require('moment');
// const rp = require('request-promise');
// const config = require('../config');
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

// const SAGA_SAVE_NUMBERING = 'SAGA_SAVE_NUMBERING';
// export const sagaSaveNumbering = createAction(SAGA_SAVE_NUMBERING);
// const SAVE_NUMBERING = 'SAVE_NUMBERING';
// const saveNumbering = createAction(SAVE_NUMBERING);

function * handleLoadNumbering () {
    while (true) {
        // const action = yield take(sagaLoadNumbering);
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
                    disabled: true,
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

        const payload = {
            numbering: stateNumbering,
        };

        yield put(loadNumbering(payload));
    }
}

const initialState = {
    loadWillSkipped: false,
    userName: localStorage.userName,

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

            return {
                ...state,
                numbering,
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

            return {
                ...state,
                numbering,
            };
        },
    },
    initialState
);

export function * rootSaga () {
    yield fork(handleLoadNumbering);
};
