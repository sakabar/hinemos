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
// import {
//     delay,
// } from 'redux-saga';
const _ = require('lodash');
const moment = require('moment');
const rp = require('request-promise');
const config = require('../config');
const constant = require('../constant');

const INPUT_TITLES = 'INPUT_TITLES';
export const inputTitles = createAction(INPUT_TITLES);

const CREATE_PROBLEM_LISTS = 'CREATE_PROBLEM_LISTS';
const createProblemLists = createAction(CREATE_PROBLEM_LISTS);
const SAGA_CREATE_PROBLEM_LISTS = 'SAGA_CREATE_PROBLEM_LISTS';
export const sagaCreateProblemLists = createAction(SAGA_CREATE_PROBLEM_LISTS);

const requestPostProblemListName = (part, buffer, titles) => {
    const options = {
        url: `${config.apiRoot}/threeStyleQuizProblemListName/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            buffer,
            titles,
            token: localStorage.token,
        },
    };

    return rp(options);
};

function * handleCreateProblemLists () {
    while (true) {
        yield take(sagaCreateProblemLists);

        const part = yield select(state => state.part);
        const buffer = yield select(state => state.buffer);
        const titles = yield select(state => state.titles);

        const ans = yield call(requestPostProblemListName, part, buffer, titles);

        const newProblemLists = ans.success.result.map(problemList => {
            return {
                ...problemList,
                createdAt: moment(problemList.createdAt, moment.ISO_8601),
                updatedAt: moment(problemList.updatedAt, moment.ISO_8601),
                numberOfAlgs: 0,
            };
        });

        yield put(createProblemLists({ newProblemLists, }));
    }
};

// function * handleLoadNumbering () {
//     // FIXME
// };

const initialState = (() => {
    const url = new URL(location.href);

    const partStr = url.searchParams.get('part');
    const part = constant.partType[partStr] || null;

    const problemLists = [
        {
            id: null,
            userName: localStorage.userName,
            buffer: 'DF', // FIXME
            title: 'sys_全手順',
            createdAt: moment('2018/01/01 00:00', 'YYYY/MM/DD HH:mm'),
            updatedAt: moment('2018/01/01 00:00', 'YYYY/MM/DD HH:mm'),
            numberOfAlgs: null,
        },
    ];

    return {
        userName: localStorage.userName,
        part,
        buffer: 'DF', // FIXME
        titles: '',

        // problemLists: [],
        problemLists,
    };
})();

export const threeStyleProblemListReducer = handleActions(
    {
        [inputTitles]: (state, action) => {
            const titles = action.payload.titles;
            return {
                ...state,
                titles,
            };
        },
        [createProblemLists]: (state, action) => {
            const newProblemLists = action.payload.newProblemLists;

            const problemLists = _.cloneDeep(state.problemLists).concat(newProblemLists);

            return {
                ...state,
                titles: '',
                problemLists,
            };
        },

    },
    initialState
);

export function * rootSaga () {
    yield fork(handleCreateProblemLists);
};
