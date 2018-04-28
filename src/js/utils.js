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

exports.corners = corners;
exports.edges = edges;
exports.showMove = showMove;
exports.strMax = strMax;
exports.strMin = strMin;
exports.isInSameParts = isInSameParts;
exports.chunkAndShuffle = chunkAndShuffle;
