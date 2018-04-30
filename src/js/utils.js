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

const getHiraganas = () => {
    return 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.split(/(.{1})/).filter(x => x);
};

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

const isValidMoves = (moveStr) => {
    const reg = new RegExp('^([BDFLRU]w?|[EMS]|[xyz])\'?2?$');
    return moveStr.split(' ').every(s => reg.test(s));
};

// validationしつつ、3-styleのオブジェクトを生成
// validationにエラーがあった場合は、値を返さずエラー
const makeThreeStyle = (buffer, sticker1, sticker2, setup, move1, move2) => {
    const replacedSetup = setup.trim().replace(/[‘’´｀`]/g, '\'');
    const replacedMove1 = move1.trim().replace(/[‘’´｀`]/g, '\'');
    const replacedMove2 = move2.trim().replace(/[‘’´｀`]/g, '\'');

    const okCond1 = (replacedMove1 !== '' && replacedMove2 !== '');
    const okCond2 = (replacedMove1 === '' && replacedMove2 === '' && replacedSetup !== '');
    if (!(okCond1 || okCond2)) {
        throw new Error('入力されていない欄があります。\n通常の手順の場合、手順1と手順2を両方埋めて下さい。\nCyclic Shiftなどの特殊な手順の場合は、手順1と手順2を空欄にして、セットアップだけ入力してください。');
    };

    // replacedMove1とreplacedMove2が両方埋まっている場合
    if (okCond1) {
        if (replacedSetup !== '' && !isValidMoves(replacedSetup)) {
            throw new Error('セットアップの手順の記法に誤りがあります。各操作の間にはスペースを入れてください。\n例: y Lw\'2 E U');
        }

        if (!isValidMoves(replacedMove1)) {
            throw new Error('手順1の記法に誤りがあります。各操作の間にはスペースを入れてください。\n例: y Lw\'2 E U');
        }

        if (!isValidMoves(replacedMove2)) {
            throw new Error('手順2の記法に誤りがあります。各操作の間にはスペースを入れてください。\n例: y Lw\'2 E U');
        }
    }

    // replacedMove1とreplacedMove2が両方空の場合 → replacedSetupのみチェック
    if (okCond2 && !isValidMoves(replacedSetup)) {
        throw new Error('セットアップの手順の記法に誤りがあります。各操作の間にはスペースを入れてください。\n例: y Lw\'2 E U');
    }

    // ステッカーは同じパーツに無い
    if (isInSameParts(buffer, sticker1) || isInSameParts(sticker1, sticker2) || isInSameParts(sticker2, buffer)) {
        throw new Error('同じパーツのステッカーが入力されています');
    }

    // ステッカーをソート
    const sortedBuffer = sortSticker(buffer);
    const sortedSticker1 = sortSticker(sticker1);
    const sortedSticker2 = sortSticker(sticker2);

    return {
        buffer: sortedBuffer,
        sticker1: sortedSticker1,
        sticker2: sortedSticker2,
        setup: replacedSetup,
        move1: replacedMove1,
        move2: replacedMove2,
    };
};

// ステッカーの0文字目を固定して、それ以降をソート
const sortSticker = (sticker) => {
    if (sticker.length !== 2 && sticker.length !== 3) {
        throw new Error('Error: sticker length must be 2 or 3');
    }

    const sorted = Array.from(sticker.slice(1)).sort().join('');
    return `${sticker[0]}${sorted}`;
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

    throw new Error(`3-styleのパーズに失敗しました:「${s}」`);
};

// 3-style記法の文字列をパースして、オブジェクトを返す
// 正規表現が複雑になるのを避けるため、まずgetThreeStyleTypeで判定してから更にふるいにかける
const readThreeStyles = (s) => {
    if (s.match(/^\s*$/)) {
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
exports.getHiraganas = getHiraganas;
exports.showMove = showMove;
exports.strMax = strMax;
exports.strMin = strMin;
exports.isInSameParts = isInSameParts;
exports.isValidMoves = isValidMoves;
exports.makeThreeStyle = makeThreeStyle;
exports.sortSticker = sortSticker;
exports.chunkAndShuffle = chunkAndShuffle;
exports.ThreeStyleType = ThreeStyleType;
exports.getThreeStyleType = getThreeStyleType;
exports.readThreeStyles = readThreeStyles;
