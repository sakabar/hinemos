const chunk = require('chunk');
const Cube = require('cubejs');
const normalize = require('cube-notation-normalizer');
const shuffle = require('shuffle-array');
const constant = require('./constant');

export const corners = [
    'BDL', 'BDR', 'BLU', 'BRU',
    'DBL', 'DBR', 'DFL', 'DFR',
    'FDL', 'FDR', 'FLU', 'FRU',
    'LBD', 'LBU', 'LDF', 'LFU',
    'RBD', 'RBU', 'RDF', 'RFU',
    'UBL', 'UBR', 'UFL', 'UFR',
];

export const edges = [
    'BD', 'BL', 'BR', 'BU',
    'DB', 'DF', 'DL', 'DR',
    'FD', 'FL', 'FR', 'FU',
    'LB', 'LD', 'LF', 'LU',
    'RB', 'RD', 'RF', 'RU',
    'UB', 'UF', 'UL', 'UR',
];

export const cornerParts = [
    'DBL', 'DBR', 'DFL', 'DFR',
    'UBL', 'UBR', 'UFL', 'UFR',
];

export const edgeParts = [
    'DB', 'DF', 'DL', 'DR',
    'UB', 'UF', 'UL', 'UR',
    'RB', 'RF', 'LB', 'LF',
];

const getHiraganas = () => {
    const hiraganas = `
        あいうえお
        かきくけこ
        さしすせそ
        たちつてと
        なにぬねの
        はひふへほ
        まみむめも
        やゆよ
        らりるれろ
        わをん`;

    return hiraganas.replace(/\s/g, '').split(/(.{1})/).filter(x => x);
};

const getAlphabets = () => {
    const alphabets = `
       ABCDE
       FGHIJ
       KLMNO
       PQRST
       UVWXY
       Z`;

    return alphabets.replace(/\s/g, '').split(/(.{1})/).filter(x => x);
};

export const getCharacters = (characterType) => {
    if (characterType === constant.characterType.hiragana) {
        return getHiraganas();
    } else if (characterType === constant.characterType.alphabet) {
        return getAlphabets();
    }

    throw new Error('Unexpected characterType');
};

export const getCharacterType = (ch) => {
    if (getHiraganas().includes(ch)) {
        return constant.characterType.hiragana;
    } else if (getAlphabets().includes(ch)) {
        return constant.characterType.alphabet;
    }

    throw new Error('Unexpected character');
};

export const showMove = (setup, move1, move2) => {
    if (setup === '') {
        return `[${move1}, ${move2}]`;
    } else if (move1 === '' && move2 === '') {
        return `${setup}`;
    } else {
        return `[${setup}: [${move1}, ${move2}]]`;
    }
};

export const big2Small = (s) => {
    return s
        .replace(/Uw/g, 'u')
        .replace(/Dw/g, 'd')
        .replace(/Rw/g, 'r')
        .replace(/Lw/g, 'l')
        .replace(/Fw/g, 'f')
        .replace(/Bw/g, 'b');
};

export const small2Big = (s) => {
    return s
        .replace(/u/g, 'Uw')
        .replace(/d/g, 'Dw')
        .replace(/r/g, 'Rw')
        .replace(/l/g, 'Lw')
        .replace(/f/g, 'Fw')
        .replace(/b/g, 'Bw');
};

// 逆手順を求めるラッパー
// LwやRwをl, rに変換してからinverse()、その後に元に戻す
// R'2のように、間に'が入っている場合は置換
export const inverse = (s) => {
    const replaced = big2Small(s).replace(/'2/g, '2');
    return small2Big(Cube.inverse(replaced));
};

// 3-styleの記法を展開し、moveの文字列にする
// LwやRwやR'2などが含まれているとinverse()できないので変換
// 最後には、lやrなくす
export const expandMove = (setup, move1, move2) => {
    const t = getThreeStyleType(showMove(setup, move1, move2));

    if (t === ThreeStyleType.pure) {
        return [ move1, move2, inverse(move1), inverse(move2), ].join(' ');
    } else if (t === ThreeStyleType.setup) {
        return [ setup, move1, move2, inverse(move1), inverse(move2), inverse(setup), ].join(' ');
    } else if (t === ThreeStyleType.seq) {
        return setup;
    }

    return '';
};

export const strMax = (s1, s2) => {
    if (s1 >= s2) {
        return s1;
    }
    return s2;
};

export const strMin = (s1, s2) => {
    if (s1 <= s2) {
        return s1;
    }
    return s2;
};

// 2つのステッカーが、同じパーツに属するかを判定
export const isInSameParts = (sticker1, sticker2) => {
    const s1 = Array.from(sticker1).sort().join('');
    const s2 = Array.from(sticker2).sort().join('');
    return s1 === s2;
};

export const isValidMoves = (moveStr, partType) => {
    // 5BLD対応時にパートの引数を増やしたので、
    // 以前のコードを変更をしなくていいようにデフォルト引数にした
    if (!partType) {
        partType = constant.partType.corner;
    }

    let reg;
    if (partType.name === 'corner' || partType.name === 'edgeMiddle') {
        reg = new RegExp('^([BDFLRU]w?|[EMS]|[xyz])\'?2?$');
    } else if (partType.name === 'edgeWing' || partType.name === 'centerX') {
        reg = new RegExp('^3?([BDFLRU]w?|[bdflru]|[xyz])\'?2?$');
    } else if (partType.name === 'centerT') {
        reg = new RegExp('^[34]?([BDFLRU]w?|[EMS]|[bdflru]|[xyz])\'?2?$');
    } else {
        throw new Error(`Unexpected part type : ${partType}`);
    }

    return moveStr.split(' ').every(s => reg.test(s));
};

const replaceMoves = (moveStr) => {
    return moveStr
        .replace(/[‘’´｀`]/g, '\'')
        .replace(/[,:;\[\]\(\)：；、，]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/2'/g, '\'2')
        .trim();
};

// validationしつつ、3-styleのオブジェクトを生成
// validationにエラーがあった場合は、値を返さずエラー
export const makeThreeStyle = (buffer, sticker1, sticker2, setup, move1, move2, partType) => {
    const replacedSetup = replaceMoves(setup);
    const replacedMove1 = replaceMoves(move1);
    const replacedMove2 = replaceMoves(move2);

    // 5BLD対応時にパートの引数を増やしたので、
    // 以前のコードを変更をしなくていいようにデフォルト引数にした
    if (!partType) {
        partType = constant.partType.corner;
    }

    const okCond1 = (replacedMove1 !== '' && replacedMove2 !== '');
    const okCond2 = (replacedMove1 === '' && replacedMove2 === '' && replacedSetup !== '');
    if (!(okCond1 || okCond2)) {
        throw new Error('入力されていない欄があります。\n通常の手順の場合、手順1と手順2を両方埋めて下さい。\nCyclic Shiftなどの特殊な手順の場合は、手順1と手順2を空欄にして、セットアップだけ入力してください。');
    };

    // replacedMove1とreplacedMove2が両方埋まっている場合
    if (okCond1) {
        if (replacedSetup !== '' && !isValidMoves(replacedSetup, partType)) {
            throw new Error('セットアップの手順の記法に誤りがあります。各操作の間にはスペースを入れてください。\n例: y Lw\'2 E U');
        }

        if (!isValidMoves(replacedMove1, partType)) {
            throw new Error('手順1の記法に誤りがあります。各操作の間にはスペースを入れてください。\n例: y Lw\'2 E U');
        }

        if (!isValidMoves(replacedMove2, partType)) {
            throw new Error('手順2の記法に誤りがあります。各操作の間にはスペースを入れてください。\n例: y Lw\'2 E U');
        }
    }

    // replacedMove1とreplacedMove2が両方空の場合 → replacedSetupのみチェック
    if (okCond2 && !isValidMoves(replacedSetup, partType)) {
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
export const sortSticker = (sticker) => {
    if (sticker.length !== 2 && sticker.length !== 3) {
        throw new Error('Error: sticker length must be 2 or 3');
    }

    const sorted = Array.from(sticker.slice(1)).sort().join('');
    return `${sticker[0]}${sorted}`;
};

// n個グループにして、そのグループ内で順番を入れ替える
export const chunkAndShuffle = (arr, n) => {
    const grouped = chunk(arr, n).map(arr => shuffle(arr, { copy: true, }));
    return Array.prototype.concat.apply([], grouped);
};

// 3-styleの分類
// A9やColumnなどの細かい分類ではなく、hinemos内の便宜的なもの
export const ThreeStyleType = {
    pure: { value: 0, name: 'pure', }, //   [A, B]
    setup: { value: 1, name: 'setup', }, // [S, [A, B]]
    seq: { value: 2, name: 'seq', }, //     [A B C D]
};

// 3-style記法を受け取り、3-style typeを判定して返す
// 判定できないパターンの場合はエラーを返す
// FIXME 正規表現の保守性が低すぎる
export const getThreeStyleType = (s) => {
    // A B C D => 'seq'
    const seqMatch = s.match(/^[^, \[\]]+( [^, \[\]]+)*$/);
    if (seqMatch) {
        return ThreeStyleType.seq;
    }

    // [S: [A, B C D]] => 'setup'
    const setupMatch = s.match(/^\[[^, \[\]]+( [^, \[\]]+)*[:,] \[[^, \[\]]+( [^, \[\]]+)*, [^, \[\]]+( [^, \[\]]+)*\]\]$/);
    if (setupMatch) {
        return ThreeStyleType.setup;
    }

    // [A, B C D] => 'pure'
    const pureMatch = s.match(/^\[[^, \[\]]+( [^, \[\]]+)*, [^, \[\]]+( [^, \[\]]+)*\]$/);
    if (pureMatch) {
        return ThreeStyleType.pure;
    }

    throw new Error(`3-styleのパーズに失敗しました:「${s}」`);
};

// 3-style記法の文字列をパースして、オブジェクトを返す
// 正規表現が複雑になるのを避けるため、まずgetThreeStyleTypeで判定してから更にふるいにかける
export const readThreeStyles = (s, partType) => {
    if (s.match(/^\s*$/)) {
        return [];
    }

    // 5BLD対応で引数を増やしたので、引数が足りない時にも動くように
    // デフォルト引数のような動きにする
    if (!partType) {
        partType = constant.partType.corner;
    }

    // (A B)2 や (A B)*2 を A B A Bに変換
    const doubleRegExp = /\(([^)]*)\)\*?2/;
    let m = s.match(doubleRegExp);
    while (m) {
        s = s.replace(doubleRegExp, ' $1 $1 ');
        m = s.match(doubleRegExp);
    }

    // X2'をX'2に置換
    s = s.replace(/2'/g, '\'2');

    // [A: B]の時はnormalize
    if (s.match(/^\[[^\]\[]+:[^\]\[]+\]$/)) {
        s = normalize(s);
    }

    // 3BLDのパートであるコーナー・エッジの場合はrやlをRwやLwに置き換える
    // 4BLDの場合はrやlを単層回しと見なすのでダメ
    // normalize()でUwなどがuのような1文字に変換されてしまうので、その後に変換
    if (partType === constant.partType.corner || partType === constant.partType.edgeMiddle) {
        s = s
            .replace(/r/g, 'Rw')
            .replace(/l/g, 'Lw')
            .replace(/u/g, 'Uw')
            .replace(/d/g, 'Dw')
            .replace(/f/g, 'Fw')
            .replace(/b/g, 'Bw');
    }

    // 似たような文字や、複数個のスペースを置換
    const replacedStr = s.trim().replace(/[;；：]/g, ':').replace(/[‘’´｀`]/g, '\'').replace(/[，、]/g, ',').replace(/,/g, ' , ').replace(/:/g, ' : ').replace(/[({【「]/g, '[').replace(/[」】}]/g, ']').replace(/\s+/g, ' ').replace(/ *,/g, ',').replace(/ *:/g, ':').replace(/\s+]/g, ']').replace(/]\s+/g, ']').replace(/\[\s+/g, '[').replace(/,\[/g, ', [').replace(/:\[/g, ': [');

    // 過去の仕様との互換性のための特例として、1手順だけの場合は[A B C]型の記述を許容
    const bracketSeqMatch = replacedStr.match(/^\[([^\[\],:]+)\]$/);
    if (bracketSeqMatch) {
        const seqTypeNotationStr = bracketSeqMatch[1];
        return readThreeStyles(seqTypeNotationStr);
    }

    // 複数の場合
    // 最初が'['で始まっていない場合は、type=seq確定なのでその部分を切り取って再帰
    const pluralSeqMatch = replacedStr.match(/^([^\[\],]*), (.+)$/);
    if (pluralSeqMatch) {
        const hd = pluralSeqMatch[1];
        const tl = pluralSeqMatch[2];

        const hdArr = readThreeStyles(hd.replace(/,$/, ''), partType);
        const tlArr = readThreeStyles(tl.replace(/^, /, ''), partType);
        return [ ...hdArr, ...tlArr, ];
    }

    // 複数の場合、その2
    // Seqのパターンは過ぎたので、[]で切り取ればよい
    const pluralMatch = replacedStr.match(/^(\[.+?\],) (.+)$/);
    if (pluralMatch) {
        const hd = pluralMatch[1];
        const tl = pluralMatch[2];

        const hdArr = readThreeStyles(hd.replace(/,$/, ''), partType);
        const tlArr = readThreeStyles(tl.replace(/^, /, ''), partType);
        return [ ...hdArr, ...tlArr, ];
    }

    // ここから下、単数の場合
    const t = getThreeStyleType(replacedStr);
    if (t === ThreeStyleType.pure) {
        const pureMatch = replacedStr.match(/^\[([^,]+), ([^,]+)\]$/);
        if (!pureMatch) {
            throw new Error('Unexpected pureMatch pattern');
        }

        if (!isValidMoves(pureMatch[1], partType) || !isValidMoves(pureMatch[2], partType)) {
            throw new Error(`Invalid Moves in: ${s}`);
        }

        const ts = {
            setup: '',
            move1: pureMatch[1],
            move2: pureMatch[2],
        };

        return [ ts, ];
    }

    if (t === ThreeStyleType.setup) {
        const setupMatch = replacedStr.match(/^\[([^,]+)[:,] \[([^,]+), ([^,]+)\]\]$/);
        if (!setupMatch) {
            throw new Error('Unexpected setupMatch pattern');
        }

        if (!isValidMoves(setupMatch[1], partType) || !isValidMoves(setupMatch[2], partType) || !isValidMoves(setupMatch[3], partType)) {
            throw new Error(`Invalid Move in: ${s}`);
        }

        const ts = {
            setup: setupMatch[1],
            move1: setupMatch[2],
            move2: setupMatch[3],
        };

        return [ ts, ];
    }

    if (t === ThreeStyleType.seq) {
        const seqMatch = replacedStr.match(/^([^,]+)$/);
        if (!seqMatch) {
            throw new Error('Unexpected seqMatch pattern');
        }

        if (!isValidMoves(seqMatch[1], partType)) {
            throw new Error(`Invalid Move in: ${s}`);
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

export const makeWingSticker = (face1, face2, face3) => {
    const edge = `${face1}${face2}`.toUpperCase();
    const sliceFace = face3.toLowerCase();

    return `${edge}${sliceFace}`;
};

export const makeXcenterSticker = (face1, face2, face3) => {
    const s = sortSticker(`${face1}${face2}${face3}`).toLowerCase();
    return `${s[0].toUpperCase()}${s.slice(1)}`;
};

export const makeTcenterSticker = (face1, face2) => {
    return `${face1.toUpperCase()}${face2.toLowerCase()}`;
};
