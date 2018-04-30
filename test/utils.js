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

    describe('isValidMoves()', () => {
        it('正常系: True : U (90度回転)', () => {
            assert.deepEqual(utils.isValidMoves('U'), true);
        });

        it('正常系: True : U2 (180度回転)', () => {
            assert.deepEqual(utils.isValidMoves('U2'), true);
        });

        it('正常系: True : U\'2 (180度回転は反時計回りでもOK)', () => {
            assert.deepEqual(utils.isValidMoves('U\'2'), true);
        });

        it('正常系: True : Uw (2層回し)', () => {
            assert.deepEqual(utils.isValidMoves('Uw'), true);
        });

        it('正常系: True : R\' U R (一連の手順)', () => {
            assert.deepEqual(utils.isValidMoves('R\' U R'), true);
        });

        it('正常系: False: \'\' 入力文字列が空', () => {
            assert.deepEqual(utils.isValidMoves(''), false);
        });

        it('正常系: False: r (右中列)', () => {
            assert.deepEqual(utils.isValidMoves('r'), false);
        });

        it('正常系: False: Ew (スライス2層)', () => {
            assert.deepEqual(utils.isValidMoves('Ew'), false);
        });

        it('正常系: False: Mw (スライス2層)', () => {
            assert.deepEqual(utils.isValidMoves('Mw'), false);
        });

        it('正常系: False: Sw (スライス2層)', () => {
            assert.deepEqual(utils.isValidMoves('Sw'), false);
        });

        it('正常系: False: R\', U, R (コンマは入らない)', () => {
            assert.deepEqual(utils.isValidMoves('R\', U, R'), false);
        });

        it('正常系: False:  R (先頭にスペース)', () => {
            assert.deepEqual(utils.isValidMoves(' R'), false);
        });

        it('正常系: False: R  U (スペース2つ)', () => {
            assert.deepEqual(utils.isValidMoves('R  U'), false);
        });
    });

    describe('makeThreeStyle()', () => {
        it('正常系: ', () => {
            const actual = utils.makeThreeStyle('UBL', 'URF', 'RDF', '', 'U2', 'R\' D\' R');
            const expected = {
                buffer: 'UBL',
                sticker1: 'UFR',
                sticker2: 'RDF',
                setup: '',
                move1: 'U2',
                move2: 'R\' D\' R',
            };

            assert.deepEqual(actual, expected);
        });

        it('正常系: プライムらしき文字は変換する', () => {
            const actual = utils.makeThreeStyle('UBL', 'URF', 'RDF', '', 'U2', 'R’ D\' R');
            const expected = {
                buffer: 'UBL',
                sticker1: 'UFR',
                sticker2: 'RDF',
                setup: '',
                move1: 'U2',
                move2: 'R\' D\' R',
            };

            assert.deepEqual(actual, expected);
        });

        it('異常系: move1のみが空', () => {
            const actual = () => utils.makeThreeStyle('UBL', 'URF', 'RDF', 'Mw', '', 'R\' D\' R');
            assert.throws(actual, Error);
        });

        it('異常系: セットアップが正しい記法ではない', () => {
            const actual = () => utils.makeThreeStyle('UBL', 'URF', 'RDF', 'Mw', 'U2', 'R\' D\' R');
            assert.throws(actual, Error);
        });
    });

    describe('sortSticker()', () => {
        it('正常系: コーナー UFR => UFR', () => {
            assert.deepEqual(utils.sortSticker('UFR'), 'UFR');
        });

        it('正常系: コーナー URF => UFR', () => {
            assert.deepEqual(utils.sortSticker('URF'), 'UFR');
        });

        it('正常系: エッジ   UR => UR', () => {
            assert.deepEqual(utils.sortSticker('UR'), 'UR');
        });

        it('異常系: ステッカーが2文字でも3文字でもない', () => {
            const actual = () => utils.sortSticker('URFD');
            assert.throws(actual, Error);
        });
    });

    describe('getThreeStyleType()', () => {
        it('正常系: pure', () => {
            assert.deepEqual(utils.getThreeStyleType('[U, R D R\']'), utils.ThreeStyleType.pure);
        });

        it('正常系: setup', () => {
            assert.deepEqual(utils.getThreeStyleType('[U D, [U D, R D R\']]'), utils.ThreeStyleType.setup);
        });

        it('正常系: seq', () => {
            assert.deepEqual(utils.getThreeStyleType('[Rw\' L]'), utils.ThreeStyleType.seq);
        });

        it('正常系: プライムが全角でも正しく判定できる', () => {
            assert.deepEqual(utils.getThreeStyleType('[U, R D R’]'), utils.ThreeStyleType.pure);
        });

        it('異常系: パースに失敗した場合はエラー', () => {
            const actual = () => utils.getThreeStyleType('[');
            assert.throws(actual, Error);
        });
    });

    describe('readThreeStyles()', () => {
        it('正常系: 入力文字列が空', () => {
            assert.deepEqual(utils.readThreeStyles(''), []);
        });

        it('正常系: 入力文字列が空白のみ', () => {
            assert.deepEqual(utils.readThreeStyles('     '), []);
        });

        it('正常系: 入力文字列が全角空白', () => {
            assert.deepEqual(utils.readThreeStyles('　'), []);
        });

        it('正常系: pure [U, R D R\']', () => {
            const expected = {
                setup: '',
                move1: 'U',
                move2: 'R D R\'',
            };
            assert.deepEqual(utils.readThreeStyles('[U, R D R\']'), [ expected, ]);
        });

        it('正常系: setup [D, [U, R D R\']]', () => {
            const expected = {
                setup: 'D',
                move1: 'U',
                move2: 'R D R\'',
            };
            assert.deepEqual(utils.readThreeStyles('[D, [U, R D R\']]'), [ expected, ]);
        });

        it('正常系: seq [D U R]', () => {
            const expected = {
                setup: 'D U R',
                move1: '',
                move2: '',
            };
            assert.deepEqual(utils.readThreeStyles('[D U R]'), [ expected, ]);
        });

        it('正常系: setup [D, [U, R D R’]] (全角プライム)', () => {
            const expected = {
                setup: 'D',
                move1: 'U',
                move2: 'R D R\'',
            };
            assert.deepEqual(utils.readThreeStyles('[D, [U, R D R\']]'), [ expected, ]);
        });

        it('正常系: 複数', () => {
            const ts1 = {
                setup: 'R L',
                move1: '',
                move2: '',
            };

            const ts2 = {
                setup: 'R U',
                move1: '',
                move2: '',
            };

            const expected = [ ts1, ts2, ];
            assert.deepEqual(utils.readThreeStyles('[R L], [R U]'), expected);
        });

        it('異常系: パースに失敗した場合はエラー', () => {
            const actual = () => utils.readThreeStyles('[');
            assert.throws(actual, Error);
        });
    });
});
