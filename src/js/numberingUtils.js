const rp = require('request-promise');
const config = require('./config');

const getNumbering = (userName, part) => {
    const options = {
        url: `${config.apiRoot}/numbering/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(options)
        .then((result) => {
            // 文字の昇順にソートして返す
            return result.success.result.sort((a, b) => {
                if (a.letter < b.letter) return -1;
                if (a.letter === b.letter) return 0;
                if (a.letter > b.letter) return 1;
            });
        })
        .catch((err) => {
            alert(`ナンバリングの取得に失敗しました:${err}`);
            return [];
        });
};

exports.getNumbering = getNumbering;
