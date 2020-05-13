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
    // select,
} from 'redux-saga/effects';
// import {
//     delay,
// } from 'redux-saga';
const constant = require('../constant');

const INPUT_LETTERS = 'INPUT_LETTERS';
export const inputLetters = createAction(INPUT_LETTERS);

const SET_MATCH_TYPE = 'SET_MATCH_TYPE';
export const setMatchType = createAction(SET_MATCH_TYPE);

const SAGA_SEARCH_ALGORITHMS = 'SAGA_SEARCH_ALGORITHMS';
export const sagaSearchAlgorithms = createAction(SAGA_SEARCH_ALGORITHMS);
const SEARCH_ALGORITHMS = 'SEARCH_ALGORITHMS';
const searchAlgorithms = createAction(SEARCH_ALGORITHMS);

const SELECT_PROBLEM_LIST = 'SELECT_PROBLEM_LIST';
export const selectProblemList = createAction(SELECT_PROBLEM_LIST);

const ADD_TO_PROBLEM_LIST = 'ADD_TO_PROBLEM_LIST';
export const addToProblemList = createAction(ADD_TO_PROBLEM_LIST);

const DELETE_FROM_PROBLEM_LIST = 'DELETE_FROM_PROBLEM_LIST';
export const deleteFromProblemList = createAction(DELETE_FROM_PROBLEM_LIST);

const CHANGE_SELECT_ALL = 'CHANGE_SELECT_ALL';
export const changeSelectAll = createAction(CHANGE_SELECT_ALL);

// const SELECT_ALG = 'SELECT_ALG';
// export const selectAlg = createAction(SELECT_ALG);

const requestThreeStyle = () => {
    const ans = [
        {
            ind: 1, // 暫定的。このカラム必要な作りになっているが、本当に必要??
            'id': 184,
            'userName': 'tsakakib',
            'numberOfMoves': 4,
            'buffer': 'FU',
            'sticker1': 'RD',
            'sticker2': 'RU',
            'stickers': 'FU RD RU',
            // 'setup': '',
            // 'move1': 'R',
            // 'move2': 'R\'',
            move: '[R, R\']',
            'createdAt': '2019-03-16T14:05:35.000Z',
            'updatedAt': '2019-03-16T14:05:35.000Z',
        },
        {
            ind: 2, // 暫定的。このカラム必要な作りになっているが、本当に必要??
            'id': 2444,
            'userName': 'tsakakib',
            'numberOfMoves': 8,
            'buffer': 'DF',
            'sticker1': 'RF',
            'sticker2': 'RU',
            'stickers': 'DF RF RU',
            'setup': '',
            'move1': 'R',
            'move2': 'U M\' U\'',
            move: '[R, U M\' U\']',
            'createdAt': '2020-03-07T04:45:12.000Z',
            'updatedAt': '2020-03-07T04:45:12.000Z',
        },
    ];
    return Promise.resolve(ans);
};

function * handleSearchAlgorithms () {
    while (true) {
        yield take(sagaSearchAlgorithms);
        const algorithms = yield call(requestThreeStyle);

        const payload = {
            algorithms,
        };

        yield put(searchAlgorithms(payload));
    }
};

const initialState = {
    // FIXME これはどうやって入力しようか?
    part: constant.partType.edgeMiddle,
    userName: localStorage.userName,
    letters: '',
    isForwardMatch: true,
    isCheckedSelectAll: false,
    algorithms: [],
};

export const threeStyleProblemListDetailReducer = handleActions(
    {
        // [inputLetters]: (state, action) => {
        //     return {
        //         ...state,
        //         letters: action.payload.letters,
        //     };
        // },
        // [changeRadioMatch]: (state, action) => {
        //     return {
        //         ...state,
        //         radioMatch: action.payload.radioMatch,
        //     };
        // },
        // [changeSelectAll]: (state, action) => {
        //     return {
        //         ...state,
        //     };
        // },
        [searchAlgorithms]: (state, action) => {
            return {
                ...state,
                algorithms: action.payload.algorithms,
            };
        },

    },
    initialState
);

// export const threeStyleProblemListDetailReducer = (state = initialState, action) => {

//     case CHANGE_SELECT_ALL:

//     case SELECT_ALG:
//         return {
//             ...state,
//             algorithms: state.algorithms.map((alg) => (alg.ind === action.payload.ind) ? { ...alg, isChecked: action.payload.isChecked, } : alg),
//         };
//     default:
//         return state;
//     }
// };

export function * rootSaga () {
    yield fork(handleSearchAlgorithms);
};
