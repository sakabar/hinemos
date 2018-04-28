const assert = require('assert');
const utils = require('../src/js/utils');

describe('utils.js', () => {
    describe('showMove', () => {
        it('正常系: setupが空の場合', () => {
            assert.deepEqual(utils.showMove('', 'U', 'R D R\''), '[U, R D R\']');
        });

        it('正常系: setupが空ではない場合', () => {
            assert.deepEqual(utils.showMove('D', 'U', 'R D R\''), '[D, [U, R D R\']]');
        });

        it('正常系: setupのみの場合 (cyclic shift)', () => {
            assert.deepEqual(utils.showMove('D Rw2 U R U\' Rw2 D R\' D2', '', ''), '[D Rw2 U R U\' Rw2 D R\' D2]');
        });
    });

    describe('strMax()', () => {
        it('正常系 左 > 右', () => {
            const actual = utils.strMax('b', 'aa');
            const expected = 'b';
            assert.deepEqual(actual, expected);
        });

        it('正常系 左 = 右', () => {
            const actual = utils.strMax('a', 'a');
            const expected = 'a';
            assert.deepEqual(actual, expected);
        });

        it('正常系 左 < 右', () => {
            const actual = utils.strMax('aa', 'b');
            const expected = 'b';
            assert.deepEqual(actual, expected);
        });
    });

    describe('strMin()', () => {
        it('正常系 左 > 右', () => {
            const actual = utils.strMin('b', 'aa');
            const expected = 'aa';
            assert.deepEqual(actual, expected);
        });

        it('正常系 左 = 右', () => {
            const actual = utils.strMin('a', 'a');
            const expected = 'a';
            assert.deepEqual(actual, expected);
        });

        it('正常系 左 < 右', () => {
            const actual = utils.strMin('aa', 'b');
            const expected = 'aa';
            assert.deepEqual(actual, expected);
        });
    });

    describe('isInSameParts()', () => {
        it('正常系: True', () => {
            const actual = utils.isInSameParts('UBL', 'BLU');
            assert.deepEqual(actual, true);
        });

        it('正常系: False', () => {
            const actual = utils.isInSameParts('UBL', 'FDR');
            assert.deepEqual(actual, false);
        });
    });
});
