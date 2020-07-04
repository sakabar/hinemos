const _ = require('lodash');
const { Matrix, } = require('ml-matrix');
const { agnes, } = require('ml-hclust');

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

        if (_.isEqual(simplifySeq(candSeq), simplifySeq(restSeq))) {
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

// arg.isSequenceがtrueなら因数分解、arg.isSequenceがfalseならそのまま代入
export function Alg (arg) {
    this.letters = arg.letters;

    if (arg.isSequence) {
        const factorized = factorize(arg.sequence);

        if (factorized === null) {
            this.setup = [];
            this.revSetup = [];
            this.interchange = [];
            this.insert = [];
            this.isInterchangeFirst = false;
            this.isFactorized = false;
            this.sequence = arg.sequence;
            return;
        }

        this.setup = factorized.setup;
        const revSetup = factorized.setup.slice();
        revSetup.reverse();
        this.revSetup = revSetup;
        this.interchange = factorized.interchange;
        this.insert = factorized.insert;
        this.isInterchangeFirst = factorized.isInterchangeFirst;
        this.isFactorized = true;
        this.sequence = arg.sequence;
    } else {
        if (arg.interchange.length === 0 && arg.insert.length === 0) {
            throw new Error('Unexpected Input');
        }

        this.setup = arg.setup;
        const revSetup = arg.setup.slice();
        revSetup.reverse();
        this.revSetup = revSetup;
        this.interchange = arg.interchange;
        this.insert = arg.insert;
        this.isInterchangeFirst = arg.isInterchangeFirst || false;
        this.isFactorized = true;

        const seq = this.setup
            .concat(this.interchange)
            .concat(this.insert)
            .concat(inverse(this.interchange))
            .concat(inverse(this.insert))
            .concat(inverse(this.setup));

        this.sequence = simplifySeq(seq);
    }
}

export const distanceAlg = (x, y) => {
    if (!x.isFactorized || !y.isFactorized) {
        return distanceSeq(x.sequence, y.sequence);
    }

    const setupDistance = distanceSeq(x.setup, y.setup);
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
            if (a.letters < b.letters) return -1;
            if (a.letters === b.letters) return 0;
            if (a.letters > b.letters) return 1;
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

    return {
        basicAlgs,
        similarAlgsDict,
    };
};

const calcDepth = (tree) => {
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

export const orderAlgsByEasiness = (algs) => {
    const rawDistanceMatrix = [];
    for (let rowInd = 0; rowInd < algs.length; rowInd++) {
        const row = [];
        const algRow = algs[rowInd];

        for (let colInd = 0; colInd < algs.length; colInd++) {
            const algCol = algs[colInd];
            const distance = distanceAlg(algRow, algCol);
            row.push(distance);
        }
    }

    const distanceMatrix = new Matrix(rawDistanceMatrix);

    const tree = agnes(distanceMatrix, {
        method: 'average',
        isDistanceMatrix: true,
    });

    // 階層的クラスタリングの木をrootから下に辿ってラベルを付けていく
    const maxDepth = calcDepth(tree);
    addBinaryLabels(tree, maxDepth);


};
