const rp = require('request-promise');
const corners = [
    'UBL', 'UBR', 'UFR', 'UFL',
    'RFU', 'RBU', 'RDF', 'RBD',
    'LBU', 'LFU', 'LBD', 'LDF',
    'FLU', 'FRU', 'FDL', 'FDR',
    'BRU', 'BLU', 'BDR', 'BDL',
    'DFR', 'DFL', 'DBR', 'DBL',
];

// FIXME テスト書く
const strMax = (s1, s2) => {
    if (s1 >= s2) {
        return s1;
    }
    return s2;
};

// FIXME テスト書く
const strMin = (s1, s2) => {
    if (s1 <= s2) {
        return s1;
    }
    return s2;
};

// 'UBL' -> ['BLU','LBU']
// FIXME テスト書く
const getBlankStickers = (bufferSticker) => {
    if (bufferSticker.length !== 3) {
        return [];
    }
    const s0 = bufferSticker[0];
    const s1 = bufferSticker[1];
    const s2 = bufferSticker[2];

    const ans1 = s1 + strMin(s0, s2) + strMax(s0, s2);
    const ans2 = s2 + strMin(s0, s1) + strMax(s0, s1);

    return [ strMin(ans1, ans2), strMax(ans1, ans2), ];
};

// FIXME テスト書く
const checkBlankStickersAreOK = (blankStickers, numberings) => {
    for (let i = 0; i < blankStickers.length; i++) {
        const blankSticker = blankStickers[i];
        // 空欄のものはnumberingsへの追加をスキップしている仕様
        if (numberings.filter(x => x.sticker === blankSticker).length !== 0) {
            return false;
        }
    }

    return true;
};

const loadNumbering = () => {
    const userName = localStorage.userName;
    const options = {
        url: API_ROOT + '/numbering/corner/' + userName,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    rp(options)
        .then((ans) => {
            const numberings = ans.success.result;
            for (let i = 0; i < numberings.length; i++) {
                const sticker = numberings[i].sticker;
                const letter = numberings[i].letter;
                const pieceText = document.querySelector('.corner__' + sticker);

                if (pieceText) {
                    pieceText.value = letter;
                }
            }
        })
        .catch(() => {
            //
        });
};

const saveNumbering = () => {
    const hiraganas = '@あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split(/(.{1})/).filter(x => x);

    const userName = localStorage.userName;
    const token = localStorage.token;

    const cornerLn = corners.length;
    let numberings = [];
    for (let i = 0; i < cornerLn; i++) {
        const sticker = corners[i];
        const pieceText = document.querySelector('.corner__' + sticker);

        // 空欄はスキップ
        if (pieceText && pieceText.value.replace(/\s/g, '') !== '') {
            const letter = pieceText.value.replace(/\s/g, '');

            if (letter.length > 1) {
                alert('エラー:' + sticker + ':「' + pieceText.value + '」:ナンバリングは1文字にしてください');
                return;
            }

            if (!hiraganas.includes(letter)) {
                alert('エラー:' + sticker + ':「' + pieceText.value + '」:使用してはいけない文字です');
                return;
            }

            const data = {
                sticker,
                letter,
            };
            numberings.push(data);
        }
    }

    if (numberings.length !== 7 * 3 + 1) {
        alert('ナンバリングを完成させてください。');
        return;
    }

    if (numberings.filter(x => x.letter === '@').length !== 1) {
        alert('バッファは1つのステッカーのみを指定してください');
        return;
    }

    const buffer = numberings.filter(x => x.letter === '@').map(x => x.sticker)[0];
    const blankStickers = getBlankStickers(buffer);
    if (!checkBlankStickersAreOK(blankStickers, numberings)) {
        alert('バッファがあるパーツにひらがなが割り当てられています');
        return;
    }

    const options = {
        url: API_ROOT + '/numbering/corner',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            userName,
            numberings,
            token,
        },
    };

    rp(options)
        .then((result) => {
            alert('ナンバリングを登録しました');
        })
        .catch(() => {
            alert('登録に失敗しました。同じ文字が複数のステッカーに割り当てられていないかどうか確認してください。');
            // alert(err);
        });
};

const init = () => {
    loadNumbering();

    const saveBtn = document.querySelector('.saveNumberingForm__btn');
    saveBtn.addEventListener('click', saveNumbering);
};

init();
