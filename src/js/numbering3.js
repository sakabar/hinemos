const rp = require('request-promise');
const config = require('./config');
const utils = require('./utils');

// バッファ 'UBL' -> ['BLU','LBU']
const getBlankStickers = (bufferSticker) => {
    if (!utils.corners.includes(bufferSticker) && !utils.edges.includes(bufferSticker)) {
        throw new Error('ERROR: arg length must be corner or edge sticker');
    }

    let ans = [];
    for (let i = 0; i < bufferSticker.length; i++) {
        const fst = bufferSticker[i];
        const others = bufferSticker.slice(0, i) + bufferSticker.slice(i + 1, bufferSticker.length);
        const tmp = fst + Array.from(others).sort().join('');

        // バッファと同じステッカーになったらスキップされる
        if (tmp !== bufferSticker) {
            ans.push(tmp);
        }
    }
    return ans;
};

// FIXME テスト書く
const checkBlankStickersAreOK = (blankStickers, cornerNumberings) => {
    for (let i = 0; i < blankStickers.length; i++) {
        const blankSticker = blankStickers[i];
        // 空欄のものはcornerNumberingsへの追加をスキップしている仕様
        if (cornerNumberings.filter(x => x.sticker === blankSticker).length !== 0) {
            return false;
        }
    }

    return true;
};

const loadCornerNumbering = () => {
    const userName = localStorage.userName;
    const numberingCornerOptions = {
        url: `${config.apiRoot}/numbering/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    rp(numberingCornerOptions)
        .then((ans) => {
            const cornerNumberings = ans.success.result;

            // 未登録の場合はわざとエラー扱いとし、UBLのみ'@'で埋める
            if (cornerNumberings.length === 0) {
                throw new Error('No numberings');
            }

            for (let i = 0; i < cornerNumberings.length; i++) {
                const sticker = cornerNumberings[i].sticker;
                const letter = cornerNumberings[i].letter;
                const pieceText = document.querySelector(`.corner__${sticker}`);

                if (pieceText) {
                    pieceText.value = letter;
                }
            }
        })
        .catch(() => {
            // エラーが発生した場合は、デフォルトでUBLのみ埋める
            const textUBL = document.querySelector('.corner__UBL');
            if (textUBL) {
                textUBL.value = '@';
            }
        });
};

const loadEdgeNumbering = () => {
    const userName = localStorage.userName;
    const numberingEdgeOptions = {
        url: `${config.apiRoot}/numbering/edgeMiddle/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    rp(numberingEdgeOptions)
        .then((ans) => {
            const edgeNumberings = ans.success.result;

            // 未登録の場合はわざとエラー扱いとし、DFのみ'@'で埋める
            if (edgeNumberings.length === 0) {
                throw new Error('No numberings');
            }

            for (let i = 0; i < edgeNumberings.length; i++) {
                const sticker = edgeNumberings[i].sticker;
                const letter = edgeNumberings[i].letter;
                const pieceText = document.querySelector(`.edgeMiddle__${sticker}`);

                if (pieceText) {
                    pieceText.value = letter;
                }
            }
        })
        .catch(() => {
            // エラーが発生した場合は、デフォルトでDFのみ埋める
            const textDF = document.querySelector('.edgeMiddle__DF');
            if (textDF) {
                textDF.value = '@';
            }
        });
};

const saveCornerNumbering = () => {
    const userName = localStorage.userName;
    const token = localStorage.token;

    const hiraganas = [ '@', ...utils.getHiraganas(), ];

    const cornerLn = utils.corners.length;
    let cornerNumberings = [];
    for (let i = 0; i < cornerLn; i++) {
        const sticker = utils.corners[i];
        const pieceText = document.querySelector(`.corner__${sticker}`);

        // 空欄はスキップ
        if (pieceText && pieceText.value.replace(/\s/g, '') !== '') {
            const letter = pieceText.value.replace(/\s/g, '');

            if (letter.length > 1) {
                alert(`エラー:${sticker}:「${pieceText.value}」:ナンバリングは1文字にしてください`);
                return;
            }

            if (!hiraganas.includes(letter)) {
                alert(`エラー:${sticker}:「${pieceText.value}」:使用してはいけない文字です`);
                return;
            }

            const data = {
                sticker,
                letter,
            };
            cornerNumberings.push(data);
        }
    }

    if (cornerNumberings.length !== 3 * (8 - 1) + 1) {
        alert('コーナーのナンバリングを完成させてください。');
        return;
    }

    if (cornerNumberings.filter(x => x.letter === '@').length !== 1) {
        alert('コーナーのバッファは1つのステッカーのみを指定してください');
        return;
    }

    const buffer = cornerNumberings.filter(x => x.letter === '@').map(x => x.sticker)[0];
    const blankStickers = getBlankStickers(buffer);
    if (!checkBlankStickersAreOK(blankStickers, cornerNumberings)) {
        alert('コーナーのバッファがあるパーツにひらがなが割り当てられています');
        return;
    }

    const numberingCornerOptions = {
        url: `${config.apiRoot}/numbering/corner/`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            userName,
            numberings: cornerNumberings,
            token,
        },
    };

    return rp(numberingCornerOptions);
};

// FIXME コーナーと共通化
const saveEdgeNumbering = () => {
    const userName = localStorage.userName;
    const token = localStorage.token;

    const hiraganas = [ '@', ...utils.getHiraganas(), ];

    const edgeLn = utils.edges.length;
    let edgeNumberings = [];
    for (let i = 0; i < edgeLn; i++) {
        const sticker = utils.edges[i];
        const pieceText = document.querySelector(`.edgeMiddle__${sticker}`);

        // 空欄はスキップ
        if (pieceText && pieceText.value.replace(/\s/g, '') !== '') {
            const letter = pieceText.value.replace(/\s/g, '');

            if (letter.length > 1) {
                alert(`エラー:${sticker}:「${pieceText.value}」:ナンバリングは1文字にしてください`);
                return;
            }

            if (!hiraganas.includes(letter)) {
                alert(`エラー:${sticker}:「${pieceText.value}」:使用してはいけない文字です`);
                return;
            }

            const data = {
                sticker,
                letter,
            };
            edgeNumberings.push(data);
        }
    }

    if (edgeNumberings.length !== 2 * (12 - 1) + 1) {
        alert('エッジのナンバリングを完成させてください。');
        return;
    }

    if (edgeNumberings.filter(x => x.letter === '@').length !== 1) {
        alert('エッジのバッファは1つのステッカーのみを指定してください');
        return;
    }

    const buffer = edgeNumberings.filter(x => x.letter === '@').map(x => x.sticker)[0];
    const blankStickers = getBlankStickers(buffer);
    if (!checkBlankStickersAreOK(blankStickers, edgeNumberings)) {
        alert('エッジのバッファがあるパーツにひらがなが割り当てられています');
        return;
    }

    const numberingEdgeOptions = {
        url: `${config.apiRoot}/numbering/edgeMiddle/`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            userName,
            numberings: edgeNumberings,
            token,
        },
    };

    return rp(numberingEdgeOptions);
};

const load = () => {
    loadCornerNumbering();
    loadEdgeNumbering();
};

const save = () => {
    saveCornerNumbering()
        .then(() => {
            saveEdgeNumbering()
                .then(() => {
                    alert('ナンバリングを登録しました');
                })
                .catch(() => {
                    alert('エッジの登録に失敗しました。同じ文字が複数のエッジのステッカーに割り当てられていないかどうか確認してください。');
                });
        })
        .catch(() => {
            alert('コーナーの登録に失敗しました。同じ文字が複数のコーナーのステッカーに割り当てられていないかどうか確認してください。');
        });
};

const init = () => {
    load();

    const saveBtn = document.querySelector('.saveNumberingForm__btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', save);
    }
};

init();

module.exports.getBlankStickers = getBlankStickers;
