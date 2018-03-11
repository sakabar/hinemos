const rp = require('request-promise');

// FIXME threeStyleQuizCornerと重複しているので統合する
const showMove = (setup, move1, move2) => {
    if (setup === '') {
        return `[${move1},${move2}]`;
    } else {
        return `${setup} [${move1},${move2}]`;
    }
};

const transformOneLine = (userName, letters) => {
    const letterPairOptions = {
        url: API_ROOT + `/letterPair?userName=${userName}&letters=${letters}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // lettersから3-styleを引く
    const threeStyleCornerOptions = {
        url: API_ROOT + `/threeStyleFromLetters/corner?userName=${userName}&letters=${letters}`,
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

                    return `${words} ${threeStylesStr}\n`;
                })
                .catch(() => {
                    return `${words}\n`;
                });
        })
        .catch(() => {
            return 'ERROR\n';
        });
};

const clearTextArea = () => {
    const lettersText = document.querySelector('.transformFromAnalysisForm__lettersText');
    lettersText.value = '';
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
                wordsText.value += `${lettersList[i]}: ${results[i]}`;
            }
        })
        .catch(() => {
            //
        });
};

const init = () => {
    const transformFromAnalysisBtn = document.querySelector('.transformFromAnalysisForm__btn');
    transformFromAnalysisBtn.addEventListener('click', transformFromAnalysis);

    const clearBtn = document.querySelector('.transformFromAnalysisForm__clearBtn');
    clearBtn.addEventListener('click', clearTextArea);
};

init();
