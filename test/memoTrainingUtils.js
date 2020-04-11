const assert = require('assert');
const memoTrainingUtils = require('../src/js/memoTrainingUtils.js');

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

        it('正常系: 終端', () => {
            const actual = memoTrainingUtils.getHoleNextCoordinate(decks, 1, 0, 1, solution);
            const expected = {
                deckInd: 1,
                pairInd: 0,
                posInd: 1,
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 空きを探して終端にたどり着いた', () => {
            const actual = memoTrainingUtils.getHoleNextCoordinate(decks, 1, 0, 0, solution);
            const expected = {
                deckInd: 1,
                pairInd: 0,
                posInd: 1,
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
    });
});
