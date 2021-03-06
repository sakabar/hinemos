const _ = require('lodash');
const { MinPriorityQueue, } = require('@datastructures-js/priority-queue');
const { Matrix, } = require('ml-matrix');
const { agnes, } = require('ml-hclust');
const fmcchecker = require('./fmcchecker');

export const getMoveLayer = (move) => {
    if (move.slice(-1) === '2' || move.slice(-1) === '\'') {
        return move.slice(0, -1);
    }

    return move;
};

export const isSameLayerMove = (move1, move2) => {
    return getMoveLayer(move1) === getMoveLayer(move2);
};

export const distanceSeq = (seq1, seq2) => {
    if (_.isEqual(seq1, seq2)) {
        return 0.0;
    }

    if (seq1.length === 0) {
        return seq2.length;
    };

    if (seq2.length === 0) {
        return seq1.length;
    }

    const fstMove1 = seq1[0];
    const fstMove2 = seq2[0];

    if (fstMove1 === fstMove2) {
        return 0.0 + distanceSeq(seq1.slice(1), seq2.slice(1));
    }

    if (isSameLayerMove(fstMove1, fstMove2)) {
        return 0.5 + distanceSeq(seq1.slice(1), seq2.slice(1));
    }

    return 1.0 + distanceSeq(seq1.slice(1), seq2.slice(1));
};

export const inverse = (inputSeq) => {
    const seq = inputSeq.slice();

    if (seq.length === 0) {
        return [];
    }

    const fst = seq[0];

    if (fst === '') {
        return inverse(seq.slice(1)).concat([ '', ]);
    }

    if (fst.slice(-1) === '\'') {
        const inv = fst.slice(0, -1);
        return inverse(seq.slice(1)).concat([ inv, ]);
    }

    if (fst.slice(-1) === '2') {
        return inverse(seq.slice(1)).concat([ fst, ]);
    }

    const inv = `${fst}'`;
    return inverse(seq.slice(1)).concat([ inv, ]);
};

const countQuaterTurns = (move) => {
    if (move.slice(-1) === '2') {
        return 2;
    }

    if (move.slice(-1) === '\'') {
        return 3;
    }

    return 1;
};

export const simplifyTwoMoves = (move1, move2) => {
    const move1Layer = getMoveLayer(move1);
    const move2Layer = getMoveLayer(move2);

    if (move1Layer !== move2Layer) {
        return [ move1, move2, ];
    }

    const move1Quaters = countQuaterTurns(move1);
    const move2Quaters = countQuaterTurns(move2);

    const nextQuaters = (move1Quaters + move2Quaters) % 4;

    if (nextQuaters === 0) {
        return [];
    }

    if (nextQuaters === 1) {
        return [ move1Layer, ];
    }

    if (nextQuaters === 2) {
        return [ `${move1Layer}2`, ];
    }
    if (nextQuaters === 3) {
        return [ `${move1Layer}'`, ];
    }
};

export const simplifySeq = (inputSeq) => {
    const seq = inputSeq.slice();

    if (seq.length === 1) {
        return seq;
    }

    const ans = [];
    let prev = null;

    for (let i = 0; i < seq.length; i++) {
        const currentMove = seq[i];

        if (prev === null) {
            prev = currentMove;
            continue;
        }

        if (getMoveLayer(prev) === getMoveLayer(currentMove)) {
            const simplified = simplifyTwoMoves(prev, currentMove);

            if (simplified.length === 0) {
                prev = null;
            } else {
                // 前提として回転が同じなので、simplified.length === 1のはず
                prev = simplified[0];
            }
        } else {
            ans.push(prev);
            prev = currentMove;
        }
    }

    if (prev !== null) {
        ans.push(prev);
    }

    return ans;
};

// 因数分解できた場合は { setup, interchange, insert, isInterchangeFirst }を返す
// 因数分解できなかった場合は null
export const factorizeRec = (inputRestSeq, inputSetupSeq) => {
    const setupSeq = inputSetupSeq.slice();
    const restSeq = inputRestSeq.slice();

    const fstMove = restSeq[0];

    // setupで括れる場合はできるだけ括る
    if (restSeq.length >= 2 && getMoveLayer(fstMove) === getMoveLayer(restSeq.slice(-1)[0])) {
        setupSeq.push(fstMove);

        const unsimplifiedAnsRestSeq = restSeq.slice(1);
        unsimplifiedAnsRestSeq.push(fstMove);

        const ansRestSeq = simplifySeq(unsimplifiedAnsRestSeq);

        return factorizeRec(ansRestSeq, setupSeq);
    }

    // interchangeとinsertの区切れ目を探す
    if (restSeq.length % 2 !== 0) {
        return null;
    }

    const halfLength = restSeq.length / 2;

    for (let sndInd = 1; sndInd < restSeq.length; sndInd++) {
        const fst = restSeq.slice(0, sndInd);
        const snd = restSeq.slice(sndInd, halfLength);

        // A B A' B'
        const candSeq = fst
            .concat(snd)
            .concat(inverse(fst))
            .concat(inverse(snd));

        if (_.isEqual(simplifySeq(candSeq), simplifySeq(restSeq)) && (fst.length === 1 || snd.length === 1)) {
            let interchange;
            let insert;
            let isInterchangeFirst;
            if (fst.length === 1) {
                interchange = fst;
                insert = snd;
                isInterchangeFirst = true;
            } else {
                interchange = snd;
                insert = fst;
                isInterchangeFirst = false;
            }

            return {
                setup: setupSeq,
                interchange,
                insert,
                isInterchangeFirst,
            };
        }
    }

    return null;
};

export const factorize = (inputSeq) => {
    const seq = inputSeq.slice();

    return factorizeRec(seq, []);
};

export const getSequence = (setup, interchange, insert, isInterchangeFirst, convertWideMove = false) => {
    const pure = (() => {
        if (isInterchangeFirst) {
            return interchange
                .concat(insert)
                .concat(inverse(interchange))
                .concat(inverse(insert));
        } else {
            return insert
                .concat(interchange)
                .concat(inverse(insert))
                .concat(inverse(interchange));
        }
    })();

    // セットアップまで変換してしまうと手順全体が変わってしまい親子関係を取得できなくなるので困る
    // (A B A' B)の固まりを変換することで、発生した持ち替えが打ち消されるので、
    // セットアップは変換せずに付け足してOK
    const ans = (() => {
        if (convertWideMove) {
            return setup
                .concat(fmcchecker.convAlg(pure.join(' ')).split(' '))
                .concat(inverse(setup));
        } else {
            return setup
                .concat(pure)
                .concat(inverse(setup));
        }
    })();

    return ans
        .map(s => s.replace(/'2/g, '2'))
        .filter(s => s !== '');
};

// 因数分解を試してみて、ダメならisFactorizedをfalseにしつつ受け取ったものをそのままセット
// convertWideMove : 2層回しを変換して処理するかどうか
// 3x3の場合はtrueでよいが、多分割キューブにはアルゴリズムが対応していないので、デフォルトはfalse
export function Alg (arg, convertWideMove = false) {
    // R'2のような表記は同じはずの手順を区別してしまうので消す
    // あと空文字列
    if (arg.setup) {
        arg.setup = arg.setup
            .map(s => s.replace(/'2/g, '2'))
            .filter(s => s !== '');
    }
    if (arg.interchange) {
        arg.interchange = arg.interchange
            .map(s => s.replace(/'2/g, '2'))
            .filter(s => s !== '');
    }
    if (arg.insert) {
        arg.insert = arg.insert
            .map(s => s.replace(/'2/g, '2'))
            .filter(s => s !== '');
    }
    if (arg.sequence) {
        arg.sequence = arg.sequence
            .map(s => s.replace(/'2/g, '2'))
            .filter(s => s !== '');
    }

    this.letters = arg.letters;

    const unsimplifiedSequence = arg.isSequence ? arg.sequence : getSequence(arg.setup, arg.interchange, arg.insert, arg.isInterchangeFirst, convertWideMove);
    const sequence = simplifySeq(unsimplifiedSequence);
    const factorized = factorize(sequence);

    if (factorized === null) {
        // もし入力が因数分解された形だった場合はそれに従う
        // [R2: [R2 D R2 D' R2, U]] のような、キャンセルされて消えるセットアップを持つ場合は、今の実装では因数分解できない
        if (arg.isSequence) {
            this.setup = [];
            this.revSetup = [];
            this.interchange = [];
            this.insert = [];
            this.isInterchangeFirst = false;
            this.isFactorized = false;
            this.sequence = sequence;
            return;
        } else {
            this.setup = arg.setup;
            this.revSetup = arg.setup.slice().reverse();
            this.interchange = arg.interchange;
            this.insert = arg.insert;
            this.isInterchangeFirst = arg.isInterchangeFirst;
            this.isFactorized = true;
            this.sequence = sequence;
            return;
        }
    }

    this.setup = factorized.setup;
    this.revSetup = factorized.setup.slice().reverse();
    this.interchange = factorized.interchange;
    this.insert = factorized.insert;
    this.isInterchangeFirst = factorized.isInterchangeFirst;
    this.isFactorized = true;
    this.sequence = simplifySeq(sequence);
}

export const distanceAlg = (x, y) => {
    if (!x.isFactorized || !y.isFactorized) {
        return distanceSeq(x.sequence, y.sequence);
    }

    const setupDistance = distanceSeq(x.revSetup, y.revSetup);
    const interchangeDistance = distanceSeq(x.interchange, y.interchange);
    const insertDistance = distanceSeq(x.insert, y.insert);

    // xor
    const swapDistance = (x.isInterchangeFirst ^ y.isInterchangeFirst) ? 0.25 : 0.0;

    return (setupDistance * 2) + interchangeDistance + insertDistance + swapDistance;
};

const makeDictKey = (alg) => {
    let move1;
    let move2;

    if (alg.isInterchangeFirst) {
        move1 = alg.interchange;
        move2 = alg.insert;
    } else {
        move1 = alg.insert;
        move2 = alg.interchange;
    }

    const pair = `${move1.join(' ')},${move2.join(' ')}`;
    return pair;
};

export const extractBasicAlgs = (inputAlgs) => {
    const algs = inputAlgs.slice();

    const basicAlgs = [];
    const similarAlgsDict = {};

    // 簡単な手順が前に来るようにソート
    const sortedAlgs = algs.sort((a, b) => {
        if (a.sequence.length < b.sequence.length) return -1;
        if (a.sequence.length === b.sequence.length) {
            // isFactorizedの降順
            if (a.isFactorized > b.isFactorized) return -1;
            if (a.isFactorized === b.isFactorized) {
                if (a.letters < b.letters) return -1;
                if (a.letters === b.letters) return 0;
                if (a.letters > b.letters) return 1;
            }
            if (a.isFactorized < b.isFactorized) return 1;
        }
        if (a.sequence.length > b.sequence.length) return 1;
    });

    for (let i = 0; i < sortedAlgs.length; i++) {
        const alg = sortedAlgs[i];

        // is_sequenceのときはセットアップ手順は無いはず
        if (!alg.isFactorized) {
            basicAlgs.push(alg);
            continue;
        }

        const pair = makeDictKey(alg);

        const setupPair = {
            setup: alg.setup.join(' '),
            revSetup: alg.revSetup.join(' '),
            setupMoveCnt: alg.setup.length,
            alg,
        };

        if (pair in similarAlgsDict) {
            similarAlgsDict[pair].push(setupPair);
        } else {
            // pure-algが手順中に存在しない場合がある。たとえばcorner「あか」
            // なので、「setup===[] (つまりpure)ならばcorner_dataに足す」だと
            // 取りこぼしが発生する

            similarAlgsDict[pair] = [ setupPair, ];
            basicAlgs.push(alg);
        }
    }

    // それぞれのsetup_dictがセットアップが短い順に並ぶようにソート
    const keys = Object.keys(similarAlgsDict);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        similarAlgsDict[key].sort((a, b) => {
            if (a.setupMoveCnt < b.setupMoveCnt) return -1;
            if (a.setupMoveCnt === b.setupMoveCnt) {
                if (a.setup < b.setup) return -1;
                if (a.setup === b.setup) return 0;
                if (a.setup > b.setup) return 1;
            }
            if (a.setupMoveCnt > b.setupMoveCnt) return 1;
        });
    }

    // console.log(basicAlgs);
    // console.log(similarAlgsDict);

    return {
        basicAlgs,
        similarAlgsDict,
    };
};

export const calcDepth = (tree) => {
    if (tree.isLeaf) {
        return 0;
    }

    let ans = 0;

    for (let i = 0; i < tree.children.length; i++) {
        const child = tree.children[i];
        const d = calcDepth(child) + 1;
        ans = ans > d ? ans : d;
    }

    return ans;
};

// leftの木なら先頭に'0', rightの木なら先頭に'1'を付けていく
// treeにbinaryLabelプロパティを追加
export const addBinaryLabels = (tree, maxDepth) => {
    // もしbinaryLabelsが無かったら(ルートノード)付与
    if (!('binaryLabel' in tree)) {
        tree.binaryLabel = '';
    }

    if (tree.isLeaf) {
        // 葉ノードのラベルはその親を処理した段階で付けているが、
        // 深さが足りないかもしれないので、そのぶん補う
        // 今の所の深さ = binaryLabelsの文字列としての長さ
        const ones = '1'.repeat(maxDepth - tree.binaryLabel.length);
        tree.binaryLabel = ones + tree.binaryLabel;
    } else if (tree.children.length === 2) {
        tree.children[0].binaryLabel = '0' + tree.binaryLabel;
        tree.children[1].binaryLabel = '1' + tree.binaryLabel;
        addBinaryLabels(tree.children[0], maxDepth);
        addBinaryLabels(tree.children[1], maxDepth);
    } else {
        throw new Error(`Unexpected case: ${JSON.stringify(tree)}`);
    }
};

// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Set
function union (setA, setB) {
    var _union = new Set(setA);
    for (var elem of setB) {
        _union.add(elem);
    }
    return _union;
}

const getLeafNode = (tree) => {
    if (tree.isLeaf) {
        return new Set([ tree, ]);
    } else if (tree.children.length === 2) {
        const leftLeafSet = getLeafNode(tree.children[0]);
        const rightLeafSet = getLeafNode(tree.children[1]);

        return union(leftLeafSet, rightLeafSet);
    } else {
        throw new Error('Unexpected');
    }
};

export const isAncestor = (parAlg, childAlg) => {
    // setup + (因数分解できなかった手順) +逆setup のような形式は扱っていない
    if (!parAlg.isFactorized || !childAlg.isFactorized) {
        return false;
    }

    // interchange, insertの順序が異なる
    if (parAlg.isInterchangeFirst !== childAlg.isInterchangeFirst) {
        return false;
    }

    if (!_.isEqual(parAlg.interchange, childAlg.interchange)) {
        return false;
    }

    if (!_.isEqual(parAlg.insert, childAlg.insert)) {
        return false;
    }

    if (parAlg.setup.length === 0) {
        return true;
    }

    // forall s : s.startswith('') == True であることに注意
    // parSetupが空のケースは以前に見たのでOK
    // 後述のようにスペースを付けて比較したいので、parSetupが空の場合は別の方法で判定する必要がある
    const parAlgRevSetupStr = parAlg.revSetup.join(' ');
    const childAlgRevSetupStr = childAlg.revSetup.join(' ');

    // LとLwのような場合に誤ってマッチしないように' 'を付けて比較
    if (childAlgRevSetupStr.startsWith(parAlgRevSetupStr + ' ')) {
        return true;
    }

    return false;
};

const orderBasicAlgsByEasiness = (inputBasicAlgs) => {
    const algs = inputBasicAlgs.slice();

    const rawDistanceMatrix = [];
    for (let rowInd = 0; rowInd < algs.length; rowInd++) {
        const row = [];
        const algRow = algs[rowInd];

        for (let colInd = 0; colInd < algs.length; colInd++) {
            const algCol = algs[colInd];
            const distance = distanceAlg(algRow, algCol);
            row.push(distance);
        }

        rawDistanceMatrix.push(row);
    }

    const distanceMatrix = new Matrix(rawDistanceMatrix);

    const tree = agnes(distanceMatrix, {
        method: 'average',
        isDistanceMatrix: true,
    });

    // 階層的クラスタリングの木をrootから下に辿ってラベルを付けていく
    const maxDepth = calcDepth(tree);
    addBinaryLabels(tree, maxDepth);

    // 2進数のラベルを優先度として、priority-queueに追加
    // (priorityが低いほうが先に取り出される)
    const q = new MinPriorityQueue();
    const leafNodes = [ ...getLeafNode(tree), ];
    for (let i = 0; i < leafNodes.length; i++) {
        const leafNode = leafNodes[i];
        const index = leafNode.index;
        const alg = algs[index];

        // MinPriorityの仕様で、priority値は1以上である必要があるので+1しておく
        // basicAlgsの要素が1つだけのときは手順がルートノードになってしまい、
        // binaryLabelが'' そして priorityがNaNになってしまうのでそれを回避
        const priority = parseInt(leafNode.binaryLabel, 2) + 1 || 1;
        q.enqueue(alg, priority);
    }

    // セットアップ無し手順、priorityが高い順
    const basicAlgs = [];
    while (!q.isEmpty()) {
        const alg = q.dequeue().element;
        basicAlgs.push(alg);
    }

    return basicAlgs;
};

// similarAlgsの 0 <= i <= limit番の手順で、
// 与えられたalgとセットアップが途中まで一致しているような手順のうち、
// 最後に見つかった手順を探す
export const searchParentAlg = (similarAlgs, tmpLimit, alg, setupStr, revSetupStr) => {
    if (similarAlgs.length === 0) {
        return null;
    }

    // 誤ったlimitが与えられた場合も配列の範囲外に突破しないようにしておく
    const limit = (() => {
        if (tmpLimit < 0) {
            return 0;
        }

        const ans = similarAlgs.length < tmpLimit ? similarAlgs.length : tmpLimit;
        return ans;
    })();

    let ans = null;
    for (let similarAlgsInd = 0; similarAlgsInd <= limit; similarAlgsInd++) {
        const parentTuple = similarAlgs[similarAlgsInd];

        const parSetup = parentTuple.setup;
        const parRevSetup = parentTuple.revSetup;
        const parAlg = parentTuple.alg;

        if (!isAncestor(parAlg, alg)) {
            continue;
        }

        // 親手順に追加されたセットアップ
        const appended = (() => {
            if (parSetup === '') {
                return setupStr;
            } else {
                // 先頭1マッチのみ置換する
                const appendedRev = revSetupStr.replace(parRevSetup + ' ', '');
                return appendedRev.split(' ').reverse().join(' ');
            }
        })();

        ans = {
            alg,
            parAlg,
            appended,
        };
    }

    // 同じ手順しかヒットしなかった場合は、それは新規扱い
    if (ans !== null && _.isEqual(ans.alg, ans.parAlg)) {
        ans = {
            alg,
            parAlg: null,
            appended: null,
        };
    }

    return ans;
};

export const orderAlgsByEasiness = (inputAlgs) => {
    const algs = inputAlgs.slice();
    const extracted = extractBasicAlgs(algs);
    const unOrderedBasicAlgs = extracted.basicAlgs;
    const { similarAlgsDict, } = extracted;

    const basicAlgs = orderBasicAlgsByEasiness(unOrderedBasicAlgs);

    // basicAlgsを順に回り、setupあり手順を掘っていく

    // (move1, move2) -> 次にどのindを見るか
    const similarAlgsIndDict = {};
    let currentMaxSetupMoveCnt = 0;
    const results = [];

    // basicAlgを一巡するまでの間に手順を見つけることができたか?
    let foundInCurrentRotation = false;
    let foundInPrevRotation = true;

    while (results.length < algs.length) {
        foundInCurrentRotation = false;
        for (let i = 0; i < basicAlgs.length; i++) {
            const basicAlg = basicAlgs[i];

            if (!basicAlg.isFactorized) {
                // できるだけ因数分解できた手順を優先する
                if (foundInPrevRotation) {
                    continue;
                }

                const pair = 'IS_SEQUENCE,' + basicAlg.sequence.join('');
                if (!(pair in similarAlgsIndDict)) {
                    similarAlgsIndDict[pair] = 0;
                }
                const ind = similarAlgsIndDict[pair];

                if (ind === 0) {
                    const tuple = {
                        alg: basicAlg,
                        parAlg: null,
                        appended: null,
                    };

                    // console.log(tuple);
                    results.push(tuple);
                    similarAlgsIndDict[pair] += 1;

                    foundInCurrentRotation = true;
                }

                continue;
            }

            // ここから下は因数分解できているケース
            const pair = makeDictKey(basicAlg);
            if (!(pair in similarAlgsIndDict)) {
                similarAlgsIndDict[pair] = 0;
            }
            const similarAlgsInd = similarAlgsIndDict[pair];
            const similarAlgs = similarAlgsDict[pair];

            // corner「あか」のようなpure-commの親が存在しないような手順もデータとしてはpure-algとして入っているが、
            // 実際はpure-commではないため、できるだけ登場を遅らせたい
            if (similarAlgsInd === 0 && basicAlg.setup.length > 0) {
                // 8はpure-commの長さ。それに加えて、セットアップの長さの2倍(ペナルティが厳しめ)
                // 無限ループになるのを避けるために、もし前回のローテで1つも新しい手順を見つけることができなかった場合は
                // この制約を回避する
                if (foundInPrevRotation) {
                    continue;
                }
            }

            // 掘りきっている
            if (similarAlgsInd > similarAlgs.length - 1) {
                continue;
            }

            const { setup, revSetup, alg, } = similarAlgs[similarAlgsInd];

            // similarAlgsの中で、これまで出てきた手順(0~similarAlgsInd-1まで)で
            // セットアップが途中まで一致している手順を探す
            const parentAlgTuple = searchParentAlg(similarAlgs, similarAlgsInd - 1, alg, setup, revSetup);

            // basicAlgがpure-commじゃなかった場合はあり有る
            // この場合は、親手順が無いものとして登録
            if (parentAlgTuple === null) {
                const tuple = {
                    alg,
                    parAlg: null,
                    appended: null,
                };

                // console.log(tuple);
                results.push(tuple);
                similarAlgsIndDict[pair] += 1;

                foundInCurrentRotation = true;
                continue;
            }

            // console.log(parentAlgTuple);

            results.push(parentAlgTuple);
            similarAlgsIndDict[pair] += 1;
            currentMaxSetupMoveCnt = currentMaxSetupMoveCnt > alg.setup.length ? currentMaxSetupMoveCnt : alg.setup.length;
            foundInCurrentRotation = true;
        }

        if (!foundInPrevRotation && !foundInCurrentRotation) {
            console.log('無限ループが検知されました');
            console.log(results.length);
            return results;
        }

        foundInPrevRotation = foundInCurrentRotation;
    }

    return results;
};

// orderAlgsByEasiness (BFS) とは逆に、似た手順がまとまって出現するアルゴリズム
// BFSでのアルゴリズムを考えていた時はモールス符号のKoch法を土台に考えていたので似た手順を同時にやると混同しそうだと考えていたが、
// モールス符号と違ってキューブの3-styleには理論があるので、今は似た手順は一度に学んだほうが覚える際の負荷が少ないと考えている
export const orderAlgsByEasinessDFS = (inputAlgs) => {
    const algs = inputAlgs.slice();
    const extracted = extractBasicAlgs(algs);
    const unOrderedBasicAlgs = extracted.basicAlgs;
    const { similarAlgsDict, } = extracted;

    const isDifficultBasicAlg = (basicAlg) => {
        return basicAlg.setup.length > 0 || !basicAlg.isFactorized;
    };

    const basicAlgs = orderBasicAlgsByEasiness(unOrderedBasicAlgs);
    const results = [];

    // まずbasicAlgsを順に回る
    // basicAlgsのうち、セットアップが必要な手順と、因数分解できなかった手順はスキップ
    for (let i = 0; i < basicAlgs.length; i++) {
        const basicAlg = basicAlgs[i];

        if (isDifficultBasicAlg(basicAlg)) {
            continue;
        }

        const tuple = {
            alg: basicAlg,
            parAlg: null,
            appended: null,
        };

        results.push(tuple);
    }

    // 次に、similarAlgsDictを巡る
    // basicAlgはsimilarAlgsDictの1要素目とは限らないので注意

    for (let basicAlgsInd = 0; basicAlgsInd < basicAlgs.length; basicAlgsInd++) {
        const basicAlg = basicAlgs[basicAlgsInd];

        const key = makeDictKey(basicAlg);
        const basicAlgSeq = basicAlg.sequence.join(' ');

        const similarAlgs = similarAlgsDict[key];

        // 因数分解できなかった手順はsimilarAlgsDictに含まれない
        if (!similarAlgs) {
            const tuple = {
                alg: basicAlg,
                parAlg: null,
                appended: null,
            };

            results.push(tuple);
            continue;
        }

        for (let similarAlgsInd = 0; similarAlgsInd < similarAlgs.length; similarAlgsInd++) {
            const { setup, revSetup, alg, } = similarAlgs[similarAlgsInd];

            // basicAlgの中で簡単な手順は最初に全てリストに加えたのでスキップ
            const seq = alg.sequence.join(' ');
            if (seq === basicAlgSeq && !isDifficultBasicAlg(basicAlg)) {
                continue;
            }

            if (similarAlgsInd === 0) {
                const tuple = {
                    alg,
                    parAlg: null,
                    appended: null,
                };

                results.push(tuple);
                continue;
            }

            // similarAlgsの中で、これまで出てきた手順(0~similarAlgsInd-1まで)で
            // セットアップが途中まで一致している手順を探す
            const parentAlgTuple = searchParentAlg(similarAlgs, similarAlgsInd - 1, alg, setup, revSetup);

            if (parentAlgTuple === null) {
                const tuple = {
                    alg,
                    parAlg: null,
                    appended: null,
                };

                results.push(tuple);
                continue;
            }

            results.push(parentAlgTuple);
        }
    }

    return results;
};
