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
const threeStyleQuizListUtils = require('../threeStyleQuizListUtils');

const SET_LOAD_WILL_SKIPPED = 'SET_LOAD_WILL_SKIPPED';
export const setLoadWillSkipped = createAction(SET_LOAD_WILL_SKIPPED);

const INPUT_TITLES = 'INPUT_TITLES';
export const inputTitles = createAction(INPUT_TITLES);

const CREATE_PROBLEM_LISTS = 'CREATE_PROBLEM_LISTS';
const createProblemLists = createAction(CREATE_PROBLEM_LISTS);
const SAGA_CREATE_PROBLEM_LISTS = 'SAGA_CREATE_PROBLEM_LISTS';
export const sagaCreateProblemLists = createAction(SAGA_CREATE_PROBLEM_LISTS);

const LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST = 'LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST';
const loadThreeStyleQuizProblemList = createAction(LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST);
const SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST = 'SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST';
export const sagaLoadThreeStyleQuizProblemList = createAction(SAGA_LOAD_THREE_STYLE_QUIZ_PROBLEM_LIST);

const requestPostProblemListName = (part, titles) => {
    const options = {
        url: `${config.apiRoot}/postThreeStyleQuizProblemListName/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            titles,
            token: localStorage.token,
        },
    };

    return rp(options);
};

function * handleLoadThreeStyleQuizProblemList () {
    while (true) {
        const action = yield take(sagaLoadThreeStyleQuizProblemList);

        const url = action.payload.url;
        const partStr = url.searchParams.get('part');
        const part = constant.partType[partStr] || null;

        if (!part) {
            return;
        }

        const threeStyleQuizProblemList = yield call(threeStyleQuizListUtils.requestGetThreeStyleQuizProblemList, part);

        const payload = {
            url,
            part,
            problemLists: threeStyleQuizProblemList.success.result.map(problemList => {
                return {
                    ...problemList,
                    createdAt: moment(problemList.createdAt, moment.ISO_8601),
                    updatedAt: moment(problemList.updatedAt, moment.ISO_8601),
                };
            }),
        };

        yield put(loadThreeStyleQuizProblemList(payload));
    }
};

function * handleCreateProblemLists () {
    while (true) {
        yield take(sagaCreateProblemLists);

        const part = yield select(state => state.part);
        const titles = yield select(state => state.titles);

        if (titles.indexOf(' ') !== -1) {
            alert('問題リスト名にスペースが含まれています');
            continue;
        }

        const ans = yield call(requestPostProblemListName, part, titles);

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

const initialState = {
    url: null,
    loadWillSkipped: false,
    part: constant.dummyPartType,
    userName: localStorage.userName,
    titles: '',

    problemLists: [
        {
            problemListId: null,
            userName: localStorage.userName,
            title: 'system_全手順',
            createdAt: moment('2018/01/01 00:00', 'YYYY/MM/DD HH:mm'),
            updatedAt: moment('2018/01/01 00:00', 'YYYY/MM/DD HH:mm'),
            numberOfAlgs: null,
        },
    ],
};

export const threeStyleProblemListReducer = handleActions(
    {
        [setLoadWillSkipped]: (state, action) => {
            const loadWillSkipped = action.payload.loadWillSkipped || false;
            return {
                ...state,
                loadWillSkipped,
            };
        },
        [inputTitles]: (state, action) => {
            const titles = action.payload.titles;
            return {
                ...state,
                titles,
            };
        },
        [loadThreeStyleQuizProblemList]: (state, action) => {
            const url = action.payload.url;
            const part = action.payload.part;

            const newProblemLists = action.payload.problemLists;
            const problemLists = _.cloneDeep(initialState.problemLists).concat(newProblemLists);

            return {
                ...state,
                url,
                loadWillSkipped: true,
                part,
                problemLists,
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
    yield fork(handleLoadThreeStyleQuizProblemList);
};
