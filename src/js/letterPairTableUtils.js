const rp = require('request-promise');
const config = require('./config');
const utils = require('./utils');

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
export const getLettersSet = (cornerNumberings, edgeNumberings, isRejectSameParts = false) => {
    const getLettersSetInOnePart = (numberings, isRejectSameParts) => {
        const locLettersSet = new Set();

        // MBLDなどで、CO/EO処理せずに2文字として処理するかもしれないので、
        // デフォルトでは同じパーツのステッカーを特別視せず、全て列挙する
        for (let i = 0; i < numberings.length; i++) {
            const numbering1 = numberings[i];

            for (let k = 0; k < numberings.length; k++) {
                const numbering2 = numberings[k];

                // 同じステッカーの場合はスキップ
                if (numbering1.letter === numbering2.letter) {
                    continue;
                }

                // オプションで指定された場合は、同じパーツのステッカーを除外
                if (isRejectSameParts) {
                    if (utils.isInSameParts(numbering1.sticker, numbering2.sticker)) {
                        continue;
                    }
                }

                const letters = `${numbering1.letter}${numbering2.letter}`;
                lettersSet.add(letters);
            }
        }

        return locLettersSet;
    };

    // ありうるひらがな2文字
    const lettersSet = new Set();

    const cornerLettersSet = getLettersSetInOnePart(cornerNumberings, isRejectSameParts);
    const edgeLettersSet = getLettersSetInOnePart(edgeNumberings, isRejectSameParts);

    for (let elm of cornerLettersSet) {
        lettersSet.add(elm);
    }

    for (let elm of edgeLettersSet) {
        lettersSet.add(elm);
    }

    return lettersSet;
};
