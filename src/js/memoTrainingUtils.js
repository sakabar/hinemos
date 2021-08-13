const config = require('./config');
const constant = require('./constant');
const numbering3 = require('./numbering3');
const utils = require('./utils');
const _ = require('lodash');
const moment = require('moment-timezone');
const shuffle = require('shuffle-array');
const rp = require('request-promise');

export const MemoEvent = {
    mbld: 'mbld',
    cards: 'cards',
    numbers: 'numbers',
};

export const ElementType = {
    letter: 'letter',
    card: 'card',
    number: 'number',
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

// '00'を許容するため、文字列として格納
export function NumberElement (numberStr) {
    const type = ElementType.number;
    const size = numberStr.length;
    const tag = numberStr;

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

export async function loadElementIdToElement () {
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
        ans[element.elementId] = {
            type: element.type,
            tag: element.tag,
            length: element.length,
        };
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
            token: localStorage.token,
        },
    };

    return rp(options);
};

export const fetchScore = (userName, event, mode) => {
    const options = {
        url: `${config.apiRoot}/getMemoScore`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            userName,
            event,
            mode,
            token: localStorage.token,
        },
    };

    return rp(options);
};

export const requestFetchStats = (userName, event, startDate, endDate) => {
    const options = {
        url: `${config.apiRoot}/getMemoLogStats`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            userName,
            event,
            startDate: moment(startDate, 'YYYY/MM/DD').toISOString(),
            endDate: moment(endDate, 'YYYY/MM/DD').hour(23).minute(59).second(59).toISOString(),
            token: localStorage.token,
        },
    };

    return rp(options);
};

export const postTrial = (userName, event, mode, deckIds) => {
    const options = {
        url: `${config.apiRoot}/memoTrial`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            userName,
            event,
            mode,
            deckIds,
            token: localStorage.token,
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
        url: `${config.apiRoot}/postMemoLog`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            logs,
            token: localStorage.token,
        },
    };

    return rp(options);
};

export const postRecallLogs = (recallLogs) => {
    const logs = recallLogs.map((recallLog, i) => {
        return {
            ...recallLog,
            ind: i,
        };
    });

    const options = {
        url: `${config.apiRoot}/postRecallLog`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            logs,
            token: localStorage.token,
        },
    };

    return rp(options);
};

export const postMemoScore = (arg) => {
    const options = {
        url: `${config.apiRoot}/postMemoScore`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            ...arg,
            token: localStorage.token,
        },
    };

    return rp(options);
};

export const numberingCornerMock = [
    { userName: 'john', sticker: 'UBL', letter: '@', },
    { userName: 'john', sticker: 'UBR', letter: 'さ', },
    { userName: 'john', sticker: 'UFR', letter: 'あ', },
    { userName: 'john', sticker: 'UFL', letter: 'た', },
    { userName: 'john', sticker: 'RFU', letter: 'い', },
    { userName: 'john', sticker: 'RBU', letter: 'し', },
    { userName: 'john', sticker: 'RDF', letter: 'き', },
    { userName: 'john', sticker: 'RBD', letter: 'ひ', },
    { userName: 'john', sticker: 'LFU', letter: 'ち', },
    { userName: 'john', sticker: 'LBD', letter: 'み', },
    { userName: 'john', sticker: 'LDF', letter: 'に', },
    { userName: 'john', sticker: 'FLU', letter: 'つ', },
    { userName: 'john', sticker: 'FRU', letter: 'う', },
    { userName: 'john', sticker: 'FDL', letter: 'ぬ', },
    { userName: 'john', sticker: 'FDR', letter: 'く', },
    { userName: 'john', sticker: 'BRU', letter: 'す', },
    { userName: 'john', sticker: 'BDR', letter: 'ふ', },
    { userName: 'john', sticker: 'BDL', letter: 'む', },
    { userName: 'john', sticker: 'DFR', letter: 'か', },
    { userName: 'john', sticker: 'DFL', letter: 'な', },
    { userName: 'john', sticker: 'DBR', letter: 'は', },
    { userName: 'john', sticker: 'DBL', letter: 'ま', },
];

export const fetchNumberingCorner = (userName) => {
    const numberingCornerOptions = {
        url: `${config.apiRoot}/numbering/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(numberingCornerOptions)
        .then(ans => {
            return ans.success.result;
        });
};

export const numberingEdgeMock = [
    { userName: 'john', sticker: 'UR', letter: 'き', },
    { userName: 'john', sticker: 'UB', letter: 'す', },
    { userName: 'john', sticker: 'UL', letter: 'ち', },
    { userName: 'john', sticker: 'UF', letter: 'し', },
    { userName: 'john', sticker: 'RF', letter: 'あ', },
    { userName: 'john', sticker: 'RU', letter: 'い', },
    { userName: 'john', sticker: 'RB', letter: 'う', },
    { userName: 'john', sticker: 'RD', letter: 'え', },
    { userName: 'john', sticker: 'LF', letter: 'な', },
    { userName: 'john', sticker: 'LU', letter: 'に', },
    { userName: 'john', sticker: 'LB', letter: 'ぬ', },
    { userName: 'john', sticker: 'LD', letter: 'ね', },
    { userName: 'john', sticker: 'FU', letter: 'さ', },
    { userName: 'john', sticker: 'FR', letter: 'か', },
    { userName: 'john', sticker: 'FL', letter: 'た', },
    { userName: 'john', sticker: 'BR', letter: 'く', },
    { userName: 'john', sticker: 'BU', letter: 'せ', },
    { userName: 'john', sticker: 'BL', letter: 'つ', },
    { userName: 'john', sticker: 'BD', letter: 'そ', },
    { userName: 'john', sticker: 'DR', letter: 'け', },
    { userName: 'john', sticker: 'DF', letter: '@', },
    { userName: 'john', sticker: 'DL', letter: 'て', },
    { userName: 'john', sticker: 'DB', letter: 'ん', },
];

export const fetchNumberingEdge = (userName) => {
    const numberingEdgeOptions = {
        url: `${config.apiRoot}/numbering/edgeMiddle/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(numberingEdgeOptions)
        .then(ans => {
            return ans.success.result;
        });
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

export const generateNumbersDeck = (numsStr, digitsPerImage, pairSize) => {
    const digitsPerPair = pairSize * digitsPerImage;
    return _.chunk(numsStr, digitsPerPair).map(pairChars => {
        const pairStr = pairChars.join('');
        return _.chunk(pairStr, digitsPerImage).map(numChars => {
            const numStr = numChars.join('');
            return new NumberElement(numStr);
        });
    });
};

export const generateNumbersDecks = (deckNum, deckSize, digitsPerImage, pairSize, isUniqInDeck) => {
    const decks = [];

    for (let i = 0; i < deckNum; i++) {
        const numsStr = (() => {
            if (isUniqInDeck) {
                const numStrs = _.range(0, 10 ** digitsPerImage)
                    .map(num => {
                        return String(num).padStart(digitsPerImage, '0');
                    });
                const shuffled = _.shuffle(numStrs);
                const ans = shuffled.join('').slice(0, deckSize);

                if (ans.length !== deckSize) {
                    throw new Error(`${deckSize}桁を生成することができませんでした。値を小さくしてください`);
                }

                return ans;
            } else {
                // 完全ランダム
                return _.range(0, deckSize).map(num => String(_.random(0, 9))).join('');
            }
        })();

        const deck = generateNumbersDeck(numsStr, digitsPerImage, pairSize);

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

export const generatePoorDecks = (pairSize, poorDeckNum, poorKey, statsArray, elementIdToElement) => {
    // accの場合は昇順、それ以外は降順
    const sortedStatsArray = (() => {
        if (poorKey === 'acc') {
            return _.sortBy(statsArray.filter(rec => rec[poorKey] !== null), (rec) => { return rec[poorKey]; });
        } else {
            return _.sortBy(statsArray.filter(rec => rec[poorKey] !== null), (rec) => { return -rec[poorKey]; });
        }
    })();

    // posInd => poorStats
    const poorStatsDict = {};
    // 初期化
    for (let tmpPosInd = 0; tmpPosInd < pairSize; tmpPosInd++) {
        poorStatsDict[tmpPosInd] = [];
    }

    // posIndごとにpoorStatsDict[posInd]の中に入れていく
    for (let i = 0; i < sortedStatsArray.length; i++) {
        const stat = sortedStatsArray[i];
        const posInd = stat.posInd;

        // 普段2in1の人が気まぐれでPAOの練習をすると、statの中にはposInd=2のデータがある場合が考えられる
        // 2in1での練習の際には、このようなデータは無視
        if (posInd >= pairSize || poorStatsDict[posInd].length >= poorDeckNum) {
            continue;
        }

        poorStatsDict[posInd].push(stat);
        let allFilled = true;
        for (let tmpPosInd = 0; tmpPosInd < pairSize; tmpPosInd++) {
            allFilled = allFilled && poorStatsDict[tmpPosInd].length === poorDeckNum;
        }

        if (allFilled) {
            break;
        }
    }

    // posIndごとのpoorStatsのどれかがpoorDeckNum以下のまま全舐めしてループを抜けた可能性があるので、
    // poorDeckとしてはfillされた最少値を設定する
    const minPoorDeckNum = (() => {
        let minPoorDeckNum = poorStatsDict[0].length;
        for (let tmpPosInd = 0; tmpPosInd < pairSize; tmpPosInd++) {
            minPoorDeckNum = _.min([ minPoorDeckNum, poorStatsDict[tmpPosInd].length, ]);
        }
        return minPoorDeckNum;
    })();

    // サイズをminPoorDeckNumで揃えつつ、中身をシャッフルする
    for (let tmpPosInd = 0; tmpPosInd < pairSize; tmpPosInd++) {
        poorStatsDict[tmpPosInd] = _.shuffle(poorStatsDict[tmpPosInd].slice(0, minPoorDeckNum));
    }

    // 1つのペア内で重ならないようにしつつ選び取る
    // pop()の計算量をえて、poorStatsDict[tmpPosInd]の後ろから見ていく

    const ansDecks = [];
    for (let deckNumInd = 0; deckNumInd < minPoorDeckNum; deckNumInd++) {
        const pair = [];
        const tagSetInPair = new Set();

        for (let tmpPosInd = 0; tmpPosInd < pairSize; tmpPosInd++) {
            const skippedStatStack = [];

            // 注意! pop()する際の効率を考えて、後ろから見ていく
            while (poorStatsDict[tmpPosInd].length > 0) {
                const candStat = poorStatsDict[tmpPosInd].pop();
                const candElement = elementIdToElement[candStat.elementId];

                // pairを既に入っていなければ入れる
                if (tagSetInPair.has(candElement.tag)) {
                    // 被ってしまった場合 →次(前)を見る
                    skippedStatStack.push(candStat);
                    continue;
                } else {
                    // 被っていない場合
                    pair.push(candElement);
                    tagSetInPair.add(candElement.tag);

                    // skippedStatStackから元に戻す
                    while (skippedStatStack.length > 0) {
                        const st = skippedStatStack.pop();
                        poorStatsDict[tmpPosInd].push(st);
                    }

                    break;
                }
            }

            // ここに来た時に skippedStatStack が空ではない場合は、
            // 全ての候補を見ても被っていたので無理
            // 処理をここで止めてリターンする
            if (skippedStatStack.length > 0) {
                return ansDecks;
            }
        }

        if (pair.length === pairSize) {
            // 必ず1ペアのみのデッキとする
            const deck = [ pair, ];
            ansDecks.push(deck);
        } else {
            // 中途半端な状態になってしまったので
            // 処理をここで止めてリターンする
            return ansDecks;
        }
    }

    return ansDecks;
};

export const suitMarkDict = {
    C: String.fromCharCode(parseInt('2663', 16)),
    D: String.fromCharCode(parseInt('2666', 16)),
    H: String.fromCharCode(parseInt('2665', 16)),
    S: String.fromCharCode(parseInt('2660', 16)),
};

export const cardTagToMarkStr = (tag) => {
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

export const cardsDefaultHand = (deckNum) => {
    const ans = {};
    const elements = _.range(1, 52 + 1).map(num => numToCardElement(num));

    for (let deckInd = 0; deckInd < deckNum; deckInd++) {
        if (!ans[deckInd]) {
            ans[deckInd] = {};
        }
        for (let i = 0; i < elements.length; i++) {
            ans[deckInd][elements[i].tag] = true;
        }
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

// 今見ている deckInd, pairInd, posIndの次の座標を返す。
// デッキの終端に達した場合は同じ座標を返す
export const getDeckNextCoordinate = (decks, deckInd, pairInd, posInd) => {
    // posからpairへの繰り上がりが発生しない場合
    if (posInd < decks[deckInd][pairInd].length - 1) {
        return {
            deckInd,
            pairInd,
            posInd: posInd + 1,
        };
    }

    // 以下、posからpairへの繰り上がりが発生する場合

    // pairからdeckへの繰り上がりが発生しない場合
    if (pairInd < decks[deckInd].length - 1) {
        return {
            deckInd,
            pairInd: pairInd + 1,
            posInd: 0,
        };
    }

    // pairからdeckへの繰り上がりが発生し、次のデッキがある場合
    if (deckInd < decks.length - 1) {
        return {
            deckInd: deckInd + 1,
            pairInd: 0,
            posInd: 0,
        };
    }

    // 終端に達した場合は入力と同じ座標を返す
    return {
        deckInd,
        pairInd,
        posInd,
    };
};

// 次に空いているHoleの座標を返す
// デッキの終端に達した場合は同じ座標を返す
// そこから後ろが終端まで全て埋まっていた場合は終端の座標を返す
export const getHoleNextCoordinate = (decks, deckInd, pairInd, posInd, solution) => {
    const nextDeckCoordinate = getDeckNextCoordinate(decks, deckInd, pairInd, posInd);

    const nextDeckInd = nextDeckCoordinate.deckInd;
    const nextPairInd = nextDeckCoordinate.pairInd;
    const nextPosInd = nextDeckCoordinate.posInd;

    // getDeckNextCoordinateはデッキの終端に達した場合は同じ座標を返すので、
    // それを利用して条件判定し、デッキの終端に達した場合は同じ座標を返す
    if (nextDeckInd === deckInd && nextPairInd === pairInd && nextPosInd === posInd) {
        return nextDeckCoordinate;
    }

    // 次のholeが空いている場合はそれを返す
    if (!solution[nextDeckInd] || !solution[nextDeckInd][nextPairInd] || !solution[nextDeckInd][nextPairInd][nextPosInd]) {
        return nextDeckCoordinate;
    }

    // 次のholeが空いていない場合は、再帰でさらに次を探す
    return getHoleNextCoordinate(decks, nextDeckInd, nextPairInd, nextPosInd, solution);
};

// 数字記憶の画面に表示するために、decksを1桁1イメージに変換する
export const splitNumbersImageInDecks = (decks, digitsPerImage, pairSize) => {
    const newDigitsPerImage = 1;
    const newPairSize = digitsPerImage * pairSize;

    return decks.map(deck => {
        const deckStr = deck.map(pair => {
            return pair.map(element => {
                return element.tag;
            }).join('');
        }).join('');

        return generateNumbersDeck(deckStr, newDigitsPerImage, newPairSize);
    });
};

export const mergeNumbersImageInDecks = (decks, digitsPerImage, pairSize) => {
    return decks.map(deck => {
        return deck.map(pair => {
            return _.chunk(pair, digitsPerImage).map(digitsInImage => {
                if (digitsInImage.includes(null)) {
                    return null;
                } else {
                    const tag = digitsInImage.map(element => element.tag).join('');
                    return new NumberElement(tag);
                }
            });
        });
    });
};

export const mergeLastRecallMiliUnixtimePairsList = (lastRecallMiliUnixtimePairsList, digitsPerImage) => {
    return lastRecallMiliUnixtimePairsList.map(deck => {
        return deck.map(pair => {
            return _.chunk(pair, digitsPerImage).map(digitsInImage => {
                const tmpMax = _.max(digitsInImage);

                // digitsInImageの要素が全てnullの場合は、値がundefinedになる
                // この場合に、nullに直す。
                // 配列中の不明値はundefinedではなくnullとする想定でコーディングしている
                return tmpMax || null;
            });
        });
    });
};

export const transformStatsJSONtoArray = (statsJSON, event) => {
    const stats = [];

    const posInds = Object.keys(statsJSON);
    for (let i = 0; i < posInds.length; i++) {
        const posInd = posInds[i];
        const posObj = statsJSON[posInd];

        const elementIds = Object.keys(posObj);
        for (let k = 0; k < elementIds.length; k++) {
            const elementId = elementIds[k];
            const posElementObj = posObj[elementId];

            const recEvent = posElementObj.event;
            if (recEvent !== event) {
                continue;
            }

            const transformation = posElementObj.transformation;
            const memorization = posElementObj.memorization;
            const recallSum = posElementObj.recallSum;
            const recallData = posElementObj.recallData;

            const sortedRecallData = _.sortBy(recallData, (rec) => { return -rec.count; });

            let acc = 0.0;
            let mistakeCnt = recallSum;
            const mistakes = [];

            for (let n = 0; n < sortedRecallData.length; n++) {
                const recallDatum = sortedRecallData[n];

                const solutionElementId = recallDatum.solutionElementId;
                const count = recallDatum.count;
                const rate = recallDatum.rate;

                if (solutionElementId === parseInt(elementId)) {
                    acc = rate;
                    mistakeCnt -= count;
                    continue;
                } else {
                    mistakes.push(recallDatum);
                }

                if (mistakes.length >= 3) {
                    break;
                }
            }

            const rec = {
                event: recEvent,
                posInd: parseInt(posInd),
                elementId: parseInt(elementId),
                transformation,
                memorization,
                acc,
                recallSum,
                mistakeCnt,
                mistakes,
            };

            stats.push(rec);
        }
    }
    return stats;
};
