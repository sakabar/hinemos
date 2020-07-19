import {
    createAction,
    handleActions,
} from 'redux-actions';
// import {
//     call,
//     fork,
//     // join,
//     put,
//     take,
//     select,
// } from 'redux-saga/effects';
const _ = require('lodash');
// const moment = require('moment');
// const rp = require('request-promise');
// const config = require('../config');
const constant = require('../constant');

const UPDATE_NUMBERING = 'UPDATE_NUMBERING';
export const updateNumbering = createAction(UPDATE_NUMBERING);

// const SAGA_SAVE_NUMBERING = 'SAGA_SAVE_NUMBERING';
// export const sagaSaveNumbering = createAction(SAGA_SAVE_NUMBERING);
// const SAVE_NUMBERING = 'SAVE_NUMBERING';
// const saveNumbering = createAction(SAVE_NUMBERING);

// const LOAD_INITIALLY = 'LOAD_INITIALLY';
// const loadInitially = createAction(LOAD_INITIALLY);
// const SAGA_LOAD_INITIALLY = 'SAGA_LOAD_INITIALLY';
// export const sagaLoadInitially = createAction(SAGA_LOAD_INITIALLY);

const initialState = {
    loadWillSkipped: false,
    userName: localStorage.userName,

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
            obj[constant.dummyPartType.name][face] = face;
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
            numbering[partName][sticker] = letter;

            return {
                ...state,
                numbering,
            };
        },
    },
    initialState
);

export function * rootSaga () {

};
