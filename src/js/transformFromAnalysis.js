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
            token,
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

const transformOneLine = (userName, letters) => {
    const options = {
        url: API_ROOT + '/letterPair/' + userName + '?letters=' + letters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(options)
        .then((ans) => {
            return ans.success.result.map((obj) => obj.word).join(', ') + '\n';
        })
        .catch((err) => {
            return 'ERROR\n';
        });
};

const transformFromAnalysis = () => {
    const lettersText = document.querySelector('.transformFromAnalysisForm__lettersText');
    const letters = lettersText.value;

    const wordsText = document.querySelector('.transformFromAnalysisForm__wordsText');

    const lettersList = letters.split(/([^ 　]{1,2})/).filter(x => ! x.includes(' ') && x !== '');
    const lettersListLen = lettersList.length;
    const userName = localStorage.userName;

    let promises = [];
    for (let i = 0; i < lettersListLen; i++) {
        promises.push(transformOneLine(userName, lettersList[i]));
    }

    Promise.all(promises)
        .then((results) => {
            wordsText.value = '';
            for(let i = 0; i < results.length; i++) {
                wordsText.value += lettersList[i] + ': ' + results[i];
            }
        })
        .catch((err) => {
            //
        });
};


const init = () => {
    const registerLetterPairBtn = document.querySelector('.registerLetterPairForm__btn');
    registerLetterPairBtn.addEventListener('click', registerLetterPair);

    const transformFromAnalysisBtn = document.querySelector('.transformFromAnalysisForm__btn');
    transformFromAnalysisBtn.addEventListener('click', transformFromAnalysis);
};

init();
