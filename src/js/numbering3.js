const rp = require('request-promise');
const url = require('url');
const config = require('./config');
const utils = require('./utils');

// あるパーツがバッファのあるパーツかどうかを判定する
const isBufferPart = (bufferSticker, cornerPart) => {
    if (bufferSticker.length !== cornerPart.length) {
        throw new Error(`length differs: ${bufferSticker} ${cornerPart}`);
    }

    return (bufferSticker === cornerPart) || getBlankStickers(bufferSticker).includes(cornerPart);
};

// バッファ 'UBL' -> ['BLU','LBU']
const getBlankStickers = (bufferSticker) => {
    if (!utils.corners.includes(bufferSticker) && !utils.edges.includes(bufferSticker)) {
        throw new Error('ERROR: arg length must be corner or edge sticker');
    }

    const ans = [];
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

const getCornerNumbering = (userName) => {
    const numberingCornerOptions = {
        url: `${config.apiRoot}/numbering/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // FIXME 本当はPromiseを外して返したい
    return rp(numberingCornerOptions)
        .then((ans) => {
            return ans.success.result;
        })
        .catch(() => {
            return [];
        });
};

const loadCornerNumbering = () => {
    const userName = localStorage.userName;

    getCornerNumbering(userName)
        .then((cornerNumberings) => {
            // 未登録の場合かエラーが発生した場合は、UBLのみ'@'で埋める
            if (cornerNumberings.length === 0) {
                const textUBL = document.querySelector('.corner__UBL');
                if (textUBL) {
                    textUBL.value = '@';
                }
                return;
            }

            for (let i = 0; i < cornerNumberings.length; i++) {
                const sticker = cornerNumberings[i].sticker;
                const letter = cornerNumberings[i].letter;
                const pieceText = document.querySelector(`.corner__${sticker}`);

                if (pieceText) {
                    pieceText.value = letter;
                }
            }
        });
};

const getEdgeNumbering = (userName) => {
    const numberingEdgeOptions = {
        url: `${config.apiRoot}/numbering/edgeMiddle/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // FIXME 本当はPromiseを外して返したい
    return rp(numberingEdgeOptions)
        .then((ans) => {
            return ans.success.result;
        })
        .catch(() => {
            return [];
        });
};

const loadEdgeNumbering = () => {
    const userName = localStorage.userName;

    getEdgeNumbering(userName)
        .then((edgeNumberings) => {
            // 未登録(もしくはエラー)の場合は、DFのみ'@'で埋める
            if (edgeNumberings.length === 0) {
                const textDF = document.querySelector('.edgeMiddle__DF');
                if (textDF) {
                    textDF.value = '@';
                }
                return;
            }

            for (let i = 0; i < edgeNumberings.length; i++) {
                const sticker = edgeNumberings[i].sticker;
                const letter = edgeNumberings[i].letter;
                const pieceText = document.querySelector(`.edgeMiddle__${sticker}`);

                if (pieceText) {
                    pieceText.value = letter;
                }
            }
        });
};

const saveCornerNumbering = () => {
    const userName = localStorage.userName;
    const token = localStorage.token;

    const hiraganas = [ '@', ...utils.getHiraganas(), ];

    const cornerLn = utils.corners.length;
    const cornerNumberings = [];
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
    const edgeNumberings = [];
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

const loadWithParam = (query) => {
    const ks = Object.keys(query);
    for (let i = 0; i < ks.length; i++) {
        const sticker = ks[i];
        const letter = query[sticker];

        if (utils.corners.includes(sticker)) {
            const pieceText = document.querySelector(`.corner__${sticker}`);
            if (pieceText) {
                // スペースはインポート後に視認できないので除外
                if (!letter.match(/^\s*$/)) {
                    pieceText.value = letter;
                }
            }
        } else if (utils.edges.includes(sticker)) {
            const pieceText = document.querySelector(`.edgeMiddle__${sticker}`);
            if (pieceText) {
                // スペースはインポート後に視認できないので除外
                if (!letter.match(/^\s*$/)) {
                    pieceText.value = letter;
                }
            }
        }
    }
};

const load = () => {
    loadCornerNumbering();
    loadEdgeNumbering();
};

// 現在入力されているナンバリングを、URLとしてエクスポートする
const exportNumbering = () => {
    // できるかどうか分からないが、urlライブラリを使って
    // URLのパラメータ部分だけ置き換えて作ったほうが
    // 変化に頑健だと思う FIXME
    let ansUrl = `${config.urlRoot}/numbering3.html?useParam=true`;

    for (let i = 0; i < utils.corners.length; i++) {
        const sticker = utils.corners[i];
        const pieceText = document.querySelector(`.corner__${sticker}`);
        if (pieceText) {
            const letter = pieceText.value;
            // スペースはインポート後に視認できないので除外
            if (!letter.match(/^\s*$/)) {
                ansUrl = `${ansUrl}&${sticker}=${letter}`;
            }
        }
    }

    for (let i = 0; i < utils.edges.length; i++) {
        const sticker = utils.edges[i];
        const pieceText = document.querySelector(`.edgeMiddle__${sticker}`);
        if (pieceText) {
            const letter = pieceText.value;
            // スペースはインポート後に視認できないので除外
            if (!letter.match(/^\s*$/)) {
                ansUrl = `${ansUrl}&${sticker}=${letter}`;
            }
        }
    }

    return ansUrl;
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
    // URLにパラメータがセットされている時はそのパラメータに従ってナンバリングを埋める
    // そうでない時は、登録済のナンバリングをロードする
    // 例: numbering3.html?useParam=true&UBL=@
    const urlObj = url.parse(location.href, true);
    if (urlObj.query.useParam === 'true') {
        loadWithParam(urlObj.query);
    } else if (urlObj.path) {
        // テスト時は実行しない
        load();
    }

    const saveBtn = document.querySelector('.saveNumberingForm__btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', save);
    }

    const exportBtn = document.querySelector('.exportNumberingForm__btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const newUrl = exportNumbering();
            alert(`現在入力されているナンバリングを意味するURL:\n${newUrl}`);
        });
    }
};

init();

module.exports.isBufferPart = isBufferPart;
module.exports.getBlankStickers = getBlankStickers;
module.exports.getEdgeNumbering = getEdgeNumbering;
module.exports.getCornerNumbering = getCornerNumbering;
