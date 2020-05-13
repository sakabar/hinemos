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
const moment = require('moment');
const constant = require('../constant');

const CREATE_PROBLEM_LISTS = 'CREATE_PROBLEM_LISTS';
const createProblemLists = createAction(CREATE_PROBLEM_LISTS);
const SAGA_CREATE_PROBLEM_LISTS = 'SAGA_CREATE_PROBLEM_LISTS';
export const sagaCreateProblemLists = createAction(SAGA_CREATE_PROBLEM_LISTS);

function * handleCreateProblemLists () {
    while (true) {
        yield take(sagaCreateProblemLists);

        const payload = {
        };

        yield put(createProblemLists());
    }
};

const initialState = (() => {
    const url = new URL(location.href);

    const partStr = url.searchParams.get('part');
    const part = constant.partType[partStr] || null;

    const problemList = [
        {
            id: 123,
            title: 'サ行苦手',
            createdAt: moment('2020/05/13 10:00', 'YYYY/MM/DD HH:mm'),
        }
    ]

    return {
        userName: localStorage.userName,
        part,
        // problemList: [],
        problemList,
    };
})();

export const threeStyleProblemListReducer = handleActions(
    {
        [createProblemLists]: (state, action) => {
            const createdProblemLists = action.payload.createdProblemLists;

            const newProblemList = _.cloneDeep(problemList).concat(createdProblemLists);

            return {
                ...state,
                problemList: newProblemList,
            };
        },

    },
    initialState
);

export function * rootSaga () {
    yield fork(handleCreateProblemList);
};
