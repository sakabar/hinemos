const assert = require('assert');
const utils = require('../src/js/utils');

describe('utils.js', () => {
    describe('showMove', () => {
        it('正常系: setupが空の場合', () => {
            assert.equal(utils.showMove('', 'U', 'R D R\''), '[U, R D R\']');
        });

        it('正常系: setupが空ではない場合', () => {
            assert.equal(utils.showMove('D', 'U', 'R D R\''), 'D, [U, R D R\']');
        });

        it('正常系: setupのみの場合 (cyclic shift)', () => {
            assert.equal(utils.showMove('D Rw2 U R U\' Rw2 D R\' D2', '', ''), 'D Rw2 U R U\' Rw2 D R\' D2');
        });
    });
});

