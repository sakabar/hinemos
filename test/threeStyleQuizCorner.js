const assert = require('assert');
const threeStyleQuizCorner = require('../src/js/threeStyleQuizCorner');

describe('threeStyleQuizCorner.js', () => {
    describe('getHint()', () => {
        it('正常系: セットアップなし', () => {
            const actual = threeStyleQuizCorner.getHint('', 'U', 'R D\' R\'');
            const expected = '(セットアップなし)';
            assert.deepEqual(actual, expected);
        });

        it('正常系: セットアップあり: セットアップとmove1の1手目を表示', () => {
            const actual = threeStyleQuizCorner.getHint('D', 'U', 'R D\' R\'');
            const expected = '[D [U    ]]';
            assert.deepEqual(actual, expected);
        });

        it('正常系: cyclic_shift: 4手目まで表示', () => {
            const actual = threeStyleQuizCorner.getHint('D Rw2 U R U\' Rw2 D R\' D2', '', '');
            const expected = '[D Rw2 U R    ]';
            assert.deepEqual(actual, expected);
        });
    });

    describe('selectFromManualList()', () => {
        it('正常系: problemListが空', () => {
            assert.deepEqual(threeStyleQuizCorner.selectFromManualList([ null, ], []), []);
        });

        it('正常系: threeStylesが空', () => {
            assert.deepEqual(threeStyleQuizCorner.selectFromManualList([], [ null, ]), []);
        });

        it('正常系: どちらも空ではない', () => {
            // 判定に使わないカラムは省略している
            const threeStyles = [
                { id: 1, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', },
                { id: 2, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', },
                { id: 3, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'BDF', stickers: 'UBL UFR BDF', },
            ];

            const problemList = [
                { id: 101, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', },
                { id: 102, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', },
            ];
            const actual = threeStyleQuizCorner.selectFromManualList(threeStyles, problemList).map(x => x.id);
            const expected = [ 1, 2, ];

            assert.deepEqual(actual, expected);
        });

        it('正常系: threeStyleに登録していないものが問題リストにあった場合は無視', () => {
            // 判定に使わないカラムは省略している
            const threeStyles = [
                { id: 1, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', },
                { id: 2, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', },
                { id: 3, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'BDF', stickers: 'UBL UFR BDF', },
            ];

            const problemList = [
                { id: 101, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', },
                { id: 102, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', },
                { id: 103, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'FDR', stickers: 'UBL UFR FDR', },
            ];
            const actual = threeStyleQuizCorner.selectFromManualList(threeStyles, problemList).map(x => x.id);
            const expected = [ 1, 2, ];

            assert.deepEqual(actual, expected);
        });
    });
});
