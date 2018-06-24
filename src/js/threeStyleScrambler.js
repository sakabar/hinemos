const _ = require('underscore');
const Cube = require('cubejs');
require('cubejs/lib/solve.js');
const shuffle = require('shuffle-array');
const constant = require('./constant');
const threeStyleUtils = require('./threeStyleUtils');
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
const pickThreeStyles = (threeStyleGroups) => {
    if (Object.keys(threeStyleGroups).length === 0) {
        return [];
    }

    const ans = [];
    const delim = '-'; // 区切り文字。ステッカーに出てこない文字なら何でもいい

    // ペアを列挙 (`${part1}-${part2}` の形式に変形してからflatten)
    const pairs = Object.keys(threeStyleGroups).map(part1 => Object.keys(threeStyleGroups[part1]).map(part2 => `${part1}${delim}${part2}`));
    let flattenedPairs = pairs.reduce((acc, val) => acc.concat(val), []);

    while (flattenedPairs.length > 0) {
        // キーの中からランダムに1つ選ぶ
        const [ part1, part2, ] = shuffle.pick(flattenedPairs).split(delim);
        const pickedThreeStyle = shuffle.pick(threeStyleGroups[part1][part2]);
        ans.push(pickedThreeStyle);

        // 選んだkeyを削除
        delete threeStyleGroups[part1];
        delete threeStyleGroups[part2];
        // *-part1 か *-part2
        const ks = Object.keys(threeStyleGroups);
        for (let i = 0; i < ks.length; i++) {
            const key1 = ks[i];
            delete threeStyleGroups[key1][part1];
            delete threeStyleGroups[key1][part2];
        }

        const pairs = Object.keys(threeStyleGroups).map(part1 => Object.keys(threeStyleGroups[part1]).map(part2 => `${part1}${delim}${part2}`));

        // 削除後のkeysを反映
        flattenedPairs = pairs.reduce((acc, val) => acc.concat(val), []);
    }

    return ans;
};

// コーナーかエッジの3-styleグループを渡し、その中からランダムに3-styleを選び、それらを使うスクランブルを生成
const getThreeStyleScramble = (threeStyleGroups) => {
    // 逆順にして1つずつ処理
    // 例: "さみ あか たに"をやりたい -> 完成状態から inv(たに) inv(あか) inv(さみ) で崩す手順を返す

    // 実際に解きたい3-style (やる順)
    const pickedThreeStyles = pickThreeStyles(threeStyleGroups);

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

const getSingleScramble = (scrambleTypeCorner, scrambleTypeEdge, threeStyleGroupsCorner, threeStyleGroupsEdgeMiddle) => {
    const cube = new Cube();

    // コーナーを崩す
    switch (scrambleTypeCorner) {
    case scrambleType.threeStyle:
        cube.move(utils.big2Small(getThreeStyleScramble(threeStyleGroupsCorner)));
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
        cube.move(utils.big2Small(getThreeStyleScramble(threeStyleGroupsEdgeMiddle)));
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

const getScrambles = (cnt, scrambleTypeCorner, scrambleTypeEdge, threeStylesCorner, threeStylesEdgeMiddle) => {
    const ans = [];

    const threeStyleGroupsCorner = classifyWithPartPairs(threeStylesCorner);
    const threeStyleGroupsEdgeMiddle = classifyWithPartPairs(threeStylesEdgeMiddle);

    for (let i = 0; i < cnt; i++) {
        const scramble = getSingleScramble(scrambleTypeCorner, scrambleTypeEdge, _.clone(threeStyleGroupsCorner), _.clone(threeStyleGroupsEdgeMiddle));
        ans.push(scramble);
    }

    return ans;
};

const scrambleType = {
    threeStyle: { value: 0, name: 'threeStyle', },
    random: { value: 1, name: 'random', },
    none: { value: 2, name: 'none', },
};

const readScrambleType = (s) => {
    switch (s) {
    case 'threeStyle':
        return scrambleType.threeStyle;
    case 'random':
        return scrambleType.random;
    case 'none':
        return scrambleType.none;
    default:
        throw new Error('Unexpected scrambleType corner');
    }
};

const submit = (threeStylesCorner, threeStylesEdgeMiddle) => {
    const numText = document.querySelector('.scramblerForm__numText');
    const selectCorner = document.querySelector('.scrambleTypeSelect--corner');
    const selectEdge = document.querySelector('.scrambleTypeSelect--edgeMiddle');

    const scrambleTypeCorner = readScrambleType(selectCorner.value);
    const scrambleTypeEdge = readScrambleType(selectEdge.value);

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

    const scrambles = getScrambles(cnt, scrambleTypeCorner, scrambleTypeEdge, threeStylesCorner, threeStylesEdgeMiddle);

    // まず消す
    const scramblesContainer = document.querySelector('.scrambles');
    while (scramblesContainer.firstChild) {
        scramblesContainer.removeChild(scramblesContainer.firstChild);
    };

    // ノードに追加
    for (let i = 0; i < scrambles.length; i++) {
        const scramble = scrambles[i];
        const pTag = document.createElement('p');
        pTag.appendChild(document.createTextNode(scramble));
        scramblesContainer.appendChild(pTag);
    }
};

const init = () => {
    const userName = localStorage.userName;
    const button = document.querySelector('.scrambleForm__submitBtn');

    // 以下は、テストの時には実行しない
    if (!button) {
        return;
    }

    Cube.initSolver();

    return threeStyleUtils.getThreeStyles(userName, constant.partType.corner)
        .then((threeStylesCorner) => {
            return threeStyleUtils.getThreeStyles(userName, constant.partType.edgeMiddle)
                .then((threeStylesEdgeMiddle) => {
                    button.addEventListener('click', () => submit(threeStylesCorner, threeStylesEdgeMiddle));
                    button.disabled = false;
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
