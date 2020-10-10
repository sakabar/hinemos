import Handsontable from 'handsontable';
import 'handsontable.css';
const { Algorithm333, Algorithm444, } = require('cuberyl');
const rp = require('request-promise');
const config = require('./config');
const constant = require('./constant');
const threeStyleUtils = require('./threeStyleUtils');
const numberingUtils = require('./numberingUtils');
const utils = require('./utils');

const detectStickers = (part, bufferSticker, setup, move1, move2) => {
    try {
        if (part === constant.partType.corner) {
            const alg = (move1 === '' && move2 === '') ? new Algorithm333(setup) : Algorithm333.makeThreeStyle(setup, move1, move2);
            return alg.detectThreeStyleCornerStickers(bufferSticker);
        } else if (part === constant.partType.edgeMiddle) {
            const alg = (move1 === '' && move2 === '') ? new Algorithm333(setup) : Algorithm333.makeThreeStyle(setup, move1, move2);
            return alg.detectThreeStyleEdgeStickers(bufferSticker);
        } else if (part === constant.partType.edgeWing) {
            const alg = (move1 === '' && move2 === '') ? new Algorithm444(setup) : Algorithm444.makeThreeStyle(setup, move1, move2);
            return alg.detectThreeStyleWingEdgeStickers(bufferSticker);
        } else if (part === constant.partType.centerX) {
            const alg = (move1 === '' && move2 === '') ? new Algorithm444(setup) : Algorithm444.makeThreeStyle(setup, move1, move2);
            return alg.detectThreeStyleXCenterStickers(bufferSticker);
        } else if (part === constant.partType.centerT) {
            // throw new Error(`Unexpected part : ${JSON.stringify(part)}`);
            return [];
        } else {
            // throw new Error(`Unexpected part : ${JSON.stringify(part)}`);
            return [];
        }
    } catch {
        return [];
    }
};

const importThreeStyleTable = (hot, part, bufferSticker, origThreeStyles) => {
    // ダブルクリックによる誤作動を防ぐ
    const saveBtn = document.querySelector('.threeStyleImportForm__saveBtn');
    saveBtn.disabled = true;

    const token = localStorage.token;

    const colLn = hot.getDataAtRow(0).length;
    const rowLn = hot.getDataAtCol(0).length;

    const threeStyleTable = origThreeStyles.map(ts => {
        return {
            buffer: ts.buffer,
            sticker1: ts.sticker1,
            sticker2: ts.sticker2,
            setup: ts.setup,
            move1: ts.move1,
            move2: ts.move2,
            // FIXME これは上の引数から構築できるので、わざわざ構築して渡しているのがちょっと引っかかる
            shownMove: utils.showMove(ts.setup, ts.move1, ts.move2),
        };
    });

    for (let c = 0; c < colLn; c++) {
        for (let r = 0; r < rowLn; r++) {
            // バックスペースだけ押してセルを削除し、すぐに表の外にフォーカスを移した場合は
            // cellStrはnullになる
            const cellStr = hot.getDataAtCell(r, c) || '';

            let threeStyles = [];
            try {
                threeStyles = utils.readThreeStyles(cellStr, part);
            } catch (e) {
                // ignore error
            }

            // 空のセルに関してはpushしない
            for (let i = 0; i < threeStyles.length; i++) {
                const ts = threeStyles[i];

                const detectedStickers = detectStickers(part, bufferSticker, ts.setup, ts.move1, ts.move2);

                // 正常に処理できた場合は、要素はbuffer, sticker1, sticker2 の3つ
                if (detectedStickers.length !== 3) {
                    continue;
                }

                const instance = {
                    buffer: detectedStickers[0],
                    sticker1: detectedStickers[1],
                    sticker2: detectedStickers[2],
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

    return rp(options)
        .then((result) => {
            saveBtn.disabled = false;
            alert('インポートが完了しました');
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

    const saveBtn = document.querySelector('.threeStyleImportForm__saveBtn');
    saveBtn.disabled = true; // ロードが完了する前は押せないようにする

    const urlObj = new URL(location.href);

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

    const linkToAllAlgs = document.querySelector('.linkToAllAlgs');
    linkToAllAlgs.href = `problemListDetail.html?part=${part.name}&problemListId=null`;

    return numberingUtils.getNumbering(userName, part)
        .then((numbering) => {
            const bufferSticker = numbering.filter(numbering => numbering.letter === '@')[0].sticker;

            return threeStyleUtils.getThreeStyles(userName, part, bufferSticker)
                .then((threeStyles) => {
                    const container = document.querySelector('.viewThreeStyleImport__table');

                    // 巷の手順表がそのまま貼り付けられる程度に大きい必要がある
                    const height = 60;
                    const width = 60;

                    const data = [ ...Array(height).keys(), ].map(i => {
                        return [ ...Array(width).keys(), ].map(j => '');
                    });

                    const hot = new Handsontable(container, {
                        data,
                        licenseKey: 'non-commercial-and-evaluation',
                        rowHeaders: false,
                        colHeaders: false,
                    });

                    saveBtn.addEventListener('click', () => importThreeStyleTable(hot, part, bufferSticker, threeStyles));
                    saveBtn.disabled = false;
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
