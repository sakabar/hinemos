import Handsontable from 'handsontable';
import 'handsontable.css';
const rp = require('request-promise');
const config = require('./config');
const constant = require('./constant');
const numberingUtils = require('./numberingUtils');
const letterPairTableUtils = require('./letterPairTableUtils');
const utils = require('./utils');

const generateTableData = (characterType, letterPairs) => {
    const userName = localStorage.userName;
    const characters = utils.getCharacters(characterType);

    const fstRow = [
        ' 2rd \\ 3rd ',
        ...characters,
    ];

    const tableData = [
        fstRow,
    ];

    for (let i = 0; i < characters.length; i++) {
        const rowHiragana = characters[i];
        const row = [
            rowHiragana,
        ];
        for (let k = 0; k < characters.length; k++) {
            const colHiragana = characters[k];
            const letters = rowHiragana + colHiragana;
            const wordStr = letterPairs.filter(x => x.letters === letters).map(x => x.word).join(', ');
            row.push(wordStr);
        }
        tableData.push(row);
    }
    return tableData;
};

// hotからletterPairTableを得て、POST
const saveLetterPairTableFromHot = (hot, letterPairs) => {
    // ダブルクリックによる誤作動を防ぐ
    const saveBtn = document.querySelector('.viewLetterPairForm__saveBtn');
    saveBtn.disabled = true;

    const row0 = hot.getDataAtRow(0);
    const col0 = hot.getDataAtCol(0);

    const rowLn = row0.length;
    const colLn = col0.length;

    // アルファベットのレターペア表を保存する時にひらがなのレターペアを消すことがないように、
    // 登録済みのレターペアをデフォルトで登録しておいて、それを表の情報で上書きする
    const lettersToWordsHash = {};
    letterPairs.map(obj => {
        const {
            letters,
            word,
        } = obj;

        if (letters in lettersToWordsHash) {
            lettersToWordsHash[letters].push(word);
        } else {
            lettersToWordsHash[letters] = [ word, ];
        }
    });

    for (let r = 1; r < rowLn; r++) {
        for (let c = 1; c < colLn; c++) {
            const letters = col0[r] + row0[c];

            // バックスペースだけ押してセルを削除し、すぐに表の外にフォーカスを移した場合は
            // cellStrはnullになる
            const cellStr = hot.getDataAtCell(r, c) || '';

            const words = cellStr === '' ? [] : cellStr.replace(/\s+/g, ' ').split(/[,，、/／]/).map(x => x.trim()).filter(x => x.length > 0);

            // 上書きする
            lettersToWordsHash[letters] = words;
        }
    }

    const letterPairTable = [];
    const keys = Object.keys(lettersToWordsHash);
    for (let i = 0; i < keys.length; i++) {
        const letters = keys[i];
        const words = lettersToWordsHash[letters];
        try {
            if (words.length > 0) {
                const p = {
                    letters,
                    words,
                };

                letterPairTable.push(p);
            }
        } catch () {
            //
        }
    }

    return letterPairTableUtils.saveLetterPairTable(letterPairTable)
        .then((result) => {
            alert('保存が完了しました');
            saveBtn.disabled = false; // 元に戻す
        })
        .catch((err) => {
            // FIXME なかなかひどい実装
            const m = err.message.match(/『[^』]*』/);
            if (m) {
                const msg = m[0];
                alert(msg);
            } else {
                const msg = `エラーが発生しました: ${err}`;
                alert(msg);
            }
            saveBtn.disabled = false; // 元に戻す
        });
};

const init = () => {
    const userName = localStorage.userName;
    const saveBtn = document.querySelector('.viewLetterPairForm__saveBtn');
    saveBtn.disabled = true;

    const container = document.querySelector('.viewLetterPairForm__table');

    const characterTypeParam = (new URL(location.href)).searchParams.get('characterType');
    const tmpCharacter = characterTypeParam === 'alphabet' ? 'A' : 'あ';
    const characterType = utils.getCharacterType(tmpCharacter);

    const options = {
        url: `${config.apiRoot}/letterPair?userName=${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    rp(options)
        .then(ans => {
            const letterPairs = ans.success.result;

            const tableData = generateTableData(characterType, letterPairs);

            const hot = new Handsontable(container, {
                data: tableData,
                licenseKey: 'non-commercial-and-evaluation',
                rowHeaders: true,
                colHeaders: true,
                cells: (row, col, prop) => {
                    let cellProperties = {};
                    if (row === 0 || col === 0) {
                        // ひらがな行とひらがな列は変更不可
                        cellProperties.readOnly = true;
                    }

                    return cellProperties;
                },
                fixedColumnsLeft: 1,
                fixedRowsTop: 1,
            });
            saveBtn.addEventListener('click', () => saveLetterPairTableFromHot(hot, letterPairs));
            saveBtn.disabled = false;
        })
        .catch(() => {
            //
        });
};

init();
