const rp = require('request-promise');
const shuffle = require('shuffle-array');
const url = require('url');
const config = require('./config');
const utils = require('./utils');

const letterPairsToWords = (letterPairs, letters) => {
    const ans = {
        letters,
        words: letterPairs.filter(x => x.letters === letters).map(x => x.word),
    };

    return ans;
};

// クイズに使うlettersを決定
// まだやっていない問題がある → それをやる
// やっていない問題がない → 正解数が少ないもの順
// 引数: letterPairs = [{letters: "あい", word: "合いの手"}, {letters: "あい", word: "愛"}]
const selectUnsolvedLetterPairs = (letterPairs, quizLogRes) => {
    if (letterPairs.length === 0) {
        return [];
    }

    const solvedLetters = quizLogRes.map(x => x.letters); // APIの返す値であるquizLogResのキーは一意になっている前提
    const allLetters = Array.from(new Set(letterPairs.map(x => x.letters)));
    const unsolvedLetters = allLetters.filter(x => !solvedLetters.includes(x));

    return unsolvedLetters.length > 0 ? shuffle(unsolvedLetters.map(letters => letterPairsToWords(letterPairs, letters)), { copy: true, }) : solvedLetters.filter(letters => allLetters.includes(letters)).map(letters => letterPairsToWords(letterPairs, letters)); // 配列のincludeを何回も回すのは遅い レイテンシが遅いならFIXME
};

// 登録済のレターペアと、「解いた」問題ログ(agg済)を受け取り、解いた問題から出題
// quizLogResの順番を維持する (解くのにかかった平均時間の降順のはず)
const selectSolvedLetterPairs = (letterPairs, quizLogRes) => {
    if (!letterPairs || letterPairs.length === 0 || !quizLogRes || quizLogRes.length === 0) {
        return [];
    }

    // 両方に共通するlettersを確定
    const quizLogResLetters = quizLogRes.map(x => x.letters); // APIの返す値であるquizLogResのキーは一意になっている前提
    const registeredLetters = Array.from(new Set(letterPairs.map(x => x.letters)));
    const commonLetters = quizLogResLetters.filter(letters => registeredLetters.includes(letters));

    // 変換処理
    return commonLetters.map(letters => letterPairsToWords(letterPairs, letters));
};

const submit = (selectedLetterPairs, isRecalled) => {
    // const userName = localStorage.userName;
    const token = localStorage.token;
    const quizFormLettersText = document.querySelector('.quizForm__lettersText');
    const quizFormPrevAnsText = document.querySelector('.quizForm__prevAnsText');
    const quizFormStartUnixTimeHidden = document.querySelector('.quizForm__startUnixTimeHidden');
    const quizFormPrevSecText = document.querySelector('.quizForm__prevSecText');
    const quizFormLettersIndHidden = document.querySelector('.quizForm__quizLettersIndHidden');

    const letters = quizFormLettersText.value;
    const ind = parseInt(quizFormLettersIndHidden.value.split(':')[1]);
    if (ind > selectedLetterPairs.length - 1) {
        return;
    }

    const startTime = parseFloat(quizFormStartUnixTimeHidden.value);
    const now = new Date().getTime();
    const sec = (now - startTime) / 1000.0;

    // secが短すぎる場合、誤操作の可能性が高いので無視
    if (sec < 0.25) {
        return;
    }

    const options = {
        url: `${config.apiRoot}/letterPairQuizLog`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            letters,
            isRecalled,
            token,
            sec,
        },
    };

    rp(options)
        .then((ans) => {
            const prevAns = '前問の答え:' + selectedLetterPairs.filter(x => x.letters === letters).map(x => x.words).join(',');
            const nextInd = ind + 1;

            quizFormLettersIndHidden.value = `このセッションで解いた問題数:${nextInd}`;
            quizFormPrevAnsText.value = prevAns;
            quizFormPrevSecText.value = `前問の秒数:${sec.toFixed(2)}`;
            if (nextInd <= selectedLetterPairs.length - 1) {
                quizFormStartUnixTimeHidden.value = String(new Date().getTime());
                quizFormLettersText.value = selectedLetterPairs[nextInd].letters;
            } else {
                quizFormLettersText.value = 'お疲れ様です、ページを更新してください。';
            }
        })
        .catch((err) => {
            alert('通信に失敗しました:' + err);
        });
};

// 入力された設定を反映
const reloadWithOptions = () => {
    const daysText = document.querySelector('.settingForm__daysText');

    // daysは0以上の値であることを想定
    const days = Math.max(parseFloat(daysText.value), 0);

    const solved = document.querySelector('#settingForm__radio--solved').checked;

    location.href = `${config.urlRoot}/letterPairQuiz.html?&solved=${solved}&days=${days}`;
};

// ページのロード時に、daysとsolvedの設定に応じてinput属性の値を変える
const renderSettings = (days, solved) => {
    const daysText = document.querySelector('.settingForm__daysText');
    const solvedRadio = document.querySelector('#settingForm__radio--solved');

    if (days && daysText) {
        daysText.value = days;
    }

    if (solved) {
        solvedRadio.checked = true;
    }
};

// 右/左のボタンの挙動を設定
// 画面での配置を変えた時にはこれも変えないといけない
const keyUpAction = (selectedLetterPairs) => {
    return (evt) => {
        if (evt.which === 37 || evt.which === 32) {
            // 左キー or Space
            submit(selectedLetterPairs, 1);
        } else if (evt.which === 38) {
            // 上キー
        } else if (evt.which === 39 || evt.which === 8) {
            // 右キー or BackSpace
            submit(selectedLetterPairs, 0);
        } else if (evt.which === 40) {
            // 下キー
        }
    };
};

// FIXME 日数のデフォルト値がAPIとFrontで二重になっているのが気になる
const init = () => {
    const urlObj = url.parse(location.href, true);
    const days = urlObj.query.days ? parseFloat(urlObj.query.days) : 28; // 「n日間に」
    const solved = urlObj.query.solved === 'true'; // 解いた or 解いていない問題

    // ロード時に埋める
    renderSettings(days, solved);

    const userName = localStorage.userName;
    const okBtn = document.querySelector('.quizForm__submitBtn--OK');
    const ngBtn = document.querySelector('.quizForm__submitBtn--NG');
    const quizFormLettersText = document.querySelector('.quizForm__lettersText');
    const quizFormStartUnixTimeHidden = document.querySelector('.quizForm__startUnixTimeHidden');

    // 設定読み込みボタン
    const reloadBtn = document.querySelector('.settingForm__reloadBtn');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', reloadWithOptions);
    }

    // 登録済のレターペアを持っておく
    const letterPairOptions = {
        url: `${config.apiRoot}/letterPair?userName=${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    const urlStr = days ? `${config.apiRoot}/letterPairQuizLog/${userName}?days=${days}` : `${config.apiRoot}/letterPairQuizLog/${userName}?`;

    // クイズ履歴
    const quizLettersOptions = {
        url: urlStr,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // 【注意】
    // レターペアクイズで「n日間に解いてい『ない』」問題を表示するためには、
    // APIで「n日間に解い『た』」問題を引っぱってきて、
    // FEのロジックとして補集合を取る

    // テスト時などは以降の処理をスキップ
    if (!quizFormLettersText) {
        return;
    }

    rp(quizLettersOptions)
        .then((ans) => {
            const quizLogRes = ans.success.result;

            return rp(letterPairOptions)
                .then((ans) => {
                    const letterPairs = ans.success.result;

                    const tmpSelected = solved ? selectSolvedLetterPairs(letterPairs, quizLogRes) : selectUnsolvedLetterPairs(letterPairs, quizLogRes);
                    const selectedLetterPairs = utils.chunkAndShuffle(tmpSelected, 50);

                    if (selectedLetterPairs.length > 0) {
                        quizFormLettersText.value = selectedLetterPairs[0].letters;
                        quizFormStartUnixTimeHidden.value = String(new Date().getTime());
                        okBtn.addEventListener('click', () => submit(selectedLetterPairs, 1));
                        ngBtn.addEventListener('click', () => submit(selectedLetterPairs, 0));

                        // 左右のキーのショートカット
                        document.onkeyup = keyUpAction(selectedLetterPairs);
                    } else {
                        alert('出題するレターペアがありませんでした');
                    }
                });
        })
        .catch((err) => {
            alert(err);
            quizFormLettersText.value = '読み込みに失敗しました';
        });
};

init();

exports.selectSolvedLetterPairs = selectSolvedLetterPairs;
exports.selectUnsolvedLetterPairs = selectUnsolvedLetterPairs;
