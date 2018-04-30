import Handsontable from 'handsontable';
import 'handsontable.css';
const rp = require('request-promise');
const config = require('./config');
const utils = require('./utils');

const getCornerNumbering = (userName) => {
    const options = {
        url: `${config.apiRoot}/numbering/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(options)
        .then((result) => {
            // 文字の昇順にソートして返す
            return result.success.result.sort((a, b) => {
                if (a.letter < b.letter) return -1;
                if (a.letter === b.letter) return 0;
                if (a.letter > b.letter) return 1;
            });
        })
        .catch((err) => {
            alert(`ナンバリングの取得に失敗しました:${err}`);
            return [];
        });
};

const getThreeStyleCorners = (userName) => {
    const options = {
        url: `${config.apiRoot}/threeStyle/corner?userName=${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(options)
        .then((result) => {
            return result.success.result;
        })
        .catch((err) => {
            alert(`3-styleの取得に失敗しました: ${err}`);
            return [];
        });
};

const getThreeStyleCornerLogs = (userName) => {
    const options = {
        url: `${config.apiRoot}/threeStyleQuizLog/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(options)
        .then((result) => {
            return result.success.result;
        })
        .catch((err) => {
            alert(`3-styleログの取得に失敗しました: ${err}`);
            return [];
        });
};

// userName, numberingCorner(のsuccess.result部分), threeStyleCorner(のsuccess.result部分)を
// 受け取り、セルに表示するデータを返す
// 余裕があったらテストを書こう FIXME
const generateTableData = (userName, numberingCornerIn, threeStyleCorner) => {
    const numberingCorner = numberingCornerIn.filter(numbering => numbering.letter !== '@'); // この関数内では、バッファの情報は使わない
    const letters = numberingCorner.map(a => a.letter);
    const fstRow = [ ' 3rd \\ 2nd ', ...numberingCorner.map(a => `${a.letter} (${a.sticker})`), ];
    let ans = [ fstRow, ];

    for (let i = 0; i < letters.length; i++) {
        const letter3rd = letters[i];
        const row = [ fstRow[1 + i], ]; // FIXME バグの原因になりそう... fstRow[0]は3rd\2nd

        for (let k = 0; k < letters.length; k++) {
            const letter2nd = letters[k];

            const sticker1 = numberingCorner.filter(a => a.letter === letter2nd)[0].sticker;
            const sticker2 = numberingCorner.filter(a => a.letter === letter3rd)[0].sticker;

            const threeStyle = threeStyleCorner.filter(a => a.sticker1 === sticker1 && a.sticker2 === sticker2);

            // 同じステッカーに対して複数の手順が登録されていた場合は、', '区切りで出力(半角スペースが入っているので注意)
            const threeStyleStr = threeStyle.map(st => utils.showMove(st.setup, st.move1, st.move2)).join(', ');
            row.push(threeStyleStr);
        }

        ans.push(row);
    }

    return ans;
};

const saveThreeStyleTable = (hot, numberingCorner) => {
    // ダブルクリックによる誤作動を防ぐ
    const saveBtn = document.querySelector('.threeStyleTableForm__saveBtn');
    saveBtn.disabled = true;

    const token = localStorage.token;

    const row0 = hot.getDataAtRow(0);
    const col0 = hot.getDataAtCol(0);

    const buffer = numberingCorner.filter(x => x.letter === '@')[0];
    const bufferSticker = buffer.sticker;

    const rowLn = row0.length;
    const colLn = col0.length;

    // ヘッダ行のフォーマットは"あ (UFR)"のような文字列になっている前提
    const headerRegExp = new RegExp(/^(.) \(([A-Z]+)\)$/);

    const threeStyleTable = [];
    for (let c = 1; c < colLn; c++) {
        const sticker1Match = row0[c].match(headerRegExp);
        if (!sticker1Match) {
            alert(`想定していない文字列がヘッダ行に入っています: ${row0[c]}`);
            return;
        }

        const letter1 = sticker1Match[1]; // 'あ' など
        const sticker1 = sticker1Match[2]; // 'UFR' など

        for (let r = 1; r < rowLn; r++) {
            const sticker2Match = col0[r].match(headerRegExp);
            if (!sticker2Match) {
                alert(`想定していない文字列がカラム行に入っています: ${col0[r]}`);
                return;
            }

            const letter2 = sticker2Match[1]; // 'き' など
            const sticker2 = sticker2Match[2]; // 'RDF' など

            const cellStr = hot.getDataAtCell(r, c);
            let threeStyles = [];
            try {
                threeStyles = utils.readThreeStyles(cellStr);
            } catch (e) {
                alert(`${e}\nステッカー: ${letter1}${letter2}\n例\n[U, R D R\']\nまたは\n[D, [U, R D R\']]\nまたは\n[D Rw2 U R U\' Rw2 D R\' D2]`);
                saveBtn.disabled = false;
                return;
            }

            // 空のセルに関してはpushしない
            for (let i = 0; i < threeStyles.length; i++) {
                const ts = threeStyles[i];
                const instance = {
                    buffer: bufferSticker,
                    sticker1,
                    sticker2,
                    setup: ts.setup,
                    move1: ts.move1,
                    move2: ts.move2,
                };
                threeStyleTable.push(instance);
            }
        }
    }

    const options = {
        url: `${config.apiRoot}/threeStyleCornerTable`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            threeStyleTable,
            token,
        },
    };

    if (threeStyleTable.length === 0) {
        alert('何か手順を登録してください。');
        saveBtn.disabled = false;
        return;
    }

    rp(options)
        .then((result) => {
            alert('保存が完了しました');
            saveBtn.disabled = false;
        })
        .catch((err) => {
            // FIXME なかなかひどい実装
            const msg = err.message.match(/『[^』]*』/)[0];
            alert(msg);
            saveBtn.disabled = false;
        });
};

const init = () => {
    const userName = localStorage.userName;

    const saveBtn = document.querySelector('.threeStyleTableForm__saveBtn');
    saveBtn.disabled = true; // ロードが完了する前は押せないようにする

    getCornerNumbering(userName)
        .then((numberingCorner) => {
            getThreeStyleCorners(userName)
                .then((threeStyleCorner) => {
                    const tableData = generateTableData(userName, numberingCorner, threeStyleCorner);

                    const container = document.querySelector('.viewThreeStyleTable__table');

                    const hot = new Handsontable(container, {
                        data: tableData,
                        rowHeaders: true,
                        colHeaders: true,
                        fixedColumnsLeft: 1,
                        fixedRowsTop: 1,
                        cells: (row, col, prop) => {
                            const cellProperties = {};
                            if (row === 0 || col === 0) {
                                // ひらがな行とひらがな列は変更不可
                                cellProperties.readOnly = true;
                            }

                            return cellProperties;
                        },
                    });

                    saveBtn.addEventListener('click', () => saveThreeStyleTable(hot, numberingCorner));
                    saveBtn.disabled = false; // もし後続の色付けに失敗したとしても、保存はできるようにする

                    // クイズのタイムに応じて色を付ける
                    getThreeStyleCornerLogs(userName)
                        .then((threeStyleCornerLog) => {
                            const buffer = numberingCorner.filter(a => a.letter === '@')[0].sticker;
                            const stickers = numberingCorner.filter(numbering => numbering.letter !== '@').map(a => a.sticker);

                            // 0行目、0列目はヘッダ行/カラムなので、1から始まる
                            for (let rowInd = 1; rowInd <= stickers.length; rowInd++) {
                                const sticker2 = stickers[rowInd - 1];

                                for (let colInd = 1; colInd <= stickers.length; colInd++) {
                                    const sticker1 = stickers[colInd - 1];
                                    const td = hot.getCell(rowInd, colInd);

                                    const threeStyleLog = threeStyleCornerLog.filter(a => a.buffer === buffer && a.sticker1 === sticker1 && a.sticker2 === sticker2);

                                    if (threeStyleLog && threeStyleLog.length !== 0) {
                                        // 秒数の記録があったら、その記録に応じて色を付ける
                                        const avgSec = threeStyleLog[0]['avg_sec'];

                                        if (0 <= avgSec && avgSec < 1.0) {
                                            td.style.backgroundColor = '#00ff00'; // 緑
                                        } else if (1.0 <= avgSec && avgSec < 1.5) {
                                            td.style.backgroundColor = '#e0ffff'; // 水色
                                        } else if (1.5 <= avgSec && avgSec < 2.0) {
                                            td.style.backgroundColor = '#e0e0f8'; // 薄い青
                                        } else if (2.0 <= avgSec && avgSec < 2.5) {
                                            td.style.backgroundColor = '#a9d0f5'; // ちょっと濃い青
                                        } else if (2.5 <= avgSec && avgSec < 3.0) {
                                            td.style.backgroundColor = '#ffff00'; // 黄色
                                        } else if (3.0 <= avgSec && avgSec < 4.0) {
                                            td.style.backgroundColor = '#f7d358'; // 薄いオレンジ
                                        } else if (4.0 <= avgSec && avgSec < 6.0) {
                                            td.style.backgroundColor = '#ffa500'; // オレンジ
                                        } else if (6.0 <= avgSec) {
                                            td.style.backgroundColor = '#ff0000'; // 赤
                                        }
                                    } else {
                                        // 無かったら、灰色にする
                                        td.style.backgroundColor = '#cccccc';
                                    }
                                }
                            }
                        })
                        .catch((err) => {
                            alert(`1: ${err}`);
                            return [];
                        });
                })
                .catch((err) => {
                    alert(`2: ${err}`);
                    return [];
                });
        })
        .catch((err) => {
            alert(`3: ${err}`);
            return [];
        });
};

init();
