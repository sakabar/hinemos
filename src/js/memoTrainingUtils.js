const config = require('./config');
const constant = require('./constant');
const numbering3 = require('./numbering3');
const utils = require('./utils');
const _ = require('lodash');
const shuffle = require('shuffle-array');
const rp = require('request-promise');

export const MemoEvent = {
    mbld: 'mbld',
    cards: 'cards',
};

export const ElementType = {
    letter: 'letter',
    card: 'card',
};

export const TrainingMode = {
    memorization: 'memorization',
    transformation: 'transformation',
};

export const TrainingPhase = {
    setting: 'setting',
    memorization: 'memorization',
    recall: 'recall',
};

export const Suit = {
    club: 'C',
    diamond: 'D',
    heart: 'H',
    spade: 'S',
};

function Element (type, size, tag) {
    this.type = type;
    this.size = size;
    this.tag = tag;
};

export function MbldElement (letters) {
    const type = ElementType.letter;
    const size = letters.length;
    const tag = letters;

    return new Element(type, size, tag);
};

export function CardElement (suit, num) {
    if (num < 1 || 13 < num) {
        throw new Error(`Invalid num: ${num}`);
    }

    if ((suit !== Suit.club && suit !== Suit.diamond && suit !== Suit.heart && suit !== Suit.spade)) {
        throw new Error(`Invalid suit: ${suit}`);
    }

    const type = ElementType.card;
    const size = 1;
    const zeroPaddedNum = _.padStart(num, 2, '0');
    const tag = `${suit}-${zeroPaddedNum}`;

    return new Element(type, size, tag);
};

export async function loadElementIdsDict () {
    const options = {
        url: `${config.apiRoot}/memoElement`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    const res = await rp(options)
        .catch(() => {
            return {};
        });

    const ans = {};
    res.success.result.map(element => {
        if (!(element.type in ans)) {
            ans[element.type] = {};
        }

        ans[element.type][element.tag] = element.elementId;
    });

    return ans;
}

export const postDeck = (elementIdsList) => {
    const options = {
        url: `${config.apiRoot}/memoDeck`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            elementIdsList,
        },
    };

    return rp(options);
};

export const postTrial = (userName, mode, deckIds) => {
    const options = {
        url: `${config.apiRoot}/memoTrial`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            userName,
            mode,
            deckIds,
        },
    };

    return rp(options);
};

export const postMemoLogs = (memoLogs) => {
    const logs = memoLogs.map((memoLog, i) => {
        return {
            ...memoLog,
            ind: i,
        };
    });

    const options = {
        url: `${config.apiRoot}/memoLogMemorization`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            logs,
        },
    };

    return rp(options);
};

export const postRecallLogs = (arg) => {
    console.dir(`recall log mock ${JSON.stringify(arg)}`);
};

export const postMemoScore = (arg) => {
    const options = {
        url: `${config.apiRoot}/memoScore`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            ...arg,
        },
    };

    return rp(options);
};

export const numberingCornerMock = [
    { userName: 'tsakakib', sticker: 'UBL', letter: '@', },
    { userName: 'tsakakib', sticker: 'UBR', letter: 'さ', },
    { userName: 'tsakakib', sticker: 'UFR', letter: 'あ', },
    { userName: 'tsakakib', sticker: 'UFL', letter: 'た', },
    { userName: 'tsakakib', sticker: 'RFU', letter: 'い', },
    { userName: 'tsakakib', sticker: 'RBU', letter: 'し', },
    { userName: 'tsakakib', sticker: 'RDF', letter: 'き', },
    { userName: 'tsakakib', sticker: 'RBD', letter: 'ひ', },
    { userName: 'tsakakib', sticker: 'LFU', letter: 'ち', },
    { userName: 'tsakakib', sticker: 'LBD', letter: 'み', },
    { userName: 'tsakakib', sticker: 'LDF', letter: 'に', },
    { userName: 'tsakakib', sticker: 'FLU', letter: 'つ', },
    { userName: 'tsakakib', sticker: 'FRU', letter: 'う', },
    { userName: 'tsakakib', sticker: 'FDL', letter: 'ぬ', },
    { userName: 'tsakakib', sticker: 'FDR', letter: 'く', },
    { userName: 'tsakakib', sticker: 'BRU', letter: 'す', },
    { userName: 'tsakakib', sticker: 'BDR', letter: 'ふ', },
    { userName: 'tsakakib', sticker: 'BDL', letter: 'む', },
    { userName: 'tsakakib', sticker: 'DFR', letter: 'か', },
    { userName: 'tsakakib', sticker: 'DFL', letter: 'な', },
    { userName: 'tsakakib', sticker: 'DBR', letter: 'は', },
    { userName: 'tsakakib', sticker: 'DBL', letter: 'ま', },
];

export const fetchNumberingCorner = (userName) => {
    // mock
    return new Promise((resolve) => resolve(numberingCornerMock));
};

export const numberingEdgeMock = [
    { userName: 'tsakakib', sticker: 'UR', letter: 'き', },
    { userName: 'tsakakib', sticker: 'UB', letter: 'す', },
    { userName: 'tsakakib', sticker: 'UL', letter: 'ち', },
    { userName: 'tsakakib', sticker: 'UF', letter: 'し', },
    { userName: 'tsakakib', sticker: 'RF', letter: 'あ', },
    { userName: 'tsakakib', sticker: 'RU', letter: 'い', },
    { userName: 'tsakakib', sticker: 'RB', letter: 'う', },
    { userName: 'tsakakib', sticker: 'RD', letter: 'え', },
    { userName: 'tsakakib', sticker: 'LF', letter: 'な', },
    { userName: 'tsakakib', sticker: 'LU', letter: 'に', },
    { userName: 'tsakakib', sticker: 'LB', letter: 'ぬ', },
    { userName: 'tsakakib', sticker: 'LD', letter: 'ね', },
    { userName: 'tsakakib', sticker: 'FU', letter: 'さ', },
    { userName: 'tsakakib', sticker: 'FR', letter: 'か', },
    { userName: 'tsakakib', sticker: 'FL', letter: 'た', },
    { userName: 'tsakakib', sticker: 'BR', letter: 'く', },
    { userName: 'tsakakib', sticker: 'BU', letter: 'せ', },
    { userName: 'tsakakib', sticker: 'BL', letter: 'つ', },
    { userName: 'tsakakib', sticker: 'BD', letter: 'そ', },
    { userName: 'tsakakib', sticker: 'DR', letter: 'け', },
    { userName: 'tsakakib', sticker: 'DF', letter: '@', },
    { userName: 'tsakakib', sticker: 'DL', letter: 'て', },
    { userName: 'tsakakib', sticker: 'DB', letter: 'ん', },
];

export const fetchNumberingEdge = () => {
    // mock
    return new Promise((resolve) => resolve(numberingEdgeMock));
};

const generateRandomAnalysisStrOfPart = (numberings, partType) => {
    const stickerToLetter = {};
    for (let i = 0; i < numberings.length; i++) {
        const sticker = numberings[i].sticker;
        const letter = numberings[i].letter;
        stickerToLetter[sticker] = letter;
    }

    const bufferSticker = numberings.filter(numbering => numbering.letter === '@')[0].sticker;

    let allParts;
    if (partType === constant.partType.corner) {
        allParts = utils.cornerParts;
    } else if (partType === constant.partType.edgeMiddle) {
        allParts = utils.edgeParts;
    } else {
        throw new Error(`unexpected partType: ${JSON.stringify(partType)}`);
    }

    const cornerPartsWithoutBuffer = allParts.filter(part => !numbering3.isBufferPart(bufferSticker, part));
    const randParts = shuffle(cornerPartsWithoutBuffer, { copy: true, });

    return randParts.map(part => {
        const arr = numbering3.getBlankStickers(part);
        arr.push(part);

        const sticker = shuffle.pick(arr);
        return stickerToLetter[sticker];
    }).join('');
};

export const generateRandomAnalysisDict = (numberingCorner, numberingEdge) => {
    const cornerStr = generateRandomAnalysisStrOfPart(numberingCorner, constant.partType.corner);
    const edgeStr = generateRandomAnalysisStrOfPart(numberingEdge, constant.partType.edgeMiddle);

    return {
        corner: cornerStr,
        edge: edgeStr,
    };
};

export const decksToElementsList = (decks) => {
    return decks.map(deck => {
        let ans = [];

        for (let i = 0; i < deck.length; i++) {
            const pair = deck[i];
            ans = ans.concat(pair);
        }

        return ans;
    });
};

export const generateMbldDeck = (analysisDict, pairSize) => {
    // FIXME コーナー → エッジの順にやる人にも対応する

    // MBLDは2文字で1イメージなのは固定
    const edgeWords = _.chunk(analysisDict.edge, 2).map(chars => chars.join(''));
    const edgePairs = _.chunk(edgeWords, pairSize);

    const cornerWords = _.chunk(analysisDict.corner, 2).map(chars => chars.join(''));
    const cornerPairs = _.chunk(cornerWords, pairSize);

    const tmpPairs = edgePairs.concat(cornerPairs);
    const pairs = tmpPairs.map(pair => {
        return pair.map(letters => new MbldElement(letters));
    });

    return pairs;
};

export const generateMbldDecks = (numberingCorner, numberingEdge, deckNum, pairSize) => {
    const decks = [];

    for (let i = 0; i < deckNum; i++) {
        const analysisDict = generateRandomAnalysisDict(numberingCorner, numberingEdge);
        const deck = generateMbldDeck(analysisDict, pairSize);
        decks.push(deck);
    }

    return decks;
};

// 1~52の数字をカードに変換する
// 0-51のインデックスを投入されると0が渡された時以外は気付けなくて不具合の原因となるので、
// この関数は外部からは使わせない
const numToCardElement = (oneTo52) => {
    if (oneTo52 < 1 || 52 < oneTo52) {
        throw new Error('Unexpected input');
    }

    const num = ((oneTo52 - 1) % 13) + 1;
    const suitInd = _.floor((oneTo52 - 1) / 13);

    const suit = (() => {
        if (suitInd === 0) {
            return Suit.club;
        } else if (suitInd === 1) {
            return Suit.diamond;
        } else if (suitInd === 2) {
            return Suit.heart;
        } else if (suitInd === 3) {
            return Suit.spade;
        } else {
            throw new Error(`Unexpected suitInd : ${suitInd}`);
        }
    })();

    return new CardElement(suit, num);
};

// 0-51のインデックスを投入されると0が渡された時以外は気付けなくて不具合の原因となるので、
// この関数は外部からは使わせない
const generateCardsDeck = (oneTo52nums, pairSize) => {
    const elements = oneTo52nums.map(num => numToCardElement(num));
    return _.chunk(elements, pairSize);
};

export const generateCardsDecks = (deckNum, deckSize, pairSize) => {
    const ans = [];

    for (let i = 0; i < deckNum; i++) {
        const allNums = _.range(1, 52 + 1);
        const shuffled = _.shuffle(allNums);
        const nums = _.take(shuffled, deckSize);
        const deck = generateCardsDeck(nums, pairSize);
        ans.push(deck);
    }

    return ans;
};

export const cardTagToMarkStr = (tag) => {
    const suitMarkDict = {
        C: String.fromCharCode(parseInt('2663', 16)),
        D: String.fromCharCode(parseInt('2666', 16)),
        H: String.fromCharCode(parseInt('2665', 16)),
        S: String.fromCharCode(parseInt('2660', 16)),
    };

    const num = parseInt(`${tag[2]}${tag[3]}`);
    const numStr = (() => {
        if (num === 1) {
            return 'A';
        } else if (2 <= num && num <= 10) {
            return `${num}`;
        } else if (num === 11) {
            return 'J';
        } else if (num === 12) {
            return 'Q';
        } else if (num === 13) {
            return 'K';
        } else {
            throw new Error(`Unexpected tag: ${tag}`);
        }
    })();
    return `${suitMarkDict[tag[0]]}${numStr}`;
};

export const cardsDefaultHand = () => {
    const ans = {};
    const elements = _.range(1, 52 + 1).map(num => numToCardElement(num));

    for (let i = 0; i < elements.length; i++) {
        ans[elements[i].tag] = true;
    }

    return ans;
};

export const getSameSuitCards = (suit) => {
    return _.range(1, 13 + 1).map(num => new CardElement(suit, num));
};

export const getHandElements = (suits) => {
    const cards = suits.map(suit => getSameSuitCards(suit));
    return _.flatten(cards);
};
