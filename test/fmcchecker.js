// fmcchecker.js本体は他人のコードを利用しているが、
// このテストコードは引用物ではない。
const assert = require('assert');
const fmcchecker = require('../src/js/fmcchecker');
const threeStyleNavigatorUtils = require('../src/js/threeStyleNavigatorUtils');

describe('fmcchecker', () => {
    describe('convAlg()', () => {
        it('正常系', () => {
            const s = 'S Lw\' U\' Lw S\' Lw\' U Lw';
            const convedSeq = fmcchecker.convAlg(s).split(' ');
            const actual = threeStyleNavigatorUtils.simplifySeq(convedSeq).join(' ');
            const expected = 'S R\' F\' R S\' R\' F R';

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系', () => {
            const s = 'Lw\' U\' Lw';
            const convedSeq = fmcchecker.convAlg(s).split(' ');
            const actual = threeStyleNavigatorUtils.simplifySeq(convedSeq).join(' ');
            const expected = 'R\' F\' R';

            assert.deepStrictEqual(actual, expected);
        });

        it('変換してから足したもの !== 足してから変換したもの', () => {
            const s1 = 'Lw\' U\'';
            const s2 = 'Lw B';
            const convedSeq1 = fmcchecker.convAlg(s1).split(' ');
            const convedSeq2 = fmcchecker.convAlg(s2).split(' ');
            const actual1 = threeStyleNavigatorUtils.simplifySeq(convedSeq1.concat(convedSeq2)).join(' ');

            const s = 'Lw\' U\' Lw B';
            const convedSeq = fmcchecker.convAlg(s).split(' ');
            const actual2 = threeStyleNavigatorUtils.simplifySeq(convedSeq).join(' ');

            assert.notStrictEqual(actual1, 'R\' F\' R B');
            assert.deepStrictEqual(actual2, 'R\' F\' R B');
        });
    });
});
