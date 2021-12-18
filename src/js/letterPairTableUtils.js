const rp = require('request-promise');
const config = require('./config');

export const saveLetterPairTable = (letterPairTable) => {
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

// ナンバリングから、ありうる2文字のセットを返す
// レターペア一括登録や、MBLDの記憶練習の「出現していないイメージ」の列挙に使う
export const getLettersSet = (cornerNumberings, edgeNumberings) => {
    // ありうるひらがな2文字
    const lettersSet = new Set();

    // MBLDなどで、CO/EO処理せずに2文字として処理するかもしれないので、
    // 同じパーツのステッカーを特別視せず、全て列挙する
    for (let i = 0; i < cornerNumberings.length; i++) {
        const numbering1 = cornerNumberings[i];

        for (let k = 0; k < cornerNumberings.length; k++) {
            const numbering2 = cornerNumberings[k];

            // 同じステッカーの場合はスキップ
            if (numbering1.letter === numbering2.letter) {
                continue;
            }

            const letters = `${numbering1.letter}${numbering2.letter}`;
            lettersSet.add(letters);
        }
    }

    // MBLDなどで、CO/EO処理せずに2文字として処理するかもしれないので、
    // 同じパーツのステッカーを特別視せず、全て列挙する
    for (let i = 0; i < edgeNumberings.length; i++) {
        const numbering1 = edgeNumberings[i];

        for (let k = 0; k < edgeNumberings.length; k++) {
            const numbering2 = edgeNumberings[k];

            // 同じステッカーの場合はスキップ
            if (numbering1.letter === numbering2.letter) {
                continue;
            }

            const letters = `${numbering1.letter}${numbering2.letter}`;
            lettersSet.add(letters);
        }
    }

    return lettersSet;
};
