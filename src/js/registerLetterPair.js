const rp = require('request-promise');

const suggestWord = () => {
    const lettersText = document.querySelector('.registerLetterPairForm__lettersText');
    const letters = lettersText.value.replace(/\s/g, '');
    const wordText = document.querySelector('.registerLetterPairForm__wordText');

    const options = {
        url: API_ROOT + `/letterPair?letters=${letters}`,
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
        url: API_ROOT + `/letterPair/${userName}`,
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

    const suggestWordBtn = document.querySelector('.registerLetterPairForm__suggestWordBtn');
    suggestWordBtn.addEventListener('click', suggestWord);
};

init();
