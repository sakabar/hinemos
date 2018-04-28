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

    describe('getThreeStyleType()', () => {
        it('正常系: pure', () => {
            assert.deepEqual(utils.getThreeStyleType('[U, R D R\']'), utils.threeStyleType.pure);
        });

        it('正常系: setup', () => {
            assert.deepEqual(utils.getThreeStyleType('[U D, [U D, R D R\']]'), utils.threeStyleType.setup);
        });

        it('正常系: seq', () => {
            assert.deepEqual(utils.getThreeStyleType('[Rw\' L]'), utils.threeStyleType.seq);
        });

        it('異常系: パースに失敗した場合はエラー', () => {
            const actual = () => utils.getThreeStyleType('[');
            assert.throws(actual, Error);
        });
    });

    describe('readThreeStyleCorners()', () => {
        it('正常系: 入力文字列が空', () => {
            assert.deepEqual(utils.readThreeStyleCorners(''), []);
        });

        // it('正常系: pure [R, L]', () => {
        //     assert.deepEqual(utils.readThreeStyleCorners('[R, L]'), []);
        // });

        it('異常系: パースに失敗した場合はエラー', () => {
            const actual = () => utils.readThreeStyleCorners('[');
            assert.throws(actual, Error);
        });
    });
});
