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

exports.requestGetThreeStyleQuizProblemList = requestGetThreeStyleQuizProblemList;
exports.isSelectedRow = isSelectedRow;
