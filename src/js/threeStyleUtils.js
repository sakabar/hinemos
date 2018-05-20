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

exports.getThreeStyles = getThreeStyles;
