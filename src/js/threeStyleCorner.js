const rp = require('request-promise');
const url = require('url');

// FIXME テスト書く
const isValidMoves = (moveStr) => {
    return /^(([BDFLRUEMS]w?)|[xyz])'?2?( (([BDFLRUEMS]w?)|[xyz])'?2?)*$/.test(moveStr);
};

const checkNew = () => {
    const lettersText = document.querySelector('.registerThreeStyleCornerForm__lettersText');
    const userName = localStorage.userName;
    const letters = lettersText.value.replace(/\s*/g, '');

    const options = {
        url: API_ROOT + `/threeStyleFromLetters/corner?userName=${userName}&letters=${letters}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(options)
        .then((ans) => {
            if (ans.success.result.length === 0) {
                lettersText.style.borderColor = '#00ff00';
                return true;
            } else {
                lettersText.style.borderColor = '#ff0000';
                return false;
            }
        })
        .catch(() => {
            lettersText.style.borderColor = 'solid #ff0000';
            return false;
        });
};

const saveThreeStyleCorner = () => {
    const lettersText = document.querySelector('.registerThreeStyleCornerForm__lettersText');
    const setupText = document.querySelector('.registerThreeStyleCornerForm__setupText');
    const move1Text = document.querySelector('.registerThreeStyleCornerForm__move1Text');
    const move2Text = document.querySelector('.registerThreeStyleCornerForm__move2Text');

    const userName = localStorage.userName;
    const token = localStorage.token;

    const letters = '@' + lettersText.value.replace(/\s*/g, ''); // バッファを意味する'@'を付けておく
    const setup = setupText.value.replace(/\s*$/, '').replace(/^\s*/, '').replace(/[‘’´｀`]/g, '\'');
    const move1 = move1Text.value.replace(/\s*$/, '').replace(/^\s*/, '').replace(/[‘’´｀`]/g, '\'');
    const move2 = move2Text.value.replace(/\s*$/, '').replace(/^\s*/, '').replace(/[‘’´｀`]/g, '\'');

    if (move1 === '' || move2 === '') {
        alert('手順1と手順2を入力してください');
        return;
    }

    if ((setup !== '' && !isValidMoves(setup)) || !isValidMoves(move1) || !isValidMoves(move2)) {
        alert('手順の記法に誤りがあります。各操作の間にはスペースを入れてください。\n例: y Lw\'2 E U');
        return;
    }

    if (lettersText.value.length !== 2) {
        alert('ひらがなは2文字入力してください');
        return;
    }

    if (lettersText.value[0] === lettersText.value[1]) {
        alert('ひらがなの1文字目と2文字目は異なります');
        return;
    }

    // ひらがなをステッカーに変換する
    const numberingOptions = {
        url: API_ROOT + `/numbering/corner/${userName}?letters=${letters}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    rp(numberingOptions)
        .then((ans) => {
            const result = ans.success.result;
            if (result.length !== 3) {
                alert('ナンバリングに含まれていない文字を登録しようとしています。\n先に、ナンバリングを登録してください');
                return;
            }

            let stickers = [];
            for (let i = 0; i < letters.length; i++) {
                const ch = letters[i];
                const sticker = result.filter(x => x.letter === ch)[0].sticker;
                stickers.push(sticker);
            }

            const buffer = stickers[0];
            const sticker1 = stickers[1];
            const sticker2 = stickers[2];

            const threeStyleOptions = {
                url: API_ROOT + '/threeStyle/corner/',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                json: true,
                form: {
                    buffer,
                    sticker1,
                    sticker2,
                    setup,
                    move1,
                    move2,
                    token,
                },
            };

            return rp(threeStyleOptions)
                .then(() => {
                    // 反転した手順を入力
                    const reversed = lettersText.value.split('').reverse().join('');
                    lettersText.value = reversed;
                    const tmpSwap = move1Text.value;
                    move1Text.value = move2Text.value;
                    move2Text.value = tmpSwap;

                    // 登録済かどうか確認
                    checkNew()
                        .then((isNew) => {
                            // 登録済でない場合、空にする
                            if (!isNew) {
                                lettersText.value = '';
                                setupText.value = '';
                                move1Text.value = '';
                                move2Text.value = '';
                                lettersText.style.borderColor = '#eeeeee';
                            }
                        })
                        .catch(() => {
                            lettersText.value = '';
                            setupText.value = '';
                            move1Text.value = '';
                            move2Text.value = '';
                            lettersText.style.borderColor = '#eeeeee';
                        });
                })
                .catch(() => {
                    alert('登録に失敗しました');
                });
        })
        .catch(() => {
            alert('エラーが発生しました');
        });
};

const init = () => {
    const saveBtn = document.querySelector('.registerThreeStyleCornerForm__saveBtn');
    const checkBtn = document.querySelector('.registerThreeStyleCornerForm__checkBtn');

    saveBtn.addEventListener('click', saveThreeStyleCorner);
    checkBtn.addEventListener('click', checkNew);

    // URLのオプションでletters=hoge形式で渡された場合、自動的にlettersTextの値として入力
    const lettersText = document.querySelector('.registerThreeStyleCornerForm__lettersText');
    const urlObj = url.parse(location.href, true);
    const lettersQuery = urlObj.query.letters;
    if (lettersQuery) {
        lettersText.value = lettersQuery;
    }
};

init();
