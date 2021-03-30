const _ = require('underscore');
const Cube = require('cubejs');
require('cubejs/lib/solve.js');
const shuffle = require('shuffle-array');
const config = require('./config');
const constant = require('./constant');
const rp = require('request-promise');
const threeStyleUtils = require('./threeStyleUtils');
const threeStyleQuizProblemListUtils = require('./threeStyleQuizProblemListUtils');
const utils = require('./utils');

// sticker1とsticker2のパーツを、若い順に並べる
// パーツを表す2(or 3)文字も、アルファベット順にソートする
const getPartPair = (sticker1, sticker2) => {
    const part1 = Array.from(sticker1).sort().join('');
    const part2 = Array.from(sticker2).sort().join('');

    return [ utils.strMin(part1, part2), utils.strMax(part1, part2), ];
};

const classifyWithPartPairs = (threeStyles) => {
    if (threeStyles.length === 0) {
        return {};
    }

    const ans = {};

    for (let i = 0; i < threeStyles.length; i++) {
        const threeStyle = threeStyles[i];
        const [ part1, part2, ] = getPartPair(threeStyle.sticker1, threeStyle.sticker2);

        if (part1 in ans) {
            if (part2 in ans[part1]) {
                ans[part1][part2].push(threeStyle);
            } else {
                ans[part1][part2] = [ threeStyle, ];
            }
        } else {
            ans[part1] = {};
            ans[part1][part2] = [ threeStyle, ];
        }
    }

    return ans;
};

// threeStyleの中から、以下の条件を満たすようにいくつかランダムに選ぶ
// 同じパーツが2回以上採用されない
// 登録済みの3-styleから選ばれる
// できるだけ多くの3-styleを選ぶ (n個選んだ後、まだ条件を満たすような選び方があるならば、停止せずに次を選ぶ)
// 必ず停止する
// 許容できる時間で停止する (曖昧...)
// appearOnceがtrueのとき、threeStyleGroupを破壊的に変更して、以降呼び出した時に同じ3-styleが出題されないようにする
// これはmutableなので、リファクタリング時などに注意すること
const pickThreeStyles = (threeStyleGroups, appearOnce = false) => {
    if (Object.keys(threeStyleGroups).length === 0) {
        return [];
    }

    // threeStyleGroupsの破壊が外側のthreeStyleGroupsに影響しないようにコピー
    // threeStyleGroupsは2次元連想配列で、単純に_.clone()すると深い部分の配列が参照渡しされてしまうので、
    // 丁寧にループでコピーを記述
    const threeStyleGroupsCopied = {};
    const ks1 = Object.keys(threeStyleGroups);
    for (let i = 0; i < ks1.length; i++) {
        const p1 = ks1[i];
        threeStyleGroupsCopied[p1] = _.clone(threeStyleGroups[p1]);
    }

    const ans = [];
    const delim = '-'; // 区切り文字。ステッカーに出てこない文字なら何でもいい

    // ペアを列挙 (`${part1}-${part2}` の形式に変形してからflatten)
    const pairs = Object.keys(threeStyleGroupsCopied).map(part1 => Object.keys(threeStyleGroupsCopied[part1]).map(part2 => `${part1}${delim}${part2}`));
    let flattenedPairs = pairs.reduce((acc, val) => acc.concat(val), []);

    while (flattenedPairs.length > 0) {
        // キーの中からランダムに1つ選ぶ
        const [ part1, part2, ] = shuffle.pick(flattenedPairs).split(delim);
        const pickedThreeStyle = shuffle.pick(threeStyleGroupsCopied[part1][part2]);
        ans.push(pickedThreeStyle);

        // 選んだkeyを削除
        delete threeStyleGroupsCopied[part1];
        delete threeStyleGroupsCopied[part2];
        // *-part1 か *-part2
        const ks = Object.keys(threeStyleGroupsCopied);
        for (let i = 0; i < ks.length; i++) {
            const tmpPart = ks[i];
            delete threeStyleGroupsCopied[tmpPart][part1];
            delete threeStyleGroupsCopied[tmpPart][part2];
        }

        // appearOnce が true の場合は外側のthreeStyleGroupsから、使った3-styleを削除
        if (appearOnce) {
            threeStyleGroups[part1][part2] = threeStyleGroups[part1][part2].filter(x => x !== pickedThreeStyle);
            if (threeStyleGroups[part1][part2].length === 0) {
                delete threeStyleGroups[part1][part2];
            }
        }

        const pairs = Object.keys(threeStyleGroupsCopied).map(part1 => Object.keys(threeStyleGroupsCopied[part1]).map(part2 => `${part1}${delim}${part2}`));

        // 削除後のkeysを反映
        flattenedPairs = pairs.reduce((acc, val) => acc.concat(val), []);
    }

    return ans;
};

// コーナーかエッジの3-styleグループを渡し、その中からランダムに3-styleを選び、それらを使うスクランブルを生成
const getThreeStyleScramble = (threeStyleGroups, appearOnce = false) => {
    // 逆順にして1つずつ処理
    // 例: "さみ あか たに"をやりたい -> 完成状態から inv(たに) inv(あか) inv(さみ) で崩す手順を返す

    // 実際に解きたい3-style (やる順)
    const pickedThreeStyles = pickThreeStyles(threeStyleGroups, appearOnce);

    // 逆順に処理
    const pickedThreeStylesRev = pickedThreeStyles.reverse();

    // 逆手順を列挙してつなげる
    return pickedThreeStylesRev.map((ts) => utils.inverse(utils.expandMove(ts.setup, ts.move1, ts.move2))).join(' ');
};

// コーナーかエッジのランダムスクランブル
// EOやCOが発生する可能性がある
// 「良い」ランダムであることは保証しない
const getRandomScramble = (partType) => {
    let basicScramble = '';
    if (partType === constant.partType.corner) {
        // UBL UBR LBD
        // [U, R D\' R\']
        basicScramble = 'U R D\' R\' U\' R D R\'';
    } else if (partType === constant.partType.edgeMiddle) {
        // DF RU UL
        // [R' F' R, S]
        basicScramble = 'R\' F\' R S R\' F R S\'';
    }

    const ansList = [];
    const xyzList = []; // 持ち替えた方向を記録しておき、最後に元に戻す

    const CNT = 100;
    const XYZ_CNT = 10;
    for (let i = 0; i < CNT; i++) {
        for (let k = 0; k < XYZ_CNT; k++) {
            // 適当に向きを変える
            const xyz = shuffle.pick([ 'x', 'y', 'z', ]);
            ansList.push(xyz);
            xyzList.push(xyz);
        }

        // 崩す
        ansList.push(basicScramble);
    }

    // 持ち替えを元に戻す
    const xyzListRev = xyzList.reverse();
    for (let i = 0; i < xyzList.length; i++) {
        const xyz = xyzListRev[i];
        ansList.push(`${xyz}'`);
    }

    return ansList.join(' ');
};

const getSingleScramble = (scrambleTypeCorner, scrambleTypeEdge, threeStyleGroupsCorner, threeStyleGroupsEdgeMiddle, appearOnce = false) => {
    const cube = new Cube();

    // コーナーを崩す
    switch (scrambleTypeCorner) {
    case scrambleType.threeStyle:
        // fall through
    case scrambleType.threeStyleList:
        cube.move(utils.big2Small(getThreeStyleScramble(threeStyleGroupsCorner, appearOnce)));
        break;
    case scrambleType.random:
        cube.move(utils.big2Small(getRandomScramble(constant.partType.corner)));
        break;
    case scrambleType.none:
        // 何もしない
        break;
    default:
        throw new Error('Unexpected scrambleType corner');
    }

    // エッジを崩す
    switch (scrambleTypeEdge) {
    case scrambleType.threeStyle:
        // fall through
    case scrambleType.threeStyleList:
        cube.move(utils.big2Small(getThreeStyleScramble(threeStyleGroupsEdgeMiddle, appearOnce)));
        break;
    case scrambleType.random:
        cube.move(utils.big2Small(getRandomScramble(constant.partType.edgeMiddle)));
        break;
    case scrambleType.none:
        // 何もしない
        break;
    default:
        throw new Error('Unexpected scrambleType edge');
    }

    // 解いて、その逆順を得る
    const ansMoves = cube.solve();
    return utils.inverse(ansMoves);
};

// appearOnce: 同じ3-style手順が複数のスクランブル中で1回だけしか出現しないようにする
const getScrambles = (cnt, scrambleTypeCorner, scrambleTypeEdge, threeStylesCorner, threeStylesEdgeMiddle, appearOnce = false) => {
    const ans = [];

    const threeStyleGroupsCorner = classifyWithPartPairs(threeStylesCorner);
    const threeStyleGroupsEdgeMiddle = classifyWithPartPairs(threeStylesEdgeMiddle);

    for (let i = 0; i < cnt; i++) {
        const scramble = getSingleScramble(scrambleTypeCorner, scrambleTypeEdge, threeStyleGroupsCorner, threeStyleGroupsEdgeMiddle, appearOnce);
        ans.push(scramble);
    }

    return ans;
};

const scrambleType = {
    threeStyle: { value: 0, name: 'threeStyle', },
    threeStyleList: { value: 1, name: 'threeStyleList', },
    random: { value: 2, name: 'random', },
    none: { value: 3, name: 'none', },
    threeStyleListName: { value: 4, name: 'threeStyleListName', },
};

const readScrambleType = (s) => {
    if (s.startsWith('threeStyleListName')) {
        return scrambleType.threeStyleListName;
    }

    switch (s) {
    case 'threeStyle':
        return scrambleType.threeStyle;
    case 'threeStyleList':
        return scrambleType.threeStyleList;
    case 'random':
        return scrambleType.random;
    case 'none':
        return scrambleType.none;
    default:
        throw new Error('Unexpected scrambleType corner');
    }
};

const submit = (threeStylesCorner, threeStylesEdgeMiddle, threeStyleQuizListCorner, threeStyleQuizListEdgeMiddle) => {
    const numText = document.querySelector('.scramblerForm__numText');
    const selectCorner = document.querySelector('.scrambleTypeSelect--corner');
    const selectEdge = document.querySelector('.scrambleTypeSelect--edgeMiddle');

    const appearOnceBox = document.querySelector('.scrambleForm__appearOnceBox');
    const appearOnce = appearOnceBox.checked;

    let scrambleTypeCorner = readScrambleType(selectCorner.value);
    let scrambleTypeEdgeMiddle = readScrambleType(selectEdge.value);

    const tmpCnt = parseInt(numText.value);
    let cnt = 12; // デフォルト値は12とする (ao12を計るため)
    if (tmpCnt <= 0) {
        alert('スクランブル数は正の数にしてください');
        return;
    } else if (tmpCnt > 100) {
        alert('スクランブル数は100以下にしてください');
        return;
    } else if (isNaN(tmpCnt)) {
        numText.value = '';
    } else {
        cnt = tmpCnt;
    }

    // threeStyleListNameの時は、引数のthreeStyleListCornerやthreeStyleListEdgeMiddleをそのリストの内容で上書きする
    const cornerPromise = (() => {
        if (scrambleTypeCorner === scrambleType.threeStyleListName) {
            const problemListCornerId = parseInt(selectCorner.value.split('-')[1]);
            return threeStyleQuizProblemListUtils.requestGetThreeStyleQuizProblemListDetail(constant.partType.corner, problemListCornerId)
                .then(ans => {
                    return ans.result;
                });
        } else {
            return Promise.resolve(threeStyleQuizListCorner);
        }
    })();

    const edgePromise = (() => {
        if (scrambleTypeEdgeMiddle === scrambleType.threeStyleListName) {
            const problemListEdgeMiddleId = parseInt(selectEdge.value.split('-')[1]);
            return threeStyleQuizProblemListUtils.requestGetThreeStyleQuizProblemListDetail(constant.partType.edgeMiddle, problemListEdgeMiddleId)
                .then(ans => {
                    return ans.result;
                });
        } else {
            return Promise.resolve(threeStyleQuizListEdgeMiddle);
        }
    })();

    // 3-style (問題リスト) が選ばれている場合、ここで登録済の3-styleを問題リストに登録されているものだけに絞り込んでおく
    return cornerPromise
        .then(threeStyleQuizListCorner => {
            if (scrambleTypeCorner === scrambleType.threeStyleListName) {
                scrambleTypeCorner = scrambleType.threeStyleList;
            }

            const threeStyleQuizListCornerStickers = threeStyleQuizListCorner.map(x => x.stickers);
            const filteredThreeStylesCorner = scrambleTypeCorner === scrambleType.threeStyleList ? threeStylesCorner.filter(x => threeStyleQuizListCornerStickers.includes(x.stickers)) : threeStylesCorner;

            return edgePromise
                .then(threeStyleQuizListEdgeMiddle => {
                    if (scrambleTypeEdgeMiddle === scrambleType.threeStyleListName) {
                        scrambleTypeEdgeMiddle = scrambleType.threeStyleList;
                    }

                    const threeStyleQuizListEdgeMiddleStickers = threeStyleQuizListEdgeMiddle.map(x => x.stickers);
                    const filteredThreeStylesEdgeMiddle = scrambleTypeEdgeMiddle === scrambleType.threeStyleList ? threeStylesEdgeMiddle.filter(x => threeStyleQuizListEdgeMiddleStickers.includes(x.stickers)) : threeStylesEdgeMiddle;

                    const scrambles = getScrambles(cnt, scrambleTypeCorner, scrambleTypeEdgeMiddle, filteredThreeStylesCorner, filteredThreeStylesEdgeMiddle, appearOnce);

                    // まず消す
                    const scramblesContainer = document.querySelector('.scrambles');
                    while (scramblesContainer.firstChild) {
                        scramblesContainer.removeChild(scramblesContainer.firstChild);
                    };

                    // ノードに追加
                    for (let i = 0; i < scrambles.length; i++) {
                        const scramble = scrambles[i];
                        const scrambleNode = document.createElement('li');
                        scrambleNode.appendChild(document.createTextNode(scramble));
                        scramblesContainer.appendChild(scrambleNode);
                    }
                })
                .catch((err) => {
                    alert(`エラー:${err}`);
                });
        })
        .catch((err) => {
            alert(`エラー:${err}`);
        });
};

const init = () => {
    const userName = localStorage.userName;
    const button = document.querySelector('.scrambleForm__submitBtn');
    const cornerSelectNode = document.querySelector('.scrambleTypeSelect--corner');
    const edgeSelectNode = document.querySelector('.scrambleTypeSelect--edgeMiddle');

    // 以下は、テストの時には実行しない
    if (!button) {
        return;
    }

    Cube.initSolver();

    // 現在のバッファの手順のみを使うために、ナンバリングを取得
    const numberingCornerOptions = {
        url: `${config.apiRoot}/numbering/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    const numberingEdgeMiddleOptions = {
        url: `${config.apiRoot}/numbering/edgeMiddle/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    const copyBtn = document.querySelector('.scrambleForm__copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const scramblesOlTag = document.querySelector('.scrambles');
            const scrambleCnt = scramblesOlTag.children.length;

            if (scrambleCnt === 0) {
                return;
            }

            let scrambleText = '';
            for (let i = 0; i < scramblesOlTag.children.length; i++) {
                scrambleText += scramblesOlTag.children[i].textContent + '\n';
            }

            const toBeCopied = confirm(`以下のスクランブルをコピーしますか?\n${scrambleText}`);
            if (toBeCopied) {
                const textArea = document.createElement('textarea');
                document.body.appendChild(textArea);
                textArea.value = scrambleText;
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        });
    }

    return rp(numberingCornerOptions)
        .then((numberingCorner) => {
            const cornerBufferSticker = numberingCorner.success.result.filter(a => a.letter === '@')[0].sticker;

            return rp(numberingEdgeMiddleOptions)
                .then((numberingEdgeMiddle) => {
                    const edgeMiddleBufferSticker = numberingEdgeMiddle.success.result.filter(a => a.letter === '@')[0].sticker;

                    return threeStyleUtils.getThreeStyles(userName, constant.partType.corner, cornerBufferSticker)
                        .then((allThreeStylesCorner) => {
                            const threeStylesCorner = allThreeStylesCorner.filter(a => a.buffer === cornerBufferSticker);

                            return threeStyleUtils.getThreeStyles(userName, constant.partType.edgeMiddle, edgeMiddleBufferSticker)
                                .then((allThreeStylesEdgeMiddle) => {
                                    const threeStylesEdgeMiddle = allThreeStylesEdgeMiddle.filter(a => a.buffer === edgeMiddleBufferSticker);

                                    return threeStyleUtils.getThreeStyleQuizList(userName, constant.partType.corner)
                                        .then((allThreeStyleQuizListCorner) => {
                                            const threeStyleQuizListCorner = allThreeStyleQuizListCorner.filter(a => a.buffer === cornerBufferSticker);

                                            return threeStyleUtils.getThreeStyleQuizList(userName, constant.partType.edgeMiddle)
                                                .then((allThreeStyleQuizListEdgeMiddle) => {
                                                    const threeStyleQuizListEdgeMiddle = allThreeStyleQuizListEdgeMiddle.filter(a => a.buffer === edgeMiddleBufferSticker);

                                                    return threeStyleQuizProblemListUtils.requestGetThreeStyleQuizProblemList(constant.partType.corner)
                                                        .then((tmpProblemListNamesCorner) => {
                                                            const problemListNamesCorner = tmpProblemListNamesCorner.success.result;

                                                            for (let i = 0; i < problemListNamesCorner.length; i++) {
                                                                const problemListNameCorner = problemListNamesCorner[i];

                                                                const optionNode = document.createElement('option');
                                                                optionNode.appendChild(document.createTextNode(problemListNameCorner.title));
                                                                optionNode.value = `threeStyleListName-${problemListNameCorner.problemListId}`;
                                                                cornerSelectNode.appendChild(optionNode);
                                                            }

                                                            return threeStyleQuizProblemListUtils.requestGetThreeStyleQuizProblemList(constant.partType.edgeMiddle)
                                                                .then((tmpProblemListNamesEdgeMiddle) => {
                                                                    const problemListNamesEdgeMiddle = tmpProblemListNamesEdgeMiddle.success.result;

                                                                    for (let i = 0; i < problemListNamesEdgeMiddle.length; i++) {
                                                                        const problemListNameEdgeMiddle = problemListNamesEdgeMiddle[i];

                                                                        const optionNode = document.createElement('option');
                                                                        optionNode.appendChild(document.createTextNode(problemListNameEdgeMiddle.title));
                                                                        optionNode.value = `threeStyleListName-${problemListNameEdgeMiddle.problemListId}`;
                                                                        edgeSelectNode.appendChild(optionNode);
                                                                    }

                                                                    button.addEventListener('click', () => submit(threeStylesCorner, threeStylesEdgeMiddle, threeStyleQuizListCorner, threeStyleQuizListEdgeMiddle));
                                                                    button.disabled = false;
                                                                    copyBtn.disabled = false;
                                                                })
                                                                .catch((err) => {
                                                                    alert(`エラー:${err}`);
                                                                });
                                                        })
                                                        .catch((err) => {
                                                            alert(`エラー:${err}`);
                                                        });
                                                })
                                                .catch((err) => {
                                                    alert(`エラー:${err}`);
                                                });
                                        })
                                        .catch((err) => {
                                            alert(`エラー:${err}`);
                                        });
                                })
                                .catch((err) => {
                                    alert(`エラー:${err}`);
                                });
                        })
                        .catch((err) => {
                            alert(`エラー:${err}`);
                        });
                })
                .catch((err) => {
                    alert(`エラー:${err}`);
                });
        })
        .catch((err) => {
            alert(`エラー:${err}`);
        });
};

init();

exports.getPartPair = getPartPair;
exports.classifyWithPartPairs = classifyWithPartPairs;
exports.pickThreeStyles = pickThreeStyles;
