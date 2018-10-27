const INPUT_LETTERS = 'INPUT_LETTERS';
const CHANGE_RADIO_ORDER = 'CHANGE_RADIO_ORDER';
const CHANGE_RADIO_MATCH = 'CHANGE_RADIO_MATCH';
const CHANGE_SELECT_ALL = 'CHANGE_SELECT_ALL';
const SEARCH_ALGORITHMS = 'SEARCH_ALGORITHMS';
const SELECT_ALG = 'SELECT_ALG';

export const inputLetters = (letters) => ({
    type: INPUT_LETTERS,
    payload: {
        letters,
    },
});

export const changeRadioOrder = (radioOrder) => ({
    type: CHANGE_RADIO_ORDER,
    payload: {
        radioOrder,
    },
});

export const changeRadioMatch = (radioMatch) => ({
    type: CHANGE_RADIO_MATCH,
    payload: {
        radioMatch,
    },
});

export const changeSelectAll = (checkSelectAll) => ({
    type: CHANGE_SELECT_ALL,
    payload: {
        checkSelectAll,
    },
});

export const searchAlgorithms = (letters) => ({
    type: SEARCH_ALGORITHMS,
    payload: {
        letters,
    },
});

export const selectAlg = (ind, isCheckedNew) => ({
    type: SELECT_ALG,
    payload: {
        ind,
        isChecked: isCheckedNew,
    },
});

const initialState = {
    part: 'エッジ(仮)',
    letters: '',
    radioMatch: '前方一致',
    radioOrder: 'ひらがな順',
    checkSelectAll: false,
    algorithms: [],
};

export const threeStyleListReducer = (state = initialState, action) => {
    switch (action.type) {
    case INPUT_LETTERS:
        return {
            ...state,
            letters: action.payload.letters,
        };
    case CHANGE_RADIO_ORDER:
        return {
            ...state,
            radioOrder: action.payload.radioOrder,
        };
    case CHANGE_RADIO_MATCH:
        return {
            ...state,
            radioMatch: action.payload.radioMatch,
        };
    case CHANGE_SELECT_ALL:
        return {
            ...state,
            algorithms: state.algorithms.map((alg) => ({ ...alg, isChecked: action.payload.checkSelectAll, })),
            checkSelectAll: action.payload.checkSelectAll,
        };
    case SEARCH_ALGORITHMS:
        // action.payload.letters
        return {
            ...state,
            algorithms: [
                {
                    ind: 1,
                    isChecked: false,
                    letters: 'あい',
                    stickers: 'DF RF RU',
                    moves: '[D U M]',
                    acc: '3/3',
                    sec: 12.3,
                },
            ],
        };
    case SELECT_ALG:
        return {
            ...state,
            algorithms: state.algorithms.map((alg) => (alg.ind === action.payload.ind) ? { ...alg, isChecked: action.payload.isChecked, } : alg),
        };
    default:
        return state;
    }
};
