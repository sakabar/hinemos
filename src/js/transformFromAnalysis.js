const rp = require('request-promise');

const suggestWord = () => {
    const lettersText = document.querySelector('.registerLetterPairForm__lettersText');
    const letters = lettersText.value.replace(/\s/g, '');
    const wordText = document.querySelector('.registerLetterPairForm__wordText');

    const options = {
        url: API_ROOT + '/letterPair?letters=' + letters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
        },
    };

    rp(options)
        .then((ans) => {
            const results = ans.success.result;
            if (wordText.value.length === 0) {
                wordText.value = Array.from(new Set(results.map(x => x.word))).join('\n');
            } else {
                wordText.value += '\n' + Array.from(new Set(results.map(x => x.word))).join('\n');
            }
        })
        .catch((err) => {
            alert(err);
        });
};

const registerLetterPair = () => {
    const hiraganas = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split(/(.{1})/).filter(x => x);

    const userName = localStorage.userName;
    const token = localStorage.token;

    const lettersText = document.querySelector('.registerLetterPairForm__lettersText');
    const letters = lettersText.value;
    const wordText = document.querySelector('.registerLetterPairForm__wordText');
    const word = wordText.value.replace(/\n/g, '、');

    const headers = {
        'Content-Type': 'application/json',
    };

    if (!letters.split(/(.)/).filter(x => x).every(ch => hiraganas.includes(ch))) {
        alert('「あ」〜「ん」の、濁点が付かないひらがなのみを使ってください');
        return;
    }

    const options = {
        url: API_ROOT + '/letterPair/' + userName,
        method: 'POST',
        headers: headers,
        json: true,
        form: {
            word,
            letters,
            token,
        },
    };

    rp(options)
        .then((ans) => {
            lettersText.value = '';
            wordText.value = '';
        })
        .catch(() => {
            alert('登録に失敗しました');

            lettersText.value = '';
            wordText.value = '';
        });
};

// FIXME threeStyleQuizCornerと重複しているので統合する
const showMove = (setup, move1, move2) => {
    if (setup === '') {
        return '[' + move1 + ',' + move2 + ']';
    } else {
        return setup + ' [' + move1 + ',' + move2 + ']';
    }
};

const transformOneLine = (userName, letters) => {
    const letterPairOptions = {
        url: API_ROOT + '/letterPair?userName=' + userName + '&letters=' + letters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // lettersから3-styleを引く
    const threeStyleCornerOptions = {
        url: API_ROOT + '/threeStyleFromLetters/corner?userName=' + userName + '&letters=' + letters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(letterPairOptions)
        .then((ans) => {
            const words = ans.success.result.map((obj) => obj.word).join(', ');

            return rp(threeStyleCornerOptions)
                .then((ans) => {
                    const threeStylesStr = ans.success.result.map((x) => showMove(x.setup, x.move1, x.move2)).join(',');

                    return words + ' ' + threeStylesStr + '\n';
                })
                .catch(() => {
                    return words + '\n';
                });
        })
        .catch(() => {
            return 'ERROR\n';
        });
};

const transformFromAnalysis = () => {
    const lettersText = document.querySelector('.transformFromAnalysisForm__lettersText');
    const letters = lettersText.value;

    const wordsText = document.querySelector('.transformFromAnalysisForm__wordsText');

    const lettersList = letters.split(/([^\s]{1,2})/).filter(x => !x.includes(' ') && x !== '');
    const lettersListLen = lettersList.length;
    const userName = localStorage.userName;

    let promises = [];
    for (let i = 0; i < lettersListLen; i++) {
        promises.push(transformOneLine(userName, lettersList[i]));
    }

    Promise.all(promises)
        .then((results) => {
            wordsText.value = '';
            for (let i = 0; i < results.length; i++) {
                wordsText.value += lettersList[i] + ': ' + results[i];
            }
        })
        .catch(() => {
            //
        });
};

const resetWordText = () => {
    const wordText = document.querySelector('.registerLetterPairForm__wordText');
    wordText.value = '';
};

const init = () => {
    // ひらがなのテキストボックスが変更されたら単語のテキストボックスを空にする
    const lettersText = document.querySelector('.registerLetterPairForm__lettersText');
    lettersText.addEventListener('change', resetWordText);

    const registerLetterPairBtn = document.querySelector('.registerLetterPairForm__btn');
    registerLetterPairBtn.addEventListener('click', registerLetterPair);

    const transformFromAnalysisBtn = document.querySelector('.transformFromAnalysisForm__btn');
    transformFromAnalysisBtn.addEventListener('click', transformFromAnalysis);

    const suggestWordBtn = document.querySelector('.registerLetterPairForm__suggestWordBtn');
    suggestWordBtn.addEventListener('click', suggestWord);
};

init();
