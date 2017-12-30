const rp = require('request-promise');

const registerLetterPair = () => {
    const userName = localStorage.userName;
    const token = localStorage.token;

    const lettersText = document.querySelector('.registerLetterPairForm__lettersText');
    const letters = lettersText.value;
    const wordText = document.querySelector('.registerLetterPairForm__wordText');
    const word = wordText.value;

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        url: API_ROOT + '/letterPair/' + userName,
        method: 'POST',
        headers: headers,
        json: true,
        form: {
            word,
            letters,
            token
        },
    };

    rp(options)
        .then((ans) => {
            lettersText.value = '';
            wordText.value = '';
        })
        .catch((err) => {
            alert('登録に失敗しました');

            lettersText.value = '';
            wordText.value = '';
        });
};

const viewLetterPair = () => {
    const lettersText = document.querySelector('.viewLetterPairForm__lettersText');
    const letters = lettersText.value;

    const wordsText = document.querySelector('.viewLetterPairForm__wordsText');

    const lettersList = letters.split(/(.{2})/).filter(x=>x);
    const lettersListLen = lettersList.length;
    const userName = localStorage.userName;

    const headers = {
        'Content-Type': 'application/json',
    };

    for (let i = 0; i < lettersListLen; i++){
        const options = {
            url: API_ROOT + '/letterPair/' + userName + '?letters=' + lettersList[i],
            method: 'GET',
            headers: headers,
            json: true,
            form: {},
        };

        rp(options)
            .then((ans) => {
                const ln = ans.result.length;
                for (let k = 0; k < ln; k++){
                    wordsText.value += ' ' + ans.result[k].word;
                }
            })
            .catch((err) => {
                wordsText.value += ' ERROR';
            });
    }
};

const init = () => {
    const registerLetterPairBtn = document.querySelector('.registerLetterPairForm__btn');
    registerLetterPairBtn.addEventListener('click', registerLetterPair);

    const viewLetterPairBtn = document.querySelector('.viewLetterPairForm__btn');
    viewLetterPairBtn.addEventListener('click', viewLetterPair);
}

init();
