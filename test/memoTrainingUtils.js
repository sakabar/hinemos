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

    describe('mbldDecksToElementsList()', () => {
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

            const actual = memoTrainingUtils.mbldDecksToElementsList(decks);
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
});
