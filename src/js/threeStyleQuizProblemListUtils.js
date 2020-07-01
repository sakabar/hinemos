const config = require('./config');
const rp = require('request-promise');

const requestGetThreeStyleQuizProblemList = (part) => {
    if (!part) {
        return Promise.reject(new Error('part error'));
    }

    const options = {
        url: `${config.apiRoot}/getThreeStyleQuizProblemListName/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            token: localStorage.token,
        },
    };

    return rp(options);
};

// https://github.com/Grace951/react-table/blob/01f1e03da75dd11c73c77f0082950fedc2135bd8/src/SortableTbl.js#L41-L49
// react-tableでソート済みのデータだけを取得する方法がないので、フィルタ関数をそのままコピペして用意し、
// Stateの中で同じフィルタを適用してから値を変更する
const isSelectedRow = (searchWord, item) => {
    for (let key in item) {
        const v = item[key] && item[key].toString().toLowerCase();
        if (v && v.indexOf(searchWord.toLowerCase()) !== -1) {
            return true;
        }
    }
    return false;
};

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

const requestGetThreeStyleQuizProblemListDetail = (part, problemListId) => {
    const url = `${config.apiRoot}/getThreeStyleQuizProblemListDetail/${part.name}`;

    // problemListIdがnullの時はそれをAPIに渡さないことで、全手順を出力
    const form = {
        token: localStorage.token,
    };
    if (problemListId) {
        form.problemListId = `${problemListId}`;
    }

    const options = {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form,
    };

    return rp(options)
        .then((result) => {
            return {
                buffer: result.success.buffer,
                result: result.success.result,
            };
        })
        .catch((err) => {
            alert(`3-style問題リストの取得に失敗しました: ${err}`);
            return [];
        });
};

const requestPostThreeStyleQuizProblemListDetail = (part, problemListId, stickersStr) => {
    const url = `${config.apiRoot}/postThreeStyleQuizProblemListDetail/${part.name}`;

    const options = {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            token: localStorage.token,
            problemListId,
            stickersStr,
        },
    };

    return rp(options)
        .then(() => {
            alert('保存しました');
        })
        .catch((err) => {
            alert(`3-style問題リストの登録に失敗しました: ${err}`);
            return [];
        });
};

exports.requestGetThreeStyleQuizProblemList = requestGetThreeStyleQuizProblemList;

exports.isSelectedRow = isSelectedRow;

exports.requestPostProblemListName = requestPostProblemListName;
exports.requestGetThreeStyleQuizProblemListDetail = requestGetThreeStyleQuizProblemListDetail;
exports.requestPostThreeStyleQuizProblemListDetail = requestPostThreeStyleQuizProblemListDetail;
