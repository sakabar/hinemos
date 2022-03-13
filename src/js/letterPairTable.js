import Handsontable from 'handsontable';
import 'handsontable.css';
const rp = require('request-promise');
const config = require('./config');
const constant = require('./constant');
const numberingUtils = require('./numberingUtils');
const letterPairTableUtils = require('./letterPairTableUtils');
const utils = require('./utils');

const generateTableData = (characterType) => {
    const userName = localStorage.userName;

    const options = {
        url: `${config.apiRoot}/letterPair?userName=${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    const characters = utils.getCharacters(characterType);

    return rp(options)
        .then((ans) => {
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
                    const wordStr = ans.success.result.filter(x => x.letters === letters).map(x => x.word).join(', ');
                    row.push(wordStr);
                }
                tableData.push(row);
            }
            return tableData;
        })
        .catch(() => {
            return [];
        });
};

// hotからletterPairTableを得て、POST
const saveLetterPairTableFromHot = (hot) => {
    // ダブルクリックによる誤作動を防ぐ
    const saveBtn = document.querySelector('.viewLetterPairForm__saveBtn');
    saveBtn.disabled = true;

    const row0 = hot.getDataAtRow(0);
    const col0 = hot.getDataAtCol(0);

    const rowLn = row0.length;
    const colLn = col0.length;

    const letterPairTable = [];
    for (let r = 1; r < rowLn; r++) {
        for (let c = 1; c < colLn; c++) {
            const letters = col0[r] + row0[c];

            // バックスペースだけ押してセルを削除し、すぐに表の外にフォーカスを移した場合は
            // cellStrはnullになる
            const cellStr = hot.getDataAtCell(r, c) || '';

            const words = cellStr === '' ? [] : cellStr.replace(/\s+/g, ' ').split(/[,，、/／]/).map(x => x.trim()).filter(x => x.length > 0);

            if (words.length > 0) {
                const letterPair = {
                    letters,
                    words,
                };
                letterPairTable.push(letterPair);
            }
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

    return numberingUtils.getNumbering(userName, constant.partType.corner)
        .then(cornerNumberings => {
            const cornerNumberingsWithoutBuffer = cornerNumberings.filter(rec => rec.letter !== '@');
            const characterType = utils.getCharacterType(cornerNumberingsWithoutBuffer[0].letter);

            return generateTableData(characterType)
                .then((tableData) => {
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

                    saveBtn.addEventListener('click', () => saveLetterPairTableFromHot(hot));
                    saveBtn.disabled = false;
                });
        });
};

init();
