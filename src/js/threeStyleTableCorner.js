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

            let threeStyleStr = '';
            if (threeStyle && threeStyle.length !== 0) {
                const setup = threeStyle[0].setup;
                const move1 = threeStyle[0].move1;
                const move2 = threeStyle[0].move2;

                threeStyleStr = utils.showMove(setup, move1, move2);
            }

            row.push(threeStyleStr);
        }

        ans.push(row);
    }

    return ans;
};

const init = () => {
    const userName = localStorage.userName;

    getCornerNumbering(userName)
        .then((numberingCorner) => {
            getThreeStyleCorners(userName)
                .then((threeStyleCorner) => {
                    const tableData = generateTableData(userName, numberingCorner, threeStyleCorner);

                    const container = document.querySelector('.viewThreeStyleTable__table');

                    const hot = new Handsontable(container, {
                        data: tableData,
                        rowHeaders: false,
                        colHeaders: false,
                        fixedColumnsLeft: 1,
                        fixedRowsTop: 1,
                        readonly: true,
                    });

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
                                            td.style.backgroundColor = '#e0ffff'; // 水色
                                        } else if (2.0 <= avgSec && avgSec < 2.5) {
                                            td.style.backgroundColor = '#f3f781'; // 薄い黄色
                                        } else if (2.5 <= avgSec && avgSec < 3.0) {
                                            td.style.backgroundColor = '#f3f781'; // 薄い黄色
                                        } else if (3.0 <= avgSec && avgSec < 4.0) {
                                            td.style.backgroundColor = '#ffff00'; // 黄色
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
