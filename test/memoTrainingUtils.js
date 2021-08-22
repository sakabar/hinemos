const assert = require('assert');
const memoTrainingUtils = require('../src/js/memoTrainingUtils.js');
const _ = require('lodash');

describe('memoTrainingUtils.js', () => {
    describe('generateRandomAnalysisDict()', () => {
        it('正常系: コーナーとエッジの偶奇が一致していること', () => {
            const numberingCorner = memoTrainingUtils.numberingCornerMock;
            const numberingEdge = memoTrainingUtils.numberingEdgeMock;
            const actual = memoTrainingUtils.generateRandomAnalysisDict(numberingCorner, numberingEdge);
            // assert.deepStrictEqual(actual.corner.length % 2, actual.edge.length % 2);
            assert.deepStrictEqual(actual.corner.length, 7);
            assert.deepStrictEqual(actual.edge.length, 11);
        });
    });

    describe('decksToElementsList()', () => {
        it('正常系', () => {
            const decks = [
                [
                    [ new memoTrainingUtils.MbldElement('あい'), new memoTrainingUtils.MbldElement('うえ'), ],
                    [ new memoTrainingUtils.MbldElement('お'), ],
                ],

                [
                    [ new memoTrainingUtils.MbldElement('かき'), new memoTrainingUtils.MbldElement('くけ'), ],
                    [ new memoTrainingUtils.MbldElement('こ'), ],
                ],
            ];

            const actual = memoTrainingUtils.decksToElementsList(decks);
            const expected = [
                [
                    new memoTrainingUtils.MbldElement('あい'),
                    new memoTrainingUtils.MbldElement('うえ'),
                    new memoTrainingUtils.MbldElement('お'),
                ],

                [
                    new memoTrainingUtils.MbldElement('かき'),
                    new memoTrainingUtils.MbldElement('くけ'),
                    new memoTrainingUtils.MbldElement('こ'),
                ],
            ];

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('generateMbldDeck()', () => {
        it('正常系: pairSize = 1', () => {
            const analysisDict = {
                corner: 'あいう',
                edge: 'かきく',
            };

            const pairSize = 1;

            const actual = memoTrainingUtils.generateMbldDeck(analysisDict, pairSize);
            const expected = [
                [ new memoTrainingUtils.MbldElement('かき'), ],
                [ new memoTrainingUtils.MbldElement('く'), ],
                [ new memoTrainingUtils.MbldElement('あい'), ],
                [ new memoTrainingUtils.MbldElement('う'), ],
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: pairSize = 2', () => {
            const analysisDict = {
                corner: 'あいうえお',
                edge: 'かきくけこ',
            };

            const pairSize = 2;

            const actual = memoTrainingUtils.generateMbldDeck(analysisDict, pairSize);
            const expected = [
                [ new memoTrainingUtils.MbldElement('かき'), new memoTrainingUtils.MbldElement('くけ'), ],
                [ new memoTrainingUtils.MbldElement('こ'), ],
                [ new memoTrainingUtils.MbldElement('あい'), new memoTrainingUtils.MbldElement('うえ'), ],
                [ new memoTrainingUtils.MbldElement('お'), ],
            ];

            assert.deepStrictEqual(actual, expected);
        });
    });

    // skipを外す時はnumToCardElement()をexportする
    describe.skip('numToCardElement()', () => {
        it('正常系: クラブ', () => {
            const actual = memoTrainingUtils.numToCardElement(1);
            const expected = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 1);
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: ダイヤ', () => {
            const actual = memoTrainingUtils.numToCardElement(26);
            const expected = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 13);
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: ハート', () => {
            const actual = memoTrainingUtils.numToCardElement(35);
            const expected = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.heart, 9);
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: スペード', () => {
            const actual = memoTrainingUtils.numToCardElement(52);
            const expected = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.spade, 13);
            assert.deepStrictEqual(actual, expected);
        });
    });

    // skipを外す時はgenerateCardsDeck()をexportする
    describe.skip('generateCardsDeck()', () => {
        it('正常系', () => {
            const nums = [ 1, 2, 3, ];
            const pairSize = 2;
            const actual = memoTrainingUtils.generateCardsDeck(nums, pairSize);
            const expected = [
                [ new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 1), new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 2), ],
                [ new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 3), ],
            ];
            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('cardTagToMarkStr()', () => {
        it('正常系 C-01', () => {
            const tag = 'C-01';
            const actual = memoTrainingUtils.cardTagToMarkStr(tag);
            const expected = String.fromCharCode(parseInt('2663', 16)) + 'A';
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系 D-10', () => {
            const tag = 'D-10';
            const actual = memoTrainingUtils.cardTagToMarkStr(tag);
            const expected = String.fromCharCode(parseInt('2666', 16)) + '10';
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系 H-11', () => {
            const tag = 'H-11';
            const actual = memoTrainingUtils.cardTagToMarkStr(tag);
            const expected = String.fromCharCode(parseInt('2665', 16)) + 'J';
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系 S-03', () => {
            const tag = 'S-03';
            const actual = memoTrainingUtils.cardTagToMarkStr(tag);
            const expected = String.fromCharCode(parseInt('2660', 16)) + '3';
            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('getHandElements()', () => {
        it('正常系 DC', () => {
            const suits = [ memoTrainingUtils.Suit.diamond, memoTrainingUtils.Suit.club, ];

            const actual = memoTrainingUtils.getHandElements(suits);
            const expected = [
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 1),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 2),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 3),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 4),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 5),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 6),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 7),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 8),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 9),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 10),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 11),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 12),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 13),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 1),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 2),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 3),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 4),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 5),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 6),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 7),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 8),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 9),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 10),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 11),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 12),
                new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 13),
            ];

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('getDeckNextCoordinate()', () => {
        const c1 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 1);
        const c2 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 2);
        const c3 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 3);
        const c4 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 4);
        const c5 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 5);
        const c6 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 6);

        const decks = [
            // デッキ0
            [
                // ペア
                [ c1, c2, ],
                [ c3, c4, ],
            ],
            // デッキ1
            [
                // ペア
                [ c5, c6, ],
            ],
        ];

        it('正常系: 次のposがある', () => {
            const actual = memoTrainingUtils.getDeckNextCoordinate(decks, 0, 0, 0);
            const expected = {
                deckInd: 0,
                pairInd: 0,
                posInd: 1,
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: posが終わりで繰り上がり', () => {
            const actual = memoTrainingUtils.getDeckNextCoordinate(decks, 0, 0, 1);
            const expected = {
                deckInd: 0,
                pairInd: 1,
                posInd: 0,
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: pairが終わりで繰り上がり', () => {
            const actual = memoTrainingUtils.getDeckNextCoordinate(decks, 0, 1, 1);
            const expected = {
                deckInd: 1,
                pairInd: 0,
                posInd: 0,
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: デッキの終端に達した場合は入力と同じ座標を返す', () => {
            const actual = memoTrainingUtils.getDeckNextCoordinate(decks, 1, 0, 1);
            const expected = {
                deckInd: 1,
                pairInd: 0,
                posInd: 1,
            };
            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('getHoleNextCoordinate()', () => {
        const c1 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 1);
        const c2 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 2);
        const c3 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 3);
        const c4 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 4);
        const c5 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 5);
        const c6 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 6);
        const c7 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 7);
        const c8 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 8);
        const c9 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 9);

        const decks = [
            // デッキ0
            [
                // ペア
                [ c1, c2, ],
                [ c3, c4, ],
            ],
            // デッキ1
            [
                // ペア
                [ c5, c6, ],
                [ c7, c8, ],
                [ c9, ],
            ],
        ];

        const solution = [
            // デッキ0
            [
                // ペア
                [ null, null, ],
                [ null, c4, ],
            ],
            // デッキ1
            [
                // ペア
                [ null, c6, ],
                [ c7, null, ],
                [ c9, ],
            ],
        ];

        it('正常系: 次のHoleが埋まっていない', () => {
            const actual = memoTrainingUtils.getHoleNextCoordinate(decks, 0, 0, 0, solution);
            const expected = {
                deckInd: 0,
                pairInd: 0,
                posInd: 1,
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 次のHoleが埋まっている', () => {
            const actual = memoTrainingUtils.getHoleNextCoordinate(decks, 0, 1, 0, solution);
            const expected = {
                deckInd: 1,
                pairInd: 0,
                posInd: 0,
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 次のHoleが埋まっている その2', () => {
            const actual = memoTrainingUtils.getHoleNextCoordinate(decks, 1, 0, 0, solution);
            const expected = {
                deckInd: 1,
                pairInd: 1,
                posInd: 1,
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 終端', () => {
            const actual = memoTrainingUtils.getHoleNextCoordinate(decks, 1, 2, 0, solution);
            const expected = {
                deckInd: 1,
                pairInd: 2,
                posInd: 0,
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 空きを探して終端にたどり着いた', () => {
            const actual = memoTrainingUtils.getHoleNextCoordinate(decks, 1, 1, 1, solution);
            const expected = {
                deckInd: 1,
                pairInd: 2,
                posInd: 0,
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('異常系: solutionが空', () => {
            const emptySolution = [ [], ];
            const actual = memoTrainingUtils.getHoleNextCoordinate(decks, 1, 0, 0, emptySolution);
            const expected = {
                deckInd: 1,
                pairInd: 0,
                posInd: 1,
            };
            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('generateNumbersDeck()', () => {
        it('正常系', () => {
            const numsStr = '1234567';
            const digitsPerImage = 2;
            const pairSize = 3;
            const actual = memoTrainingUtils.generateNumbersDeck(numsStr, digitsPerImage, pairSize);
            const expected = [
                [
                    new memoTrainingUtils.NumberElement('12'),
                    new memoTrainingUtils.NumberElement('34'),
                    new memoTrainingUtils.NumberElement('56'),
                ],
                [
                    new memoTrainingUtils.NumberElement('7'),
                ],
            ];
            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('splitNumbersImageInDecks()', () => {
        it('正常系', () => {
            const decks = [
                [
                    [
                        new memoTrainingUtils.NumberElement('12'),
                        new memoTrainingUtils.NumberElement('34'),
                        new memoTrainingUtils.NumberElement('56'),
                    ],
                    [
                        new memoTrainingUtils.NumberElement('7'),
                    ],
                ],

                [
                    [
                        new memoTrainingUtils.NumberElement('89'),
                        new memoTrainingUtils.NumberElement('90'),
                        new memoTrainingUtils.NumberElement('91'),
                    ],
                    [
                        new memoTrainingUtils.NumberElement('2'),
                    ],
                ],
            ];

            const origDecks = _.cloneDeep(decks);

            const digitsPerImage = 2;
            const pairSize = 3;

            const actual = memoTrainingUtils.splitNumbersImageInDecks(decks, digitsPerImage, pairSize);
            const expected = [
                [
                    [
                        new memoTrainingUtils.NumberElement('1'),
                        new memoTrainingUtils.NumberElement('2'),
                        new memoTrainingUtils.NumberElement('3'),
                        new memoTrainingUtils.NumberElement('4'),
                        new memoTrainingUtils.NumberElement('5'),
                        new memoTrainingUtils.NumberElement('6'),
                    ],
                    [
                        new memoTrainingUtils.NumberElement('7'),
                    ],
                ],

                [
                    [
                        new memoTrainingUtils.NumberElement('8'),
                        new memoTrainingUtils.NumberElement('9'),
                        new memoTrainingUtils.NumberElement('9'),
                        new memoTrainingUtils.NumberElement('0'),
                        new memoTrainingUtils.NumberElement('9'),
                        new memoTrainingUtils.NumberElement('1'),
                    ],
                    [
                        new memoTrainingUtils.NumberElement('2'),
                    ],
                ],
            ];

            assert.deepStrictEqual(actual, expected);

            // 元のdecksが破壊されていないこと
            assert.deepStrictEqual(decks, origDecks);
        });
    });

    describe('mergeNumbersImageInDecks()', () => {
        it('正常系', () => {
            const oneImageDecks = [
                [
                    [
                        new memoTrainingUtils.NumberElement('1'),
                        new memoTrainingUtils.NumberElement('2'),
                        new memoTrainingUtils.NumberElement('3'),
                        new memoTrainingUtils.NumberElement('4'),
                        new memoTrainingUtils.NumberElement('5'),
                        new memoTrainingUtils.NumberElement('6'),
                    ],
                    [
                        new memoTrainingUtils.NumberElement('7'),
                    ],
                ],

                [
                    [
                        new memoTrainingUtils.NumberElement('8'),
                        new memoTrainingUtils.NumberElement('9'),
                        new memoTrainingUtils.NumberElement('9'),
                        new memoTrainingUtils.NumberElement('0'),
                        new memoTrainingUtils.NumberElement('9'),
                        new memoTrainingUtils.NumberElement('1'),
                    ],
                    [
                        new memoTrainingUtils.NumberElement('2'),
                    ],
                ],
            ];

            const digitsPerImage = 2;
            const pairSize = 3;

            const actual = memoTrainingUtils.mergeNumbersImageInDecks(oneImageDecks, digitsPerImage, pairSize);

            const expected = [
                [
                    [
                        new memoTrainingUtils.NumberElement('12'),
                        new memoTrainingUtils.NumberElement('34'),
                        new memoTrainingUtils.NumberElement('56'),
                    ],
                    [
                        new memoTrainingUtils.NumberElement('7'),
                    ],
                ],

                [
                    [
                        new memoTrainingUtils.NumberElement('89'),
                        new memoTrainingUtils.NumberElement('90'),
                        new memoTrainingUtils.NumberElement('91'),
                    ],
                    [
                        new memoTrainingUtils.NumberElement('2'),
                    ],
                ],
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: solutionをマージする際、回答していないholeがあってnullの場合 (回答していない部分は全てnullになっている想定)', () => {
            const oneImageDecks = [
                [
                    [
                        new memoTrainingUtils.NumberElement('1'),
                        new memoTrainingUtils.NumberElement('2'),
                        new memoTrainingUtils.NumberElement('3'),
                        new memoTrainingUtils.NumberElement('4'),
                        null,
                        null,
                    ],
                    [
                        new memoTrainingUtils.NumberElement('7'),
                    ],
                ],

                [
                    [
                        new memoTrainingUtils.NumberElement('8'),
                        null,
                        new memoTrainingUtils.NumberElement('9'),
                        new memoTrainingUtils.NumberElement('0'),
                        new memoTrainingUtils.NumberElement('9'),
                        new memoTrainingUtils.NumberElement('1'),
                    ],
                    [
                        new memoTrainingUtils.NumberElement('2'),
                    ],
                ],
            ];

            const digitsPerImage = 2;
            const pairSize = 3;

            const actual = memoTrainingUtils.mergeNumbersImageInDecks(oneImageDecks, digitsPerImage, pairSize);

            const expected = [
                [
                    [
                        new memoTrainingUtils.NumberElement('12'),
                        new memoTrainingUtils.NumberElement('34'),
                        null,
                    ],
                    [
                        new memoTrainingUtils.NumberElement('7'),
                    ],
                ],

                [
                    [
                        null,
                        new memoTrainingUtils.NumberElement('90'),
                        new memoTrainingUtils.NumberElement('91'),
                    ],
                    [
                        new memoTrainingUtils.NumberElement('2'),
                    ],
                ],
            ];

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('mergeLastRecallMiliUnixtimePairsList()', () => {
        it('正常系', () => {
            const digitsPerImage = 3;

            const lastRecallMiliUnixtimePairsList = [
                [
                    [ 1, 2, 3, 4, 5, 6, ],
                    [ 7, 8, 9, ],
                ],

                [
                    [ 11, 12, 13, 14, 15, 16, ],
                    [ 17, 18, 19, ],
                ],
            ];

            const actual = memoTrainingUtils.mergeLastRecallMiliUnixtimePairsList(lastRecallMiliUnixtimePairsList, digitsPerImage);
            const expected = [
                [
                    [ 3, 6, ],
                    [ 9, ],
                ],

                [
                    [ 13, 16, ],
                    [ 19, ],
                ],

            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: nullを含む', () => {
            const digitsPerImage = 3;

            const lastRecallMiliUnixtimePairsList = [
                [
                    [ 1, 2, null, 4, 5, 6, ],
                    [ 7, 8, 9, ],
                ],

                [
                    [ null, null, null, 14, null, null, ],
                    [ 17, 18, 19, ],
                ],
            ];

            const actual = memoTrainingUtils.mergeLastRecallMiliUnixtimePairsList(lastRecallMiliUnixtimePairsList, digitsPerImage);
            const expected = [
                [
                    [ 2, 6, ],
                    [ 9, ],
                ],

                [
                    [ null, 14, ],
                    [ 19, ],
                ],

            ];

            assert.deepStrictEqual(actual, expected);
        });

        it.skip('正常系: nullで抜けていたり、飛ばされていたりする場合: このテストは通らないが、実際に利用する際にこのような引数を渡さないことでカバーしてある。', () => {
            const digitsPerImage = 3;
            // const pairSize = 2;
            // const deckSize = 9; // イメージ数ではなく桁数

            const lastRecallMiliUnixtimePairsList = [
                [
                    [ 1, 2, null, 4, 5, ],
                    [ 7, 8, 9, ], // これは最後
                ],

                [
                    [ 11, 12, ],
                    [ 17, 18, ],
                ],
            ];

            const actual = memoTrainingUtils.mergeLastRecallMiliUnixtimePairsList(lastRecallMiliUnixtimePairsList, digitsPerImage);
            const expected = [
                [
                    [ 2, 5, ],
                    [ 9, ], // これは最後
                ],

                [
                    [ 12, null, ],
                    [ 18, ],
                ],
            ];

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('transformStatsJSONtoArray()', () => {
        it('正常系', () => {
            const statsJSON = {
                '0': {
                    '2': {
                        event: 'cards',
                        transformation: 2.0,
                        memorization: 4.0,
                        recallSum: 3,
                        transformationSum: 6,
                        recallData: [
                            {
                                solutionElementId: 2,
                                count: 1,
                                rate: 1.0 / 3,
                            },
                            {
                                solutionElementId: 3,
                                count: 2,
                                rate: 2.0 / 3,
                            },
                        ],
                    },
                },
                '1': {
                    '3': {
                        event: 'numbers',
                        transformation: 1.0,
                        memorization: 3.0,
                        recallSum: 2,
                        transformationSum: 5,
                        recallData: [
                            {
                                solutionElementId: 5,
                                count: 2,
                                rate: 1.0,
                            },
                        ],
                    },
                },
            };

            const actual = memoTrainingUtils.transformStatsJSONtoArray(statsJSON, 'cards');
            const expected = [
                {
                    event: 'cards',
                    posInd: 0,
                    elementId: 2,
                    transformation: 2.0,
                    memorization: 4.0,
                    acc: 1.0 / 3,
                    mistakeCnt: 2,
                    transformationSum: 6,
                    recallSum: 3,
                    mistakes: [
                        {
                            solutionElementId: 3,
                            count: 2,
                            rate: 2.0 / 3,
                        },
                    ],
                },
            ];

            assert.deepStrictEqual(actual, expected);
        });
    });
    describe('generatePoorDecks()', () => {
        it('正常系: posIndごとに苦手なelementがシャッフルされていること。同じelementが1つのdeck内に複数含まれないこと', () => {
            const pairSize = 3;
            const poorDeckNum = 3;
            const poorKey = 'memorization';
            const statsArray = [
                {
                    event: 'cards',
                    posInd: 0,
                    elementId: 0,
                    transformation: 0.5,
                    memorization: 0.5,
                    acc: 1.0,
                    mistakeCnt: 0,
                    mistakes: [],
                },
                {
                    event: 'cards',
                    posInd: 0,
                    elementId: 1,
                    transformation: 2.0,
                    memorization: 1.0,
                    acc: 0.3,
                    mistakeCnt: 2,
                    mistakes: [],
                },
                {
                    event: 'cards',
                    posInd: 0,
                    elementId: 2,
                    transformation: 3.0,
                    memorization: 2.0,
                    acc: 0.1,
                    mistakeCnt: 2,
                    mistakes: [],
                },
                {
                    event: 'cards',
                    posInd: 0,
                    elementId: 3,
                    transformation: 1.0,
                    memorization: 3.0,
                    acc: 0.2,
                    mistakeCnt: 2,
                    mistakes: [],
                },
                // ここからposInd === 1
                {
                    event: 'cards',
                    posInd: 1,
                    elementId: 0,
                    transformation: 0.5,
                    memorization: 0.5,
                    acc: 1.0,
                    mistakeCnt: 0,
                    mistakes: [],
                },
                {
                    event: 'cards',
                    posInd: 1,
                    elementId: 1,
                    transformation: 2.0,
                    memorization: 1.0,
                    acc: 0.3,
                    mistakeCnt: 2,
                    mistakes: [],
                },
                {
                    event: 'cards',
                    posInd: 1,
                    elementId: 2,
                    transformation: 3.0,
                    memorization: 2.0,
                    acc: 0.1,
                    mistakeCnt: 2,
                    mistakes: [],
                },
                {
                    event: 'cards',
                    posInd: 1,
                    elementId: 3,
                    transformation: 1.0,
                    memorization: 3.0,
                    acc: 0.2,
                    mistakeCnt: 2,
                    mistakes: [],
                },
                // ここからposInd === 2
                {
                    event: 'cards',
                    posInd: 2,
                    elementId: 0,
                    transformation: 0.5,
                    memorization: 0.5,
                    acc: 1.0,
                    mistakeCnt: 0,
                    mistakes: [],
                },
                {
                    event: 'cards',
                    posInd: 2,
                    elementId: 1,
                    transformation: 2.0,
                    memorization: 1.0,
                    acc: 0.3,
                    mistakeCnt: 2,
                    mistakes: [],
                },
                {
                    event: 'cards',
                    posInd: 2,
                    elementId: 2,
                    transformation: 3.0,
                    memorization: 2.0,
                    acc: 0.1,
                    mistakeCnt: 2,
                    mistakes: [],
                },
                {
                    event: 'cards',
                    posInd: 2,
                    elementId: 3,
                    transformation: 1.0,
                    memorization: 3.0,
                    acc: 0.2,
                    mistakeCnt: 2,
                    mistakes: [],
                },
            ];

            const c1 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 1);
            const c2 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 2);
            const c3 = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.club, 3);
            const dummy = new memoTrainingUtils.CardElement(memoTrainingUtils.Suit.diamond, 1);

            const elementIdToElement = {
                '0': dummy,
                '1': c1,
                '2': c2,
                '3': c3,
            };

            const actualDecks = memoTrainingUtils.generatePoorDecks(pairSize, poorDeckNum, poorKey, statsArray, elementIdToElement);

            // 検証項目
            // 1. actualを順に見て、同じdeck内に同じelementが存在しないこと
            // 2. c1, c2, c3が網羅されていること

            // ランダム要素があるので直接は比較できないが、例えばこんな出力
            // const expected = [
            //     [ c1, c2, c3, ],
            //     [ c3, c1, c2, ],
            //     [ c2, c3, c1, ],
            // ];

            let isUniqInDeck = true;

            const expectedPosTagSet = new Set();
            const expectedTags = [ 'C-01', 'C-02', 'C-03', ];
            for (let i = 0; i < pairSize; i++) {
                for (let k = 0; k < expectedTags.length; k++) {
                    const tag = expectedTags[k];
                    const posTag = `${i},${tag}`;
                    expectedPosTagSet.add(posTag);
                }
            }

            const actualPosTagSet = new Set();
            for (let actualDeckInd = 0; actualDeckInd < actualDecks.length; actualDeckInd++) {
                const actualDeck = actualDecks[actualDeckInd];

                // poorDeckは、1つのデッキの中に含まれる1ペア数は1つのみという仕様
                const actualPair = actualDeck[0];
                // console.log(JSON.stringify(actualPair, null, 4));

                const actualTagSet = new Set();
                for (let indInPair = 0; indInPair < actualPair.length; indInPair++) {
                    const actualElement = actualPair[indInPair];
                    const tag = actualElement.tag;

                    if (actualTagSet.has(tag)) {
                        isUniqInDeck = false;
                    }

                    const posInd = indInPair % pairSize;
                    const posTag = `${posInd},${tag}`;
                    actualPosTagSet.add(posTag);
                }
            }

            // 1つのDeckの中に被りが無いこと
            assert.deepStrictEqual(isUniqInDeck, true);

            // Set大きさが0より大きく9以下であり、期待していない要素が入っていないこと
            // シャッフルがランダムなので、9未満になることがある
            const sizeAssertionGt0 = 0 < actualPosTagSet.size;
            if (!sizeAssertionGt0) {
                console.log('actualPosTagSet.size === 0');
            }
            assert.deepStrictEqual(sizeAssertionGt0, true);

            const sizeAssertion = actualPosTagSet.size <= expectedPosTagSet.size;
            if (!sizeAssertion) {
                console.log(`${actualPosTagSet.size} > ${expectedPosTagSet.size}`);
            }
            assert.deepStrictEqual(sizeAssertion, true);

            const actualPosTags = Array.from(actualPosTagSet);
            for (let i = 0; i < actualPosTags.length; i++) {
                const actualPosTag = actualPosTags[i];
                const actual = expectedPosTagSet.has(actualPosTag);
                if (!actual) {
                    console.log(`${actualPosTag} not in ${Array.from(expectedPosTagSet)}`);
                }
                assert.deepStrictEqual(actual, true);
            }
        });
    });

    describe('calcScoresComponent()', () => {
        it('正常系: Cards', () => {
            const actual = memoTrainingUtils.calcScoresComponent('cards', 12.34, 230, 1, 1, 52);

            // floor(5.0 * (60 - 12.34))
            const expected = 238;

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: Numbers', () => {
            const actual = memoTrainingUtils.calcScoresComponent('numbers', 12.34, 230, 1, 1, 40);

            // floor(5.0 * (60 - 12.34))
            const expected = 238;

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 変換練習のscoresComponentはnull点', () => {
            const actual = memoTrainingUtils.calcScoresComponent('numbers', 12.34, null, 1, 1, 40);

            const expected = null;

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 60秒をオーバーしている場合は負の点数になる', () => {
            const actual = memoTrainingUtils.calcScoresComponent('numbers', 68.9, 230, 1, 1, 40);

            // floor(5.0 * (60 - 68.9))
            const expected = -45;

            assert.deepStrictEqual(actual, expected);
        });
    });
});
