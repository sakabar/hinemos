const rp = require('request-promise');
const url = require('url');
const config = require('./config');
const constant = require('./constant');
const utils = require('./utils');
const threeStyleUtils = require('./threeStyleUtils');

// 3-style登録ページを開く
const openRegisterPage = (letters, part) => {
    window.open(`${config.urlRoot}/threeStyle/register.html?part=${part.name}&letters=${letters}`);
};

// threeStyleを削除する
const deleteThreeStyle = (id, part) => {
    const token = localStorage.token;
    const olNode = document.querySelector('.listThreeStyleForm__oList');

    if (!window.confirm('本当に削除しますか?')) {
        return;
    }

    const deleteOption = {
        url: `${config.apiRoot}/deleteThreeStyle/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            id,
            token,
        },
    };

    rp(deleteOption)
        .then(() => {
            const liNode = document.querySelector(`.listThreeStyleForm__oList__list--id${id}`);
            olNode.removeChild(liNode);
        })
        .catch(() => {
            alert('削除中に何らかのエラーが発生しました');
        });
};

// quizLogHash[stickers].solved -> 正解数
// quizLogHash[stickers].tried -> 最近で解いた問題数
// quizLogHash[stickers].avgSec -> 3-styleクイズのタイム
const getQuizLogHash = (quizLogRes) => {
    const ansHash = {};

    for (let i = 0; i < quizLogRes.length; i++) {
        const quizLog = quizLogRes[i];
        const stickers = quizLog.stickers;

        const obj = {
            solved: quizLog.solved,
            tried: quizLog.tried,
            avgSec: quizLog['avg_sec'],
        };

        ansHash[stickers] = obj;
    }

    return ansHash;
};

// threeStyleHash[stickers] -> 手順のリスト
const getThreeStyleHash = (threeStyles) => {
    const ansHash = {};

    for (let i = 0; i < threeStyles.length; i++) {
        const alg = threeStyles[i];

        const stickers = alg.stickers;
        if (stickers in ansHash) {
            ansHash[stickers].push(alg);
        } else {
            ansHash[stickers] = [ alg, ];
        }
    }

    return ansHash;
};

// タブを開きっぱなしの場合にも対応できるように、
// 検索ボタンを押した時に最新の情報を取得する
const submit = (part) => {
    const userName = localStorage.userName;

    const olNode = document.querySelector('.listThreeStyleForm__oList');
    // まずolNodeの要素を空に
    while (olNode.firstChild) {
        olNode.removeChild(olNode.firstChild);
    };

    const lettersText = document.querySelector('.listThreeStyleForm__lettersText');
    const inputLetters = lettersText.value;

    const elms = document.getElementsByName('listThreeStyleForm__radio');
    const checkedBtn = [ ...elms, ].find(elm => elm.checked);
    if (!checkedBtn) {
        // HTMLで最初から片方選択されており、チェックは外せないので、
        // どちらも選ばれていない状況は起こらないと思うが、念のため
        alert('前方/後方一致のどちらかを選んでください');
        return;
    }

    const searchCond = checkedBtn.value;

    const orderRadios = document.getElementsByName('listThreeStyleForm__radio--order');
    const checkedOrderBtn = [ ...orderRadios, ].find(elm => elm.checked);
    const order = checkedOrderBtn.value;

    // ナンバリング
    const numberingOptions = {
        url: `${config.apiRoot}/numbering/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(numberingOptions)
        .then((numberingResult) => {
            const numberings = numberingResult.success.result.sort((a, b) => { if (a.letter < b.letter) return -1; if (a.letter === b.letter) return 0; if (a.letter > b.letter) return 1; });

            if (numberings.length === 0) {
                alert('先にナンバリングを登録してください');
                return;
            }

            const buffer = numberings.filter(numbering => numbering.letter === '@').map(numbering => numbering.sticker)[0];

            // ありうる3-styleの文字 [{letters: 'あか', stickers: 'UBL UFR DFR'}]
            const allLetterPerms = [];

            for (let i = 0; i < numberings.length; i++) {
                const numbering1 = numberings[i];

                // バッファはスキップ
                if (numbering1.letter === '@') {
                    continue;
                }

                for (let k = 0; k < numberings.length; k++) {
                    const numbering2 = numberings[k];

                    // バッファはスキップ
                    if (numbering2.letter === '@') {
                        continue;
                    }

                    const sticker1 = numbering1.sticker;
                    const sticker2 = numbering2.sticker;

                    // 同じパーツの場合はスキップ
                    if (JSON.stringify(Array.from(sticker1).sort()) === JSON.stringify(Array.from(sticker2).sort())) {
                        continue;
                    }

                    const v = {
                        letters: `${numbering1.letter}${numbering2.letter}`,
                        stickers: `${buffer} ${sticker1} ${sticker2}`,
                    };

                    allLetterPerms.push(v);
                }
            }

            // 列挙した文字から、条件にマッチするもののみを抽出
            let selectedPerms = [];
            if (inputLetters === '') {
                selectedPerms = allLetterPerms;
            } else {
                if (searchCond === '後方一致') {
                    selectedPerms = allLetterPerms.filter(perm => perm.letters.endsWith(inputLetters));
                } else {
                    // 想定していない入力が入った場合は、前方一致として扱う
                    selectedPerms = allLetterPerms.filter(perm => perm.letters.startsWith(inputLetters));
                }
            }

            const threeStyleOptions = {
                url: `${config.apiRoot}/threeStyle/${part.name}?userName=${userName}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                json: true,
                form: {},
            };

            return rp(threeStyleOptions)
                .then((ans) => {
                    const threeStyles = ans.success.result;

                    return threeStyleUtils.getThreeStyleQuizLog(userName, part)
                        .then((quizLogRes) => {
                            // 何回も引くことになるのでハッシュ化
                            // quizLogHash[stickers].solved -> 正解数
                            // quizLogHash[stickers].tried -> 最近で解いた問題数
                            // quizLogHash[stickers].avgSec -> 3-styleクイズのタイム
                            const quizLogHash = getQuizLogHash(quizLogRes);

                            // 何回も引くことになるのでハッシュ化
                            // threeStyleHash[stickers] -> 手順のリスト
                            const threeStyleHash = getThreeStyleHash(threeStyles);

                            const lineObjList = []; // 1行で表示したい情報のリスト

                            for (let i = 0; i < selectedPerms.length; i++) {
                                const perm = selectedPerms[i];

                                if (perm.stickers in threeStyleHash) {
                                    // 結果がある場合は、それを表示
                                    const lst = threeStyleHash[perm.stickers];
                                    const quizLog = quizLogHash[perm.stickers];

                                    for (let k = 0; k < lst.length; k++) {
                                        const result = lst[k];
                                        const id = result.id;
                                        const buffer = result.buffer;
                                        const sticker1 = result.sticker1;
                                        const sticker2 = result.sticker2;
                                        const setup = result.setup;
                                        const move1 = result.move1;
                                        const move2 = result.move2;
                                        const moveStr = utils.showMove(setup, move1, move2);

                                        // 同じ文字に対して、複数の手順を登録してある場合には強調
                                        const dupMsg = lst.length > 1 ? '【重複】 ' : '';
                                        const letters = perm.letters;

                                        if (typeof quizLog === 'undefined') {
                                            const text = `${dupMsg}${letters} ${buffer} ${sticker1} ${sticker2} ${moveStr} 0/0 クイズ記録なし `;
                                            const obj = {
                                                registered: true,
                                                id,
                                                letters,
                                                solved: 0,
                                                tried: 0,
                                                avgSec: 0.0,
                                                text,
                                            };

                                            lineObjList.push(obj);
                                        } else {
                                            const text = `${dupMsg}${letters} ${buffer} ${sticker1} ${sticker2} ${moveStr} ${quizLog.solved}/${quizLog.tried} ${quizLog.avgSec.toFixed(2)}秒 `;
                                            const obj = {
                                                registered: true,
                                                id,
                                                letters,
                                                solved: quizLog.solved,
                                                tried: quizLog.tried,
                                                avgSec: quizLog.avgSec,
                                                text,
                                            };

                                            lineObjList.push(obj);
                                        }
                                    }
                                } else {
                                    const text = `${perm.letters} ${perm.stickers} 3-style未登録 `;
                                    const letters = perm.letters;
                                    const obj = {
                                        registered: false,
                                        letters,
                                        text,
                                    };

                                    lineObjList.push(obj);
                                }
                            }

                            // クイズの履歴に従ってソート
                            const useSortByQuizLog = order === '苦手順';

                            // FIXME ここのソートの順、APIと重複しているのでなんとかしたい
                            const sortedLineObjList = useSortByQuizLog ? lineObjList.sort((a, b) => (a.solved - b.solved) || -(a.tried - b.tried) || -(a.avgSec - b.avgSec)) : lineObjList;
                            for (let i = 0; i < sortedLineObjList.length; i++) {
                                const obj = sortedLineObjList[i];

                                if (obj.registered) {
                                    const liNode = document.createElement('li');
                                    const id = obj.id;
                                    liNode.className = `listThreeStyleForm__oList__list--id${id}`;

                                    const text = obj.text;
                                    const textNode = document.createTextNode(text);
                                    const btnNode = document.createElement('input');
                                    btnNode.type = 'button';
                                    btnNode.className = 'listThreeStyleForm__deleteBtn';
                                    btnNode.value = '削除';
                                    btnNode.style.borderColor = '#ff0000';
                                    btnNode.addEventListener('click', () => deleteThreeStyle(id, part));

                                    liNode.appendChild(textNode);
                                    liNode.appendChild(btnNode);
                                    olNode.appendChild(liNode);
                                } else {
                                    // 結果が無い場合は、登録するための表示
                                    const liNode = document.createElement('li');
                                    const text = obj.text;
                                    const textNode = document.createTextNode(text);
                                    const btnNode = document.createElement('input');
                                    btnNode.type = 'button';
                                    btnNode.className = 'listThreeStyleForm__registerBtn';
                                    btnNode.value = '登録';
                                    btnNode.style.borderColor = '#00ff00';
                                    btnNode.addEventListener('click', () => openRegisterPage(obj.letters, part));

                                    liNode.appendChild(textNode);
                                    liNode.appendChild(btnNode);
                                    olNode.appendChild(liNode);
                                }
                            }
                        })
                        .catch((err) => {
                            alert(`3-styleクイズ履歴の読み込み中にエラーが発生しました: ${err}`);
                        });
                })
                .catch((err) => {
                    alert(`3-style読み込み中にエラーが発生しました: ${err}`);
                });
        })
        .catch(() => {
            alert('ナンバリング読み込み中にエラーが発生しました');
        });
};

const init = () => {
    const submitBtn = document.querySelector('.listThreeStyleForm__submitBtn');
    const h2Part = document.querySelector('.h2__part');

    const urlObj = url.parse(location.href, true);

    // URLのオプションでpart=(corner|edgeMiddle)という形式で、パートが渡される
    // それ以外の場合はエラー
    const partQuery = urlObj.query.part;
    let part;
    if (partQuery === 'corner') {
        part = constant.partType.corner;
        h2Part.appendChild(document.createTextNode('コーナー'));
    } else if (partQuery === 'edgeMiddle') {
        part = constant.partType.edgeMiddle;
        h2Part.appendChild(document.createTextNode('エッジ'));
    } else {
        alert('URLが不正です: part=corner か part=edgeMiddle のどちらかを指定してください');
        return;
    }

    submitBtn.addEventListener('click', () => submit(part));
    // やりたいこと
    // 1. ひらがな1文字を入れる
    // 2. 前方 or 後方一致を選択
    // 3. Go
    // 4. 3-style一覧を表示
    // 5. 登録済の手順を削除 or 未登録の手順を登録
};

init();
