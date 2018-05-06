const rp = require('request-promise');
const config = require('./config');

const saveLetterPairTable = (letterPairTable) => {
    const token = localStorage.token;

    const options = {
        url: `${config.apiRoot}/letterPairTable`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            letterPairTable,
            token,
        },
    };

    if (!letterPairTable || letterPairTable.length === 0) {
        return Promise.reject(new Error('何か単語を登録してください。'));
    }

    return rp(options);
};

exports.saveLetterPairTable = saveLetterPairTable;
