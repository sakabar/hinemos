const _ = require('lodash');
const utils = require('./utils');
const numbering3 = require('./numbering3');
const shuffle = require('shuffle-array');
const constant = require('./constant');

export const MemoEvent = {
    mbld: 0,
    cards: 1,
};

export const ElementType = {
    letter: 0,
    card: 1,
};

export const TrainingMode = {
    memorization: 0,
    transformation: 1,
};

export const TrainingPhase = {
    setting: 0,
    memorization: 1,
    recall: 2,
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

export const postTrial = (elementDecks) => {
    console.dir(`post trial mock ${JSON.stringify(elementDecks)}`);

    const ans = {
        attemptId: 1,
        deckElements: [
            [ 1, 2, 3, 4, ],
            [ 5, 6, 7, 8, ],
        ],
    };

    console.dir(`post trial mock response ${ans}`);
    return new Promise((resolve) => resolve(ans));
};

export const postMemoLog = (s) => {
    console.dir(`memo log mock ${s}`);
};

export const postRecallLog = (s) => {
    console.dir(`recall log mock ${s}`);
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

export const mbldDecksToElementsList = (decks) => {
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
        // const allNums = _.range(1, 52 + 1).filter(i => i <= 14 || (27 <= i && i <= 39));
        const allNums = _.range(1, 52 + 1);
        const shuffled = _.shuffle(allNums);
        const nums = _.take(shuffled, deckSize);
        const deck = generateCardsDeck(nums, pairSize);
        console.dir(pairSize);
        console.dir(JSON.stringify(deck));
        ans.push(deck);
    }

    return ans;
};
