const rp = require('request-promise');

const func = (letterPairs, letters) => {
    const ans = {
        letters,
        words: letterPairs.filter(x => x.letters === letters).map(x => x.word),
    };

    return ans;
}

// クイズに使うlettersを決定
// まだやっていない問題がある → それをやる
// やっていない問題がない → 正解数が少ないもの順
// [{letters: "あい", word: "合いの手"}, {letters: "あい", word: "愛"}]
const selectLetterPairs = (letterPairs, quizLogRes) => {
    const solvedLetters = quizLogRes.map(x => x.letters);
    const allLetters = Array.from(new Set(letterPairs.map(x => x.letters)));
    const unsolvedLetters = allLetters.filter(x => !solvedLetters.includes(x));

    if (unsolvedLetters.length > 0) {
        return unsolvedLetters.map(letters => func(letterPairs, letters));
    } else {
        return solvedLetters.map(letters => func(letterPairs, letters));
    }
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

    const options = {
        url: API_ROOT + '/letterPairQuizLog',
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

            if (nextInd <= selectedLetterPairs.length - 1) {
                quizFormStartUnixTimeHidden.value = String(new Date().getTime());
                quizFormLettersIndHidden.value = 'このセッションで解いた問題数:' + String(nextInd);
                quizFormLettersText.value = selectedLetterPairs[nextInd].letters;
                quizFormPrevAnsText.value = prevAns;
                quizFormPrevSecText.value = "前問の秒数:" + String(sec);
            } else {
                quizFormLettersIndHidden.value = 'このセッションで解いた問題数:' + String(nextInd);
                quizFormLettersText.value = "お疲れ様です、ページを更新してください。"
                quizFormPrevAnsText.value = prevAns;
                quizFormPrevSecText.value = "前問の秒数:" + String(sec);
            }
        })
        .catch((err) => {
            alert('通信に失敗しました:' + err);
        });
};

const init = () => {
    const userName = localStorage.userName;
    const okBtn = document.querySelector('.quizForm__submitBtn--OK');
    const ngBtn = document.querySelector('.quizForm__submitBtn--NG');
    const quizFormLettersText = document.querySelector('.quizForm__lettersText');
    const quizFormStartUnixTimeHidden = document.querySelector('.quizForm__startUnixTimeHidden');

    // 登録済のレターペアを持っておく
    const letterPairOptions = {
        url: API_ROOT + '/letterPair?userName=' + userName,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // クイズ履歴
    const quizLettersOptions = {
        url: API_ROOT + '/letterPairQuizLog/' + userName,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    let letterPairs = [];
    let quizLogRes = [];
    rp(quizLettersOptions)
        .then((ans) => {
            quizLogRes = ans.success.result;

            return rp(letterPairOptions)
                .then((ans) => {
                    letterPairs = ans.success.result;
                    const selectedLetterPairs = selectLetterPairs(letterPairs, quizLogRes);

                    if (selectedLetterPairs.length > 0) {
                        quizFormLettersText.value = selectedLetterPairs[0].letters;
                        quizFormStartUnixTimeHidden.value = String(new Date().getTime());
                        okBtn.addEventListener('click', () => submit(selectedLetterPairs, 1));
                        ngBtn.addEventListener('click', () => submit(selectedLetterPairs, 0));
                    }
                });
        })
        .catch((err) => {
            alert(err);
            quizFormLettersText.value = '読み込みに失敗しました';
        });
};

init();
