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
});
