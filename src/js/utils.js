const chunk = require('chunk');
const shuffle = require('shuffle-array');

const corners = [
    'BDL', 'BDR', 'BLU', 'BRU',
    'DBL', 'DBR', 'DFL', 'DFR',
    'FDL', 'FDR', 'FLU', 'FRU',
    'LBD', 'LBU', 'LDF', 'LFU',
    'RBD', 'RBU', 'RDF', 'RFU',
    'UBL', 'UBR', 'UFL', 'UFR',
];

const edges = [
    'BD', 'BL', 'BR', 'BU',
    'DB', 'DF', 'DL', 'DR',
    'FD', 'FL', 'FR', 'FU',
    'LB', 'LD', 'LF', 'LU',
    'RB', 'RD', 'RF', 'RU',
    'UB', 'UF', 'UL', 'UR',
];

const showMove = (setup, move1, move2) => {
    if (setup === '') {
        return `[${move1}, ${move2}]`;
    } else if (move1 === '' && move2 === '') {
        return `[${setup}]`;
    } else {
        return `[${setup}, [${move1}, ${move2}]]`;
    }
};

const strMax = (s1, s2) => {
    if (s1 >= s2) {
        return s1;
    }
    return s2;
};

const strMin = (s1, s2) => {
    if (s1 <= s2) {
        return s1;
    }
    return s2;
};

// 2つのステッカーが、同じパーツに属するかを判定
const isInSameParts = (sticker1, sticker2) => {
    const s1 = Array.from(sticker1).sort().join('');
    const s2 = Array.from(sticker2).sort().join('');
    return s1 === s2;
};

// n個グループにして、そのグループ内で順番を入れ替える
const chunkAndShuffle = (arr, n) => {
    const grouped = chunk(arr, n).map(arr => shuffle(arr, { copy: true, }));
    return Array.prototype.concat.apply([], grouped);
};

// 3-styleの分類
// A9やColumnなどの細かい分類ではなく、hinemos内の便宜的なもの
const threeStyleType = {
    pure: { value: 0, name: 'pure', }, //   [A, B]
    setup: { value: 1, name: 'setup', }, // [S, [A, B]]
    seq: { value: 2, name: 'seq', }, //     [A B C D]
};

// 3-style記法を受け取り、3-style typeを判定して返す
// 判定できないパターンの場合はエラーを返す
// FIXME 正規表現の保守性が低すぎる
const getThreeStyleType = (s) => {
    // [A B C D] => 'seq'
    const seqMatch = s.match(/^\[[^, \[\]]+( [^, \[\]]+)*\]$/);
    if (seqMatch) {
        return threeStyleType.seq;
    }

    // [S, [A, B C D]] => 'setup'
    const setupMatch = s.match(/^\[[^, \[\]]+( [^, \[\]]+)*, \[[^, \[\]]+( [^, \[\]]+)*, [^, \[\]]+( [^, \[\]]+)*\]\]$/);
    if (setupMatch) {
        return threeStyleType.setup;
    }

    // [A, B C D]] => 'pure'
    const pureMatch = s.match(/^\[[^, \[\]]+( [^, \[\]]+)*, [^, \[\]]+( [^, \[\]]+)*\]$/);
    if (pureMatch) {
        return threeStyleType.pure;
    }

    throw new Error('ThreeStyleCorner parse error');
};

// 3-style記法の文字列をパースして、オブジェクトを返す
const readThreeStyleCorners = (s) => {
    if (s === '[') {
        throw new Error('ThreeStyleCorner parse error');
    }
    return [];
};

exports.corners = corners;
exports.edges = edges;
exports.showMove = showMove;
exports.strMax = strMax;
exports.strMin = strMin;
exports.isInSameParts = isInSameParts;
exports.chunkAndShuffle = chunkAndShuffle;
exports.threeStyleType = threeStyleType;
exports.getThreeStyleType = getThreeStyleType;
exports.readThreeStyleCorners = readThreeStyleCorners;
