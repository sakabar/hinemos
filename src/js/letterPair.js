import Handsontable from 'handsontable';
import 'handsontable.css';
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

    const lettersList = letters.split(/(.{2})/).filter(x => x);
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

// APIアクセス
// 文字列の配列を','でつなぎ、プロミスで包んで返す
// FIXMEここ、モック使ってテスト書きたい
const requestWords = (userName, letters) => {
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
            return ans.success.result.map((obj) => obj.word).join(', ');
        })
        .catch((err) => {
            return '';
        });
};

const genRowPromise = (hiraganas, rowHiragana, userName) => {
    let promiseWordsList = [];
    for (let k = 0; k < hiraganas.length; k++) {
        let letters = rowHiragana + hiraganas[k];
        promiseWordsList.push(requestWords(userName, letters));
    }

    return Promise.all(promiseWordsList)
        .then((wordsList) => {
            return [rowHiragana, ...wordsList, ];
        });
};

const getHiraganas = () => {
    return 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split(/(.{1})/).filter(x => x);
};

// APIにリクエストを飛ばして、
//tableDataを包んだプロミスを返す? FIXME
const generateTableData = () => {
    const userName = localStorage.userName;
    const hiraganas = getHiraganas();

    let fstRow = ['', ...hiraganas, ];
    let tableData = [fstRow, ];

    let rowPromises = [];
    for (let i = 0; i < hiraganas.length; i++) {
        const rowHiragana = hiraganas[i];
        rowPromises.push(genRowPromise(hiraganas, rowHiragana, userName));
    }

    return Promise.all(rowPromises)
        .then((rows) => {
            const ln = rows.length;
            for (let i = 0; i < ln; i++) {
                tableData.push(rows[i]);
            }
            return tableData;
        });
};

const requestSaveOneWord = (userName, word, letters, token) => {
    const options = {
        url: API_ROOT + '/letterPair/' + userName,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            letters,
            word,
            token,
        },
    };

    return rp(options)
        .then((ans) => {
            return ans;
        })
        .catch((err) => {
            return err;
        });
};

const requestSaveLetterPair = (userName, letters, words, token) => {
    const deleteOptions = {
        url: API_ROOT + '/deleteLetterPair/' + userName,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            letters,
            token,
        },
    };
    // まずは、その文字のレコードを削除
    return rp(deleteOptions)
        .then(() => {
            // そして、表に入力されている文字を新規登録
            let promises = [];
            const w = words.length;
            for (let i = 0; i < w; i++) {
                promises.push(requestSaveOneWord(userName, words[i], letters, token));
            }

            return Promise.all(promises);
        })
        .catch((err) => {
            return (err);
        });
};

const saveLetterPairTable = (hot) => {
    const token = localStorage.token;
    const userName = localStorage.userName;

    const row0 = hot.getDataAtRow(0);
    const col0 = hot.getDataAtCol(0);

    const rowLn = row0.length;
    const colLn = col0.length;

    // i = 0は空文字なので飛ばす
    let promises = [];
    for (let r = 1; r < rowLn; r++) {
        for (let c = 1; c < colLn; c++) {
            const letters = row0[r] + col0[c];
            const cellStr = hot.getDataAtCell(r, c);
            if (cellStr === '') {
                const words = [];
                promises.push(requestSaveLetterPair(userName, letters, words, token));
            } else {
                const words = cellStr.replace(/[ 　]/, '').split(/[,、\/／]/);
                promises.push(requestSaveLetterPair(userName, letters, words, token));
            }
        }
    }

    Promise.all(promises)
        .then((ans) => {
            alert('保存が完了しました');
        })
        .catch((err) => {
            alert('置き換え中にエラーが発生しました');
            alert(err);
        });
};

const init = () => {
    // const registerLetterPairBtn = document.querySelector('.registerLetterPairForm__btn');
    // registerLetterPairBtn.addEventListener('click', registerLetterPair);
    let hot;
    const container = document.querySelector('.viewLetterPairForm__table');
    generateTableData()
        .then((tableData) => {
            hot = new Handsontable(container, {
                data: tableData,
                rowHeaders: true,
                colHeaders: true,
            });

            const transformFromAnalysisBtn = document.querySelector('.transformFromAnalysisForm__btn');
            transformFromAnalysisBtn.addEventListener('click', transformFromAnalysis);

            const saveBtn = document.querySelector('.viewLetterPairForm__saveBtn');
            saveBtn.addEventListener('click', () => saveLetterPairTable(hot));
            return;
        });
};

init();
