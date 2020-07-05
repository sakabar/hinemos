const assert = require('assert');
const threeStyleNavigatorUtils = require('../src/js/threeStyleNavigatorUtils');
const { Matrix, } = require('ml-matrix');
const { agnes, } = require('ml-hclust');

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
                letters: 'あい',
            };
            const alg = new threeStyleNavigatorUtils.Alg(arg);

            assert.deepStrictEqual(alg.setup, arg.setup);
            assert.deepStrictEqual(alg.revSetup, [ 'D', ]);
            assert.deepStrictEqual(alg.interchange, arg.interchange);
            assert.deepStrictEqual(alg.insert, arg.insert);
            assert.deepStrictEqual(alg.isInterchangeFirst, arg.isInterchangeFirst);
            assert.deepStrictEqual(alg.isFactorized, true);
            assert.deepStrictEqual(alg.sequence, [ 'D', 'U', 'R', 'D', 'R\'', 'U\'', 'R', 'D\'', 'R\'', 'D\'', ]);
            assert.deepStrictEqual(alg.letters, 'あい');
        });

        it('正常系: setup, interchange, insertで生成: ちょっと複雑', () => {
            const arg = {
                isSequence: false,
                setup: [ 'R2', ],
                interchange: [ 'U', ],
                insert: [ 'R2', 'D', 'R2', 'D\'', 'R2', ],
                isInterchangeFirst: false,
            };
            const alg = new threeStyleNavigatorUtils.Alg(arg);

            assert.deepStrictEqual(alg.setup, arg.setup);
            assert.deepStrictEqual(alg.revSetup, arg.setup);
            assert.deepStrictEqual(alg.interchange, arg.interchange);
            assert.deepStrictEqual(alg.insert, arg.insert);
            assert.deepStrictEqual(alg.isInterchangeFirst, arg.isInterchangeFirst);
            assert.deepStrictEqual(alg.isFactorized, true);
            assert.deepStrictEqual(alg.sequence, [ 'D', 'R2', 'D\'', 'R2', 'U', 'R2', 'D', 'R2', 'D\'', 'R2', 'U\'', 'R2', ]);
        });

        it('正常系: 引数として与えられたsequenceを因数分解', () => {
            const arg = {
                isSequence: true,
                sequence: [ 'D', 'U', 'R', 'D', 'R\'', 'U\'', 'R', 'D\'', 'R\'', 'D\'', ],
            };
            const alg = new threeStyleNavigatorUtils.Alg(arg);

            assert.deepStrictEqual(alg.setup, [ 'D', ]);
            assert.deepStrictEqual(alg.revSetup, [ 'D', ]);
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
            assert.deepStrictEqual(alg.revSetup, []);
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
            const expected = 9.0;
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

    describe('extractBasicAlgs()', () => {
        it('正常系', () => {
            const inputAlgs = [
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あい',
                }),
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'L', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あう',
                }),
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'ひあ',
                }),
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: true,
                    letters: 'いあ',
                }),
            ];

            const actual = threeStyleNavigatorUtils.extractBasicAlgs(inputAlgs);
            const expectedBasicAlgs = [
                // セットアップなし
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'ひあ',
                }),

                // セットアップがあるが、他に候補が無い
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: true,
                    letters: 'いあ',
                }),
            ];

            const expectedSimilarAlgsDict = {
                'R D R\',U2': [
                    {
                        setup: '',
                        revSetup: '',
                        setupMoveCnt: 0,
                        alg: new threeStyleNavigatorUtils.Alg({
                            isSequence: false,
                            setup: [],
                            interchange: [ 'U2', ],
                            insert: [ 'R', 'D', 'R\'', ],
                            isInterchangeFirst: false,
                            letters: 'ひあ',
                        }),
                    },

                    {
                        setup: 'U L',
                        revSetup: 'L U',
                        setupMoveCnt: 2,
                        alg: new threeStyleNavigatorUtils.Alg({
                            isSequence: false,
                            setup: [ 'U', 'L', ],
                            interchange: [ 'U2', ],
                            insert: [ 'R', 'D', 'R\'', ],
                            isInterchangeFirst: false,
                            letters: 'あう',
                        }),
                    },

                    {
                        setup: 'U R',
                        revSetup: 'R U',
                        setupMoveCnt: 2,
                        alg: new threeStyleNavigatorUtils.Alg({
                            isSequence: false,
                            setup: [ 'U', 'R', ],
                            interchange: [ 'U2', ],
                            insert: [ 'R', 'D', 'R\'', ],
                            isInterchangeFirst: false,
                            letters: 'あい',
                        }),
                    },
                ],

                'U2,R D R\'': [
                    {
                        setup: 'U R',
                        revSetup: 'R U',
                        setupMoveCnt: 2,
                        alg: new threeStyleNavigatorUtils.Alg({
                            isSequence: false,
                            setup: [ 'U', 'R', ],
                            interchange: [ 'U2', ],
                            insert: [ 'R', 'D', 'R\'', ],
                            isInterchangeFirst: true,
                            letters: 'いあ',
                        }),
                    },
                ],
            };

            assert.deepStrictEqual(actual.basicAlgs, expectedBasicAlgs);
            assert.deepStrictEqual(actual.similarAlgsDict, expectedSimilarAlgsDict);
        });

        it('正常系: 因数分解できた手順を優先', () => {
            const inputAlgs = [
                // 8手だが因数分解できない
                new threeStyleNavigatorUtils.Alg({
                    isSequence: true,
                    sequence: [ 'F\'', 'Rw', 'U', 'R\'', 'U\'', 'L\'', 'U', 'Lw', ],
                    letters: 'あい',
                }),

                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'いあ',
                }),
            ];

            const actual = threeStyleNavigatorUtils.extractBasicAlgs(inputAlgs);
            const expectedBasicAlgs = [
                // 因数分解できた手順が優先される
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'いあ',
                }),

                // 8手だが因数分解できない
                new threeStyleNavigatorUtils.Alg({
                    isSequence: true,
                    sequence: [ 'F\'', 'Rw', 'U', 'R\'', 'U\'', 'L\'', 'U', 'Lw', ],
                    letters: 'あい',
                }),
            ];

            assert.deepStrictEqual(actual.basicAlgs, expectedBasicAlgs);
            // actual.similarAlgsについては今回興味がないので確認しない
        });
    });

    describe('addBinaryLabels()', () => {
        it('正常系', () => {
            const rawData = [
                [ 0, 1, 1.5, ],
                [ 1, 0, 2.0, ],
                [ 1.5, 2.0, 0, ],
            ];

            const data = new Matrix(rawData);

            // (node 2 (node 0 1))
            const tree = agnes(data, {
                method: 'average',
                isDistanceMatrix: true,
            });

            const maxDepth = threeStyleNavigatorUtils.calcDepth(tree);
            threeStyleNavigatorUtils.addBinaryLabels(tree, maxDepth);

            assert.deepStrictEqual(tree.binaryLabel, '');
            assert.deepStrictEqual(tree.children[0].binaryLabel, '10');
            assert.deepStrictEqual(tree.children[1].children[0].binaryLabel, '01');
            assert.deepStrictEqual(tree.children[1].children[1].binaryLabel, '11');
        });
    });

    describe('isAncestor()', () => {
        it('sequence', () => {
            const alg1 = new threeStyleNavigatorUtils.Alg({
                isSequence: false,
                setup: [ 'U', 'R', ],
                interchange: [ 'U2', ],
                insert: [ 'R', 'D', 'R\'', ],
                isInterchangeFirst: false,
                letters: 'あい',
            });

            const alg2 = new threeStyleNavigatorUtils.Alg({
                isSequence: true,
                sequence: [ 'D', 'U', 'M', ],
                letters: 'あえ',
            });

            const actual = threeStyleNavigatorUtils.isAncestor(alg1, alg2);
            assert.deepStrictEqual(actual, false);
        });

        it('insert, intechangeの順番が違う', () => {
            const alg1 = new threeStyleNavigatorUtils.Alg({
                isSequence: false,
                setup: [ 'U', 'R', ],
                interchange: [ 'U2', ],
                insert: [ 'R', 'D', 'R\'', ],
                isInterchangeFirst: true, // ここ
            });

            const alg2 = new threeStyleNavigatorUtils.Alg({
                isSequence: false,
                setup: [ 'U', 'R', ],
                interchange: [ 'U2', ],
                insert: [ 'R', 'D', 'R\'', ],
                isInterchangeFirst: false, // ここ
            });

            const actual = threeStyleNavigatorUtils.isAncestor(alg1, alg2);
            assert.deepStrictEqual(actual, false);
        });

        it('trueとなる場合', () => {
            const alg1 = new threeStyleNavigatorUtils.Alg({
                isSequence: false,
                setup: [ 'U', 'R', ],
                interchange: [ 'U2', ],
                insert: [ 'R', 'D', 'R\'', ],
                isInterchangeFirst: true,
            });

            const alg2 = new threeStyleNavigatorUtils.Alg({
                isSequence: false,
                setup: [ 'D', 'U', 'R', ],
                interchange: [ 'U2', ],
                insert: [ 'R', 'D', 'R\'', ],
                isInterchangeFirst: true,
            });

            const actual = threeStyleNavigatorUtils.isAncestor(alg1, alg2);
            assert.deepStrictEqual(actual, true);
        });
    });

    describe('orderAlgsByEasiness()', () => {
        it('正常系: 掘り進める順番と、pure-comじゃないbasicAlgのスキップ確認', () => {
            const inputAlgs = [
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あえ',
                }),
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'L', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あう',
                }),
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あい',
                }),
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: true,
                    letters: 'いあ',
                }),
            ];

            const actual = threeStyleNavigatorUtils.orderAlgsByEasiness(inputAlgs);
            const expected = [
                // pure
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あい',
                }),

                // 2手セットアップ、アルファベット順なので 'U R'の「あえ」より先
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'L', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あう',
                }),

                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あえ',
                }),

                // basicAlgsに入っているが、[U2, R D R']のpure-comが無いので、後回しにされる
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: true,
                    letters: 'いあ',
                }),
            ];

            assert.deepStrictEqual(actual.length, inputAlgs.length);
            assert.deepStrictEqual(actual.map(r => r.alg), expected);
        });

        it('正常系: 無限ループにならないように、前回のローテで手順が選ばれなかった場合にはpure-comじゃないbasicAlgが採用されること', () => {
            const inputAlgs = [
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あえ',
                }),
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'L', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あう',
                }),
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あい',
                }),
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', 'L', 'D', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: true,
                    letters: 'いあ',
                }),
            ];

            const actual = threeStyleNavigatorUtils.orderAlgsByEasiness(inputAlgs);
            const expected = [
                // pure
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あい',
                }),

                // 2手セットアップ、アルファベット順なので 'U R'の「あえ」より先
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'L', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あう',
                }),

                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'あえ',
                }),

                // basicAlgsに入っているが、[U2, R D R']のpure-comが無いので、後回しにされる
                // キャンセルを考慮して16手なので、「あう」の後にも選べない
                // 1回ローテを空回しして、それで何も選ばれないので次に選ばれるようになる
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [ 'U', 'R', 'L', 'D', ],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: true,
                    letters: 'いあ',
                }),

            ];

            assert.deepStrictEqual(actual.length, inputAlgs.length);
            assert.deepStrictEqual(actual.map(r => r.alg), expected);
        });

        it('正常系: 因数分解できた手順を優先', () => {
            const inputAlgs = [
                // 8手だが因数分解できない
                new threeStyleNavigatorUtils.Alg({
                    isSequence: true,
                    sequence: [ 'F\'', 'Rw', 'U', 'R\'', 'U\'', 'L\'', 'U', 'Lw', ],
                    letters: 'あい',
                }),

                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'いあ',
                }),
            ];

            const actual = threeStyleNavigatorUtils.orderAlgsByEasiness(inputAlgs);
            const expected = [
                // 因数分解できた手順が優先される
                new threeStyleNavigatorUtils.Alg({
                    isSequence: false,
                    setup: [],
                    interchange: [ 'U2', ],
                    insert: [ 'R', 'D', 'R\'', ],
                    isInterchangeFirst: false,
                    letters: 'いあ',
                }),

                // 8手だが因数分解できない
                new threeStyleNavigatorUtils.Alg({
                    isSequence: true,
                    sequence: [ 'F\'', 'Rw', 'U', 'R\'', 'U\'', 'L\'', 'U', 'Lw', ],
                    letters: 'あい',
                }),
            ];

            assert.deepStrictEqual(actual.length, inputAlgs.length);
            assert.deepStrictEqual(actual.map(r => r.alg), expected);
        });
    });
});
