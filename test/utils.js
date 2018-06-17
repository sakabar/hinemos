const assert = require('assert');
const utils = require('../src/js/utils');

describe('utils.js', () => {
    describe('showMove()', () => {
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

    describe('inverse()', () => {
        it('正常系:', () => {
            const actual = utils.inverse('R');
            const expected = 'R\'';
            assert.deepEqual(actual, expected);
        });

        it('正常系:', () => {
            const actual = utils.inverse('Rw2');
            const expected = 'Rw2';
            assert.deepEqual(actual, expected);
        });
    });

    describe('expandMove()', () => {
        it('正常系: pure', () => {
            const actual = utils.expandMove('', 'U', 'R D R\'');
            const expected = 'U R D R\' U\' R D\' R\'';
            assert.deepEqual(actual, expected);
        });

        it('正常系: setup', () => {
            const actual = utils.expandMove('M', 'U', 'R D R\'');
            const expected = 'M U R D R\' U\' R D\' R\' M\'';
            assert.deepEqual(actual, expected);
        });

        it('正常系: setup Lw\'', () => {
            const actual = utils.expandMove('U\'', 'Lw\'', 'D');
            const expected = 'U\' Lw\' D Lw D\' U';
            assert.deepEqual(actual, expected);
        });

        it('正常系: setup Rw', () => {
            const actual = utils.expandMove('U\'', 'Rw2', 'D');
            const expected = 'U\' Rw2 D Rw2 D\' U';
            assert.deepEqual(actual, expected);
        });

        it('正常系: seq', () => {
            const actual = utils.expandMove('R D R\'', '', '');
            const expected = 'R D R\'';
            assert.deepEqual(actual, expected);
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

        it('正常系: 余計な文字を削除 1', () => {
            const actual = utils.makeThreeStyle('UBL', 'URF', 'RDF', '', 'U2 :', '[R’ D\' R]]');
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

        it('正常系: 余計な文字を削除 2', () => {
            const actual = utils.makeThreeStyle('UBL', 'URF', 'RDF', '; [ ( )', 'U2', 'R’ D\' R');
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

        it('正常系: 余計な文字を削除 3', () => {
            const actual = utils.makeThreeStyle('UBL', 'URF', 'RDF', '', ',U2 :', '[R’ D\' R]]');
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
            assert.deepEqual(utils.readThreeStyles('[D, [U, R D R’]]'), [ expected, ]);
        });

        it('正常系: setup [D、 [U， R D R’]] (読点と全角コンマ)', () => {
            const expected = {
                setup: 'D',
                move1: 'U',
                move2: 'R D R\'',
            };
            assert.deepEqual(utils.readThreeStyles('[D、 [U， R D R\']]'), [ expected, ]);
        });

        it('正常系: setup [D, [U,     R D R’]] (スペースが複数)', () => {
            const expected = {
                setup: 'D',
                move1: 'U',
                move2: 'R D R\'',
            };
            assert.deepEqual(utils.readThreeStyles('[D, [U,     R D R\']]'), [ expected, ]);
        });

        it('正常系: setup [U\' , [R\' F\' R , S]] (コンマの前にスペース)', () => {
            const expected = {
                setup: 'U\'',
                move1: 'R\' F\' R',
                move2: 'S',
            };
            assert.deepEqual(utils.readThreeStyles('[U\' , [R\' F\' R , S]]'), [ expected, ]);
        });

        it('正常系: setup [L2 F, [L2, E] ] (カッコの間にスペース)', () => {
            const expected = {
                setup: 'L2 F',
                move1: 'L2',
                move2: 'E',
            };
            assert.deepEqual(utils.readThreeStyles('[L2 F, [L2, E] ]'), [ expected, ]);
        });

        it('正常系: setup [L2 F ,[L2, E]] (カッコの前にスペースを空けずにコンマ)', () => {
            const expected = {
                setup: 'L2 F',
                move1: 'L2',
                move2: 'E',
            };
            assert.deepEqual(utils.readThreeStyles('[L2 F ,[L2, E]]'), [ expected, ]);
        });

        it('正常系: setup [U, [ S\' , R\' D\' R]] (スペース、カッコ、スペース)', () => {
            const expected = {
                setup: 'U',
                move1: 'S\'',
                move2: 'R\' D\' R',
            };
            assert.deepEqual(utils.readThreeStyles('[U, [ S\' , R\' D\' R]]'), [ expected, ]);
        });

        it('正常系: setup [F Lw\' U\' L U R U\' Rw\' ] (カッコの前にスペース)', () => {
            const expected = {
                setup: 'F Lw\' U\' L U R U\' Rw\'',
                move1: '',
                move2: '',
            };
            assert.deepEqual(utils.readThreeStyles('[F Lw\' U\' L U R U\' Rw\' ]'), [ expected, ]);
        });

        it('正常系: setup [R U , [U ,R D R’]] (コンマの直後にスペースを空けずにアルファベット)', () => {
            const expected = {
                setup: 'R U',
                move1: 'U',
                move2: 'R D R\'',
            };
            assert.deepEqual(utils.readThreeStyles('[R U , [U ,R D R’]]'), [ expected, ]);
        });

        it('正常系: setup [R U : [U ,R D R’]] (コロン)', () => {
            const expected = {
                setup: 'R U',
                move1: 'U',
                move2: 'R D R\'',
            };
            assert.deepEqual(utils.readThreeStyles('[R U : [U ,R D R’]]'), [ expected, ]);
        });

        it('正常系: setup [R U ; [U ,R D R’]] (セミコロン)', () => {
            const expected = {
                setup: 'R U',
                move1: 'U',
                move2: 'R D R\'',
            };
            assert.deepEqual(utils.readThreeStyles('[R U ; [U ,R D R’]]'), [ expected, ]);
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

        it('異常系: [UD]', () => {
            const actual = () => utils.readThreeStyles('[UD]');
            assert.throws(actual, Error);
        });
    });
});
