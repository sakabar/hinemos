const assert = require('assert');
const threeStyleQuiz = require('../src/js/threeStyleQuiz');

describe('threeStyleQuiz.js', () => {
    describe('getHint()', () => {
        it('正常系: セットアップなし', () => {
            const actual = threeStyleQuiz.getHint('', 'U', 'R D\' R\'');
            const expected = '(セットアップなし)';
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: セットアップあり: セットアップとmove1の1手目を表示', () => {
            const actual = threeStyleQuiz.getHint('D', 'U', 'R D\' R\'');
            const expected = '[D [U    ]]';
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: cyclic_shift: 4手目まで表示', () => {
            const actual = threeStyleQuiz.getHint('D Rw2 U R U\' Rw2 D R\' D2', '', '');
            const expected = '[D Rw2 U R    ]';
            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('selectFromManualList()', () => {
        it('正常系: problemListが空', () => {
            assert.deepStrictEqual(threeStyleQuiz.selectFromManualList([ null, ], [ null, ], []), []);
        });

        it('正常系: どちらも空ではない', () => {
            // 判定に使わないカラムは省略している
            const threeStyles = [
                { id: 1, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', setup: 'D U M M y', move1: 'D U M M y', move2: 'D U M M y', },
                { id: 2, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', setup: 'D U M M y', move1: 'D U M M y', move2: 'D U M M y', },
                { id: 3, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'BDF', stickers: 'UBL UFR BDF', setup: 'D U M M y', move1: 'D U M M y', move2: 'D U M M y', },
            ];

            // タイムの遅い順にソートされている前提
            const quizLogRes = [
                { userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', avg_sec: 20, },
                { userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', avg_sec: 10, },
            ];

            const problemList = [
                { id: 101, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', },
                { id: 102, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', },
            ];
            const actual = threeStyleQuiz.selectFromManualList(threeStyles, quizLogRes, problemList).map(x => x.stickers);
            const expected = [ 'UBL UFR LDF', 'UBL UFR RDF', ]; // 2, 1

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: threeStyleに登録していないものが問題リストにあった場合も出題', () => {
            // 判定に使わないカラムは省略している
            const threeStyles = [
                { id: 1, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', setup: 'D U M M y', move1: 'D U M M y', move2: 'D U M M y', },
                { id: 2, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', setup: 'D U M M y', move1: 'D U M M y', move2: 'D U M M y', },
                { id: 3, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'BDF', stickers: 'UBL UFR BDF', setup: 'D U M M y', move1: 'D U M M y', move2: 'D U M M y', },
            ];

            // タイムの遅い順にソートされている前提
            const quizLogRes = [
                { userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', avg_sec: 20, },
                { userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', avg_sec: 10, },
                { userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'FDR', stickers: 'UBL UFR FDR', avg_sec: 5, },
            ];

            const problemList = [
                { id: 101, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', },
                { id: 102, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', },
                { id: 103, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'FDR', stickers: 'UBL UFR FDR', }, // これは登録していない3-style
            ];
            const actual = threeStyleQuiz.selectFromManualList(threeStyles, quizLogRes, problemList).map(x => x.stickers);
            const expected = [ 'UBL UFR RDF', 'UBL UFR LDF', 'UBL UFR FDR', ]; // 1, 2 + 3

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: まず解いたことのない問題をやり、その後にタイムの遅い順にやる', () => {
            // 判定に使わないカラムは省略している
            const threeStyles = [
                { id: 1, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', setup: 'D U M M y', move1: 'D U M M y', move2: 'D U M M y', },
                { id: 2, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', setup: 'D U M M y', move1: 'D U M M y', move2: 'D U M M y', },
                { id: 3, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'BDF', stickers: 'UBL UFR BDF', setup: 'D U M M y', move1: 'D U M M y', move2: 'D U M M y', },
            ];

            // タイムの遅い順にソートされている前提
            const quizLogRes = [
                { userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', avg_sec: 20, },
                { userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', avg_sec: 10, },
            ];

            const problemList = [
                { id: 101, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'RDF', stickers: 'UBL UFR RDF', },
                { id: 102, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'LDF', stickers: 'UBL UFR LDF', },
                { id: 103, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'FDR', stickers: 'UBL UFR FDR', }, // これは登録していない3-style
                { id: 104, userName: 'user1', buffer: 'UBL', sticker1: 'UFR', sticker2: 'BDF', stickers: 'UBL UFR BDF', },
            ];
            const actual = threeStyleQuiz.selectFromManualList(threeStyles, quizLogRes, problemList).map(x => x.stickers);
            // 解いていない問題で、problemListに登録してある順 + 遅い順
            const expected = [ 'UBL UFR BDF', 'UBL UFR FDR', 'UBL UFR RDF', 'UBL UFR LDF', ]; // 4, 3, 1, 2
            assert.deepStrictEqual(actual, expected);
        });
    });
});
