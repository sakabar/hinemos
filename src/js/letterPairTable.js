import Handsontable from 'handsontable';
import 'handsontable.css';
const rp = require('request-promise');

const getHiraganas = () => {
    return 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split(/(.{1})/).filter(x => x);
};

const generateTableData = () => {
    const userName = localStorage.userName;

    const options = {
        url: API_ROOT + '/letterPair?userName=' + userName,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    const hiraganas = getHiraganas();

    return rp(options)
        .then((ans) => {
            let fstRow = ['', ...hiraganas, ];
            let tableData = [fstRow, ];

            for (let i = 0; i < hiraganas.length; i++) {
                const rowHiragana = hiraganas[i];
                let row = [rowHiragana];
                for (let k = 0; k < hiraganas.length; k++) {
                    const colHiragana = hiraganas[k]
                    const letters = rowHiragana + colHiragana;
                    const wordStr = ans.success.result.filter(x => x.letters === letters).map(x => x.word).join(', ');
                    row.push(wordStr);
                }
                tableData.push(row);
            }
            return tableData;
        })
        .catch((err) => {
            return [];
        });
}

const saveLetterPairTable = (hot) => {
    // ダブルクリックによる誤作動を防ぐ
    const saveBtn = document.querySelector('.viewLetterPairForm__saveBtn');
    saveBtn.disabled = true;
    hot.readonly = true;

    const token = localStorage.token;

    const row0 = hot.getDataAtRow(0);
    const col0 = hot.getDataAtCol(0);

    const rowLn = row0.length;
    const colLn = col0.length;

    let letterPairTable = [];
    for (let r = 1; r < rowLn; r++) {
        for (let c = 1; c < colLn; c++) {
            const letters = row0[r] + col0[c];
            const cellStr = hot.getDataAtCell(r, c);

            let words;
            if (cellStr === '') {
                words = [];
            } else {
                words = cellStr.replace(/\s/g, '').split(/[,，、/／]/).filter(x => x.length > 0);
            }

            if (words.length > 0) {
                const letterPair = {
                    letters,
                    words,
                };
                letterPairTable.push(letterPair);
            }
        }
    }

    const options = {
        url: API_ROOT + '/letterPairTable',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            letterPairTable,
            token,
        },
    };

    rp(options)
        .then((result) => {
            alert('保存が完了しました');
            saveBtn.disabled = false;
            hot.readonly = false;
        })
        .catch((err) => {
            const params = err.params;
            const msg = '[' + String(params.letters) + ', ' + String(params.word) + '] の保存中にエラーが発生しました。複数のひらがなに割り当てられている単語が無いか確認してください。';
            alert(msg);

            saveBtn.disabled = false;
            hot.readonly = false;
        });
};

const init = () => {
    const saveBtn = document.querySelector('.viewLetterPairForm__saveBtn');
    saveBtn.disabled = true;

    let hot;
    const container = document.querySelector('.viewLetterPairForm__table');
    generateTableData()
        .then((tableData) => {
            hot = new Handsontable(container, {
                data: tableData,
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

            saveBtn.addEventListener('click', () => saveLetterPairTable(hot));
            saveBtn.disabled = false;
        });
};

init();
