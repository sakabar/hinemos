const assert = require('assert');
const threeStyleNavigatorUtils = require('../src/js/threeStyleNavigatorUtils');

describe('threeStyleNavigatorUtils', () => {
    describe('isSameLayerMove()', () => {
        it('同じ面', () => {
            const move1 = 'Lw';
            const move2 = 'Lw2';
            const actual = threeStyleNavigatorUtils.isSameLayerMove(move1, move2);
            const expected = true;

            assert.deepStrictEqual(actual, expected);
        });

        it('同じ面だけど一層・二層が異なる場合はfalse', () => {
            const move1 = 'L';
            const move2 = 'Lw2';
            const actual = threeStyleNavigatorUtils.isSameLayerMove(move1, move2);
            const expected = false;

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('distanceSeq()', () => {
        it('正常系', () => {
            const seq1 = [ 'D', ];
            const seq2 = [ 'D', ];
            const actual = threeStyleNavigatorUtils.distanceSeq(seq1, seq2);
            const expected = 0.0;

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系', () => {
            const seq1 = [ 'D', ];
            const seq2 = [ 'D', 'R', ];
            const actual = threeStyleNavigatorUtils.distanceSeq(seq1, seq2);
            const expected = 1.0;

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系', () => {
            const seq1 = [ 'D', ];
            const seq2 = [ 'D2', 'R', ];
            const actual = threeStyleNavigatorUtils.distanceSeq(seq1, seq2);
            const expected = 1.5;

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('inverse()', () => {
        it('正常系', () => {
            const actual = threeStyleNavigatorUtils.inverse([ 'D', 'R\'', ]);
            const expected = [ 'R', 'D\'', ];
            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('factorize()', () => {
        it('正常系: うまく分解できる', () => {
            const sequence = [ 'D', 'R\'', 'U', 'R', 'D', 'R\'', 'U\'', 'R', 'D2', ];
            const actual = threeStyleNavigatorUtils.factorize(sequence);
            const expected = {
                setup: [ 'D', ],
                interchange: [ 'D', ],
                insert: [ 'R\'', 'U', 'R', ],
                isInterchangeFirst: false,
            };

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: うまく分解できる エッジでよくある [ S\', R2 ]', () => {
            const sequence = [ 'S\'', 'R2', 'S', 'R2', ];
            const actual = threeStyleNavigatorUtils.factorize(sequence);
            const expected = {
                setup: [],
                interchange: [ 'S\'', ],
                insert: [ 'R2', ],
                isInterchangeFirst: true,
            };

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: うまく分解できる エッジでよくある [ S\', R2 ]にセットアップが付いている', () => {
            const sequence = [ 'R', 'D', 'S\'', 'R2', 'S', 'R2', 'D\'', 'R\'', ];
            const actual = threeStyleNavigatorUtils.factorize(sequence);
            const expected = {
                setup: [ 'R', 'D', ],
                interchange: [ 'S\'', ],
                insert: [ 'R2', ],
                isInterchangeFirst: true,
            };

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: うまく分解できる ちょっと複雑1', () => {
            const sequence = [ 'R\'', 'F\'', 'S', 'R', 'U', 'M\'', 'U2', 'M', 'U', 'R\'', 'S\'', 'F', 'R', ];
            const actual = threeStyleNavigatorUtils.factorize(sequence);
            const expected = {
                setup: [ 'R\'', 'F\'', 'S', 'R', 'U', ],
                interchange: [ 'M\'', ],
                insert: [ 'U2', ],
                isInterchangeFirst: true,
            };

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: うまく分解できる ちょっと複雑2', () => {
            const sequence = [ 'Lw\'', 'U\'', 'Lw', 'U\'', 'M\'', 'U2', 'M', 'U\'', 'Lw\'', 'U', 'Lw', ];
            const actual = threeStyleNavigatorUtils.factorize(sequence);
            const expected = {
                setup: [ 'Lw\'', 'U\'', 'Lw', 'U\'', ],
                interchange: [ 'M\'', ],
                insert: [ 'U2', ],
                isInterchangeFirst: true,
            };

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('new Alg()', () => {
        it('正常系: setup, interchange, insertで生成', () => {
            const arg = {
                isSequence: false,
                setup: [ 'D', ],
                interchange: [ 'U', ],
                insert: [ 'R', 'D', 'R\'', ],
                isInterchangeFirst: true,
            };
            const alg = new threeStyleNavigatorUtils.Alg(arg);

            assert.deepStrictEqual(alg.setup, arg.setup);
            assert.deepStrictEqual(alg.interchange, arg.interchange);
            assert.deepStrictEqual(alg.insert, arg.insert);
            assert.deepStrictEqual(alg.isInterchangeFirst, arg.isInterchangeFirst);
            assert.deepStrictEqual(alg.isFactorized, true);
            assert.deepStrictEqual(alg.sequence, [ 'D', 'U', 'R', 'D', 'R\'', 'U\'', 'R', 'D\'', 'R\'', 'D\'', ]);
        });

        it('正常系: 引数として与えられたsequenceを因数分解', () => {
            const arg = {
                isSequence: true,
                sequence: [ 'D', 'U', 'R', 'D', 'R\'', 'U\'', 'R', 'D\'', 'R\'', 'D\'', ],
            };
            const alg = new threeStyleNavigatorUtils.Alg(arg);

            assert.deepStrictEqual(alg.setup, [ 'D', ]);
            assert.deepStrictEqual(alg.interchange, [ 'U', ]);
            assert.deepStrictEqual(alg.insert, [ 'R', 'D', 'R\'', ]);
            assert.deepStrictEqual(alg.isInterchangeFirst, true);
            assert.deepStrictEqual(alg.isFactorized, true);
            assert.deepStrictEqual(alg.sequence, [ 'D', 'U', 'R', 'D', 'R\'', 'U\'', 'R', 'D\'', 'R\'', 'D\'', ]);
        });

        it('正常系: 引数として与えられたsequenceを因数分解できなかった', () => {
            const arg = {
                isSequence: true,
                sequence: [ 'Uw2', 'M\'', 'Uw2', 'M\'', ],
            };
            const alg = new threeStyleNavigatorUtils.Alg(arg);

            assert.deepStrictEqual(alg.setup, []);
            assert.deepStrictEqual(alg.interchange, []);
            assert.deepStrictEqual(alg.insert, []);
            assert.deepStrictEqual(alg.isInterchangeFirst, false);
            assert.deepStrictEqual(alg.isFactorized, false);
            assert.deepStrictEqual(alg.sequence, arg.sequence);
        });
    });

    describe('distanceAlg()', () => {
        it('正常系', () => {
            const alg1 = new threeStyleNavigatorUtils.Alg({
                isSequence: false,
                setup: [ 'D', ],
                interchange: [ 'U', ],
                insert: [ 'R', 'D', 'R\'', ],
                isInterchangeFirst: true,
            });

            const alg2 = new threeStyleNavigatorUtils.Alg({
                isSequence: false,
                setup: [],
                interchange: [ 'U2', ],
                insert: [ 'R', 'D', 'R\'', ],
                isInterchangeFirst: false,
            });

            const actual = threeStyleNavigatorUtils.distanceAlg(alg1, alg2);
            const expected = 1.0 * 2 + 0.5 + 0 + 0.25;
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系', () => {
            const alg1 = new threeStyleNavigatorUtils.Alg({
                isSequence: true,
                sequence: [ 'U\'', 'Rw', 'F', 'R', 'F\'', 'Rw', 'U', 'R\'', ],
            });

            const alg2 = new threeStyleNavigatorUtils.Alg({
                isSequence: false,
                setup: [ 'U', 'R', ],
                interchange: [ 'U2', ],
                insert: [ 'R', 'D', 'R\'', ],
                isInterchangeFirst: false,
            });

            const actual = threeStyleNavigatorUtils.distanceAlg(alg1, alg2);
            const expected = 8.5;
            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('simplifyTwoMoves()', () => {
        it('正常系', () => {
            const actual = threeStyleNavigatorUtils.simplifyTwoMoves('D', 'D2');
            const expected = [ 'D\'', ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系', () => {
            const actual = threeStyleNavigatorUtils.simplifyTwoMoves('Lw', 'Lw2');
            const expected = [ 'Lw\'', ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系', () => {
            const actual = threeStyleNavigatorUtils.simplifyTwoMoves('E\'', 'E');
            const expected = [];

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('simplifySeq()', () => {
        it('正常系', () => {
            const actual = threeStyleNavigatorUtils.simplifySeq([ 'D', 'D2', ]);
            const expected = [ 'D\'', ];

            assert.deepStrictEqual(actual, expected);
        });

        it('打消し', () => {
            const actual = threeStyleNavigatorUtils.simplifySeq([ 'R2', 'R2', 'R2', 'R2', ]);
            const expected = [];

            assert.deepStrictEqual(actual, expected);
        });
    });
});
