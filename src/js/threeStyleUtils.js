const rp = require('request-promise');
const config = require('./config');

const getThreeStyles = (userName, part) => {
    const options = {
        url: `${config.apiRoot}/threeStyle/${part.name}?userName=${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(options)
        .then((result) => {
            return result.success.result;
        })
        .catch((err) => {
            alert(`3-styleの取得に失敗しました: ${err}`);
            return [];
        });
};

const getThreeStyleQuizList = (userName, part) => {
    const options = {
        url: `${config.apiRoot}/threeStyleQuizList/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(options)
        .then((result) => {
            return result.success.result;
        })
        .catch((err) => {
            alert(`3-style問題リストの取得に失敗しました: ${err}`);
            return [];
        });
};

const getThreeStyleQuizLog = (userName, part) => {
    const options = {
        url: `${config.apiRoot}/threeStyleQuizLog/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(options)
        .then((result) => {
            return result.success.result;
        })
        .catch((err) => {
            alert(`3-styleクイズの記録の取得に失敗しました: ${err}`);
            return [];
        });
};

exports.getThreeStyles = getThreeStyles;
exports.getThreeStyleQuizList = getThreeStyleQuizList;
exports.getThreeStyleQuizLog = getThreeStyleQuizLog;
