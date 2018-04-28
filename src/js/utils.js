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
const ThreeStyleType = {
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
        return ThreeStyleType.seq;
    }

    // [S, [A, B C D]] => 'setup'
    const setupMatch = s.match(/^\[[^, \[\]]+( [^, \[\]]+)*, \[[^, \[\]]+( [^, \[\]]+)*, [^, \[\]]+( [^, \[\]]+)*\]\]$/);
    if (setupMatch) {
        return ThreeStyleType.setup;
    }

    // [A, B C D]] => 'pure'
    const pureMatch = s.match(/^\[[^, \[\]]+( [^, \[\]]+)*, [^, \[\]]+( [^, \[\]]+)*\]$/);
    if (pureMatch) {
        return ThreeStyleType.pure;
    }

    throw new Error('ThreeStyleCorner parse error');
};

// 3-style記法の文字列をパースして、オブジェクトを返す
// 正規表現が複雑になるのを避けるため、まずgetThreeStyleTypeで判定してから更にふるいにかける
const readThreeStyles = (s) => {
    if (s === '') {
        return [];
    }

    // 複数の場合
    // 効率が悪そうなので納得できていないが、とりあえず再帰で実装できた FIXME
    const pluralMatch = s.match(/^(\[.+?\],) (.+)$/);
    if (pluralMatch) {
        const hd = pluralMatch[1];
        const tl = pluralMatch[2];

        const hdArr = readThreeStyles(hd.replace(/,$/, ''));
        const tlArr = readThreeStyles(tl.replace(/^, /, ''));
        return [ ...hdArr, ...tlArr, ];
    }

    // ここから下、単数の場合
    const t = getThreeStyleType(s);
    if (t === ThreeStyleType.pure) {
        const pureMatch = s.match(/^\[([^,]+), ([^,]+)\]$/);
        if (!pureMatch) {
            throw new Error('Unexpected pureMatch pattern');
        }

        const ts = {
            setup: '',
            move1: pureMatch[1],
            move2: pureMatch[2],
        };

        return [ ts, ];
    }

    if (t === ThreeStyleType.setup) {
        const setupMatch = s.match(/^\[([^,]+), \[([^,]+), ([^,]+)\]\]$/);
        if (!setupMatch) {
            throw new Error('Unexpected setupMatch pattern');
        }

        const ts = {
            setup: setupMatch[1],
            move1: setupMatch[2],
            move2: setupMatch[3],
        };

        return [ ts, ];
    }

    if (t === ThreeStyleType.seq) {
        const seqMatch = s.match(/^\[([^,]+)\]$/);
        if (!seqMatch) {
            throw new Error('Unexpected seqMatch pattern');
        }

        const ts = {
            setup: seqMatch[1],
            move1: '',
            move2: '',
        };

        return [ ts, ];
    }

    throw new Error('ThreeStyleCorner parse error');
};

exports.corners = corners;
exports.edges = edges;
exports.showMove = showMove;
exports.strMax = strMax;
exports.strMin = strMin;
exports.isInSameParts = isInSameParts;
exports.chunkAndShuffle = chunkAndShuffle;
exports.ThreeStyleType = ThreeStyleType;
exports.getThreeStyleType = getThreeStyleType;
exports.readThreeStyles = readThreeStyles;
