import Handsontable from 'handsontable';
import 'handsontable.css';
const rp = require('request-promise');
const config = require('./config');
const constant = require('./constant');
const threeStyleUtils = require('./threeStyleUtils');
const numberingUtils = require('./numberingUtils');
const utils = require('./utils');

const getThreeStyleLogs = (userName, part) => {
    const options = {
        url: `${config.apiRoot}/threeStyleQuizLog/${part.name}/${userName}`,
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

// userName, numbering(のsuccess.result部分), threeStyle(のsuccess.result部分)を
// 受け取り、セルに表示するデータを返す
// 余裕があったらテストを書こう FIXME
const generateTableData = (userName, numberingIn, threeStyles) => {
    const numbering = numberingIn.filter(numbering => numbering.letter !== '@'); // 表の中にはバッファ('@')の文字は出現させない
    if (numbering.length === 0) {
        throw new Error('ナンバリングが空です');
    }

    const buffer = numberingIn.filter(numbering => numbering.letter === '@')[0].sticker;
    const letters = numbering.map(a => a.letter);
    const fstRow = [ ' 3rd \\ 2nd ', ...numbering.map(a => `${a.letter} (${a.sticker})`), ];
    const ans = [ fstRow, ];

    for (let i = 0; i < letters.length; i++) {
        const letter3rd = letters[i];
        const row = [ fstRow[1 + i], ]; // FIXME バグの原因になりそう... fstRow[0]は3rd\2nd

        for (let k = 0; k < letters.length; k++) {
            const letter2nd = letters[k];

            const sticker1 = numbering.filter(a => a.letter === letter2nd)[0].sticker;
            const sticker2 = numbering.filter(a => a.letter === letter3rd)[0].sticker;

            const threeStyle = threeStyles.filter(a => a.buffer === buffer && a.sticker1 === sticker1 && a.sticker2 === sticker2);

            // 同じステッカーに対して複数の手順が登録されていた場合は、', '区切りで出力(半角スペースが入っているので注意)
            const threeStyleStr = threeStyle.map(st => utils.showMove(st.setup, st.move1, st.move2)).join(', ');
            row.push(threeStyleStr);
        }

        ans.push(row);
    }

    return ans;
};

const saveThreeStyleTable = (hot, part, numbering) => {
    // ダブルクリックによる誤作動を防ぐ
    const saveBtn = document.querySelector('.threeStyleTableForm__saveBtn');
    saveBtn.disabled = true;

    const token = localStorage.token;

    const row0 = hot.getDataAtRow(0);
    const col0 = hot.getDataAtCol(0);

    const buffer = numbering.filter(x => x.letter === '@')[0];
    const bufferSticker = buffer.sticker;

    const rowLn = row0.length;
    const colLn = col0.length;

    // ヘッダ行のフォーマットは"あ (UFR)"のような文字列になっている前提
    const headerRegExp = new RegExp(/^(.) \(([A-Za-z]+)\)$/);

    // [ [ 'UBR', 'LDF', ], ]
    const emptyCellsStickerPairs = [];

    // 'UFR-UBR-LDF' => [ { setup: '', move1: "R' D R", move2: 'U', }, ]
    const threeStylesDict = {};

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

            // バックスペースだけ押してセルを削除し、すぐに表の外にフォーカスを移した場合は
            // cellStrはnullになる
            const cellStr = hot.getDataAtCell(r, c) || '';
            let threeStyles = [];
            try {
                threeStyles = utils.readThreeStyles(cellStr, part);
            } catch (e) {
                alert(`${e}\nステッカー: ${letter1}${letter2}\n例\n[U, R D R\']\nまたは\n[D: [U, R D R\']]\nまたは\nD Rw2 U R U\' Rw2 D R\' D2`);
                saveBtn.disabled = false;
                return;
            }

            // 空のセルに関しては、後で逆サイクルを使って自動登録を試みる
            if (threeStyles.length === 0) {
                const stickerPair = [ sticker1, sticker2, ];
                emptyCellsStickerPairs.push(stickerPair);
            }
            threeStylesDict[`${bufferSticker}-${sticker1}-${sticker2}`] = threeStyles;

            for (let i = 0; i < threeStyles.length; i++) {
                const ts = threeStyles[i];
                const instance = {
                    buffer: bufferSticker,
                    sticker1,
                    sticker2,
                    setup: ts.setup,
                    move1: ts.move1,
                    move2: ts.move2,
                    // FIXME これは上の引数から構築できるので、わざわざ構築して渡しているのがちょっと引っかかる
                    shownMove: utils.showMove(ts.setup, ts.move1, ts.move2),
                };
                threeStyleTable.push(instance);
            }
        }
    }

    for (let k = 0; k < emptyCellsStickerPairs.length; k++) {
        const [
            sticker1,
            sticker2,
        ] = emptyCellsStickerPairs[k];

        const invs = threeStylesDict[`${bufferSticker}-${sticker2}-${sticker1}`] || [];

        for (let i = 0; i < invs.length; i++) {
            const {
                setup,
                move1: move1OfInvCycle,
                move2: move2OfInvCycle,
            } = invs[i];

            // 逆サイクルの動きを利用するので入れ換える
            const move1 = move2OfInvCycle;
            const move2 = move1OfInvCycle;

            const instance = {
                buffer: bufferSticker,
                sticker1,
                sticker2,
                setup,
                move1,
                move2,
                // FIXME これは上の引数から構築できるので、わざわざ構築して渡しているのがちょっと引っかかる
                shownMove: utils.showMove(setup, move1, move2),
            };
            threeStyleTable.push(instance);
        }
    }

    const options = {
        url: `${config.apiRoot}/threeStyleTable/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            buffer: bufferSticker,
            threeStyleTable,
            token,
        },
    };

    if (threeStyleTable.length === 0) {
        alert('何か手順を登録してください。');
        saveBtn.disabled = false;
        return;
    }

    return rp(options)
        .then((result) => {
            saveBtn.disabled = false;
            alert('保存が完了しました');
        })
        .catch((err) => {
            saveBtn.disabled = false;
            const msg = err.message.replace(/\\n/g, '\n');
            alert(msg);
        });
};

const init = () => {
    const userName = localStorage.userName;
    const h2Part = document.querySelector('.h2__part');

    const saveBtn = document.querySelector('.threeStyleTableForm__saveBtn');
    saveBtn.disabled = true; // ロードが完了する前は押せないようにする

    const urlObj = new URL(location.href);

    const visualType = urlObj.searchParams.get('visualType');

    // URLのオプションでpart=(corner|edgeMiddle|edgeWing|centerX|centerT)という形式で、パートが渡される
    // それ以外の場合はエラー
    const partQuery = urlObj.searchParams.get('part');
    let part;
    if (constant.partType[partQuery]) {
        const partType = constant.partType[partQuery];
        h2Part.appendChild(document.createTextNode(partType.japanese));
        part = partType;
    } else {
        alert('URLが不正です: part=(corner|edgeMiddle|edgeWing|centerX|centerT)のいずれかを指定してください');
        return;
    }

    return numberingUtils.getNumbering(userName, part)
        .then((numbering) => {
            const bufferSticker = numbering.filter(numbering => numbering.letter === '@')[0].sticker;

            return threeStyleUtils.getThreeStyles(userName, part, bufferSticker)
                .then((threeStyles) => {
                    const tableData = generateTableData(userName, numbering, threeStyles);

                    const container = document.querySelector('.viewThreeStyleTable__table');

                    const hot = new Handsontable(container, {
                        data: tableData,
                        licenseKey: 'non-commercial-and-evaluation',
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

                    saveBtn.addEventListener('click', () => saveThreeStyleTable(hot, part, numbering));
                    saveBtn.disabled = false; // もし後続の色付けに失敗したとしても、保存はできるようにする

                    // クイズのタイムに応じて色を付ける
                    return getThreeStyleLogs(userName, part)
                        .then((threeStyleLogs) => {
                            const stickers = numbering.filter(numbering => numbering.letter !== '@').map(a => a.sticker);

                            // 0行目、0列目はヘッダ行/カラムなので、1から始まる
                            for (let rowInd = 1; rowInd <= stickers.length; rowInd++) {
                                const sticker2 = stickers[rowInd - 1];

                                for (let colInd = 1; colInd <= stickers.length; colInd++) {
                                    const sticker1 = stickers[colInd - 1];
                                    const td = hot.getCell(rowInd, colInd);

                                    const threeStyleLog = threeStyleLogs.filter(a => a.buffer === bufferSticker && a.sticker1 === sticker1 && a.sticker2 === sticker2);

                                    if (threeStyleLog && threeStyleLog.length !== 0) {
                                        // 秒数の記録があったら、その記録に応じて色を付ける
                                        const threeStyle = threeStyles.filter(a => a.buffer === bufferSticker && a.sticker1 === sticker1 && a.sticker2 === sticker2)[0];

                                        if (!threeStyle) {
                                            // クイズのログはあるが3-style手順は登録されていない場合は、灰色にする
                                            td.style.backgroundColor = '#cccccc';
                                            continue;
                                        }

                                        const numberOfMoves = threeStyle.numberOfMoves;
                                        const avgSec = threeStyleLog[0]['avg_sec'];
                                        const tps = 1.0 * numberOfMoves / avgSec;
                                        const solved = threeStyleLog[0].solved;
                                        const tried = threeStyleLog[0].tried;

                                        if (visualType === 'sec') {
                                            if (solved < tried) {
                                                // 3回連続で正解していない場合
                                                td.style.backgroundColor = '#ff0000'; // 赤
                                            } else {
                                                if (0 < avgSec && avgSec < 1.0) {
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
                                            }
                                        } else if (visualType === 'tps') {
                                            if (0 < tps && tps < 2.0) {
                                                td.style.backgroundColor = '#ff0000'; // 赤
                                            } else if (2.0 <= tps && tps < 3.0) {
                                                td.style.backgroundColor = '#ffa500'; // オレンジ
                                            } else if (3.0 <= tps && tps < 4.0) {
                                                td.style.backgroundColor = '#f7d358'; // 薄いオレンジ
                                            } else if (4.0 <= tps && tps < 5.0) {
                                                td.style.backgroundColor = '#ffff00'; // 黄色
                                            } else if (5.0 <= tps && tps < 6.0) {
                                                td.style.backgroundColor = '#a9d0f5'; // ちょっと濃い青
                                            } else if (6.0 <= tps && tps < 7.0) {
                                                td.style.backgroundColor = '#e0e0f8'; // 薄い青
                                            } else if (7.0 <= tps && tps < 8.0) {
                                                td.style.backgroundColor = '#e0ffff'; // 水色
                                            } else if (8.0 <= tps && tps < 9.0) {
                                                td.style.backgroundColor = '#98fb98'; // 薄い緑
                                            } else if (9.0 <= tps && tps < 10.0) {
                                                td.style.backgroundColor = '#00ff00'; // 緑
                                            } else if (10.0 <= tps) {
                                                td.style.backgroundColor = '#32cd32'; // 濃い緑
                                            }
                                        } else {
                                            throw new Error('visualTypeの値がが不正です');
                                        }
                                    } else {
                                        // 秒数の記録が無かったら、灰色にする
                                        td.style.backgroundColor = '#cccccc';
                                    }
                                }
                            }
                        })
                        .catch((err) => {
                            alert(`${err}`);
                            return [];
                        });
                })
                .catch((err) => {
                    alert(`${err}`);
                    return [];
                });
        })
        .catch((err) => {
            alert(`${err}`);
            return [];
        });
};

init();
