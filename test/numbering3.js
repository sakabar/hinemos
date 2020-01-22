const assert = require('assert');
const numbering3 = require('../src/js/numbering3');

describe('numbering3.js', () => {
    describe('getBlankStickers()', () => {
        it('正常系: コーナー', () => {
            const actual = numbering3.getBlankStickers('UBL');
            const expected = [ 'BLU', 'LBU', ];
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: エッジ', () => {
            const actual = numbering3.getBlankStickers('UB');
            const expected = [ 'BU', ];
            assert.deepStrictEqual(actual, expected);
        });

        it('異常系: 入力文字数がステッカーではない', () => {
            const actual = () => numbering3.getBlankStickers('');
            assert.throws(actual, Error);
        });
    });

    describe('isBufferPart()', () => {
        it('正常系: コーナー true', () => {
            const actual = numbering3.isBufferPart('BLU', 'UBL');
            assert.deepStrictEqual(actual, true);
        });

        it('正常系: コーナー false', () => {
            const actual = numbering3.isBufferPart('UBL', 'UFR');
            assert.deepStrictEqual(actual, false);
        });

        it('正常系: エッジ true', () => {
            const actual = numbering3.isBufferPart('DF', 'DF');
            assert.deepStrictEqual(actual, true);
        });

        it('正常系: エッジ', () => {
            const actual = numbering3.isBufferPart('DF', 'FR');
            assert.deepStrictEqual(actual, false);
        });
    });
});
