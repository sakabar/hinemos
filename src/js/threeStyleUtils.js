const rp = require('request-promise');
const config = require('./config');

export const getThreeStyles = (userName, part, buffer = undefined) => {
    let url = `${config.apiRoot}/threeStyle/${part.name}?userName=${userName}`;
    if (typeof buffer !== 'undefined') {
        url = `${config.apiRoot}/threeStyle/${part.name}?userName=${userName}&buffer=${buffer}`;
    }

    const options = {
        url,
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

export const getThreeStyleQuizList = (userName, part, buffer = undefined) => {
    let url = `${config.apiRoot}/threeStyleQuizList/${part.name}/${userName}`;
    if (buffer) {
        url = `${config.apiRoot}/threeStyleQuizList/${part.name}/${userName}?buffer=${buffer}`;
    }

    const options = {
        url,
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

export const getThreeStyleQuizLog = (userName, part, buffer = undefined) => {
    const url = buffer ? `${config.apiRoot}/threeStyleQuizLog/${part.name}/${userName}?&buffer=${buffer}` : `${config.apiRoot}/threeStyleQuizLog/${part.name}/${userName}`;

    const options = {
        url,
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
