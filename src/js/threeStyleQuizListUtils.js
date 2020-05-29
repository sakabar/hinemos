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

exports.requestGetThreeStyleQuizProblemList = requestGetThreeStyleQuizProblemList;
