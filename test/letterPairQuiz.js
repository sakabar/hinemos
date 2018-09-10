const assert = require('assert');
const letterPairQuiz = require('../src/js/letterPairQuiz');

describe('letterPairQuiz.js', () => {
    describe('selectSolvedLetterPairs()', () => {
        it('正常系: 両方とも空のときは空', () => {
            assert.deepStrictEqual(letterPairQuiz.selectSolvedLetterPairs([], []), []);
        });

        it('正常系: 解いた問題が空のときは空', () => {
            assert.deepStrictEqual(letterPairQuiz.selectSolvedLetterPairs([ undefined, ], []), []);
        });

        it('正常系: 登録済のレターペアが空のときは空', () => {
            assert.deepStrictEqual(letterPairQuiz.selectSolvedLetterPairs([], [ undefined, ]), []);
        });

        it('正常系: 両方とも値がある', () => {
            const letterPairs = [
                { letters: 'あい', word: '合いの手', },
                { letters: 'あい', word: '愛', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あい', avgSec: '3.0', },
            ];

            const actual = letterPairQuiz.selectSolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [ { letters: 'あい', words: [ '合いの手', '愛', ], }, ];
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 登録済のレターペアのほうが多い', () => {
            const letterPairs = [
                { letters: 'あい', word: '合いの手', },
                { letters: 'あい', word: '愛', },
                { letters: 'あか', word: '赤', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あい', avgSec: '3.0', },
            ];

            const actual = letterPairQuiz.selectSolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [ { letters: 'あい', words: [ '合いの手', '愛', ], }, ];
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: quizLogの順番を維持する', () => {
            const letterPairs = [
                { letters: 'あい', word: '合いの手', },
                { letters: 'あい', word: '愛', },
                { letters: 'あか', word: '赤', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あか', avgSec: '4.0', },
                { userName: 'user1', letters: 'あい', avgSec: '3.0', },
            ];

            const actual = letterPairQuiz.selectSolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [
                { letters: 'あか', words: [ '赤', ], },
                { letters: 'あい', words: [ '合いの手', '愛', ], },
            ];
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 削除済のレターペアは出題しない', () => {
            const letterPairs = [
                { letters: 'あか', word: '赤', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あい', avgSec: '3.0', },
                { userName: 'user1', letters: 'あか', avgSec: '3.0', },
            ];

            const actual = letterPairQuiz.selectSolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [ { letters: 'あか', words: [ '赤', ], }, ];
            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('selectUnsolvedLetterPairs()', () => {
        it('正常系: 両方とも空のときは空', () => {
            assert.deepStrictEqual(letterPairQuiz.selectUnsolvedLetterPairs([], []), []);
        });

        it('正常系: 登録済のレターペアが空のときは空', () => {
            assert.deepStrictEqual(letterPairQuiz.selectUnsolvedLetterPairs([], [ undefined, ]), []);
        });

        it('正常系: 解いていない問題があったら、それだけを返す', () => {
            const letterPairs = [
                { letters: 'あい', word: '合いの手', },
                { letters: 'あい', word: '愛', },
                { letters: 'あか', word: '赤', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あい', avgSec: '3.0', },
            ];

            const actual = letterPairQuiz.selectUnsolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [
                { letters: 'あか', words: [ '赤', ], },
            ];
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 両方とも値があり、全ての問題を既に解いていた場合は、遅い順に返す', () => {
            const letterPairs = [
                { letters: 'あい', word: '合いの手', },
                { letters: 'あい', word: '愛', },
                { letters: 'あか', word: '赤', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あか', avgSec: '4.0', },
                { userName: 'user1', letters: 'あい', avgSec: '3.0', },
            ];

            const actual = letterPairQuiz.selectUnsolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [
                { letters: 'あか', words: [ '赤', ], },
                { letters: 'あい', words: [ '合いの手', '愛', ], },
            ];
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 削除済のレターペアは出題しない: 全部の問題を解いていた場合', () => {
            const letterPairs = [
                { letters: 'あか', word: '赤', },
                { letters: 'あし', word: '足', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あし', avgSec: '4.0', },
                { userName: 'user1', letters: 'あい', avgSec: '3.0', }, // 削除済
                { userName: 'user1', letters: 'あか', avgSec: '2.0', },
            ];

            const actual = letterPairQuiz.selectUnsolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [
                { letters: 'あし', words: [ '足', ], },
                { letters: 'あか', words: [ '赤', ], },
            ];
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 削除済のレターペアは出題しない: 解いていない問題があった場合', () => {
            const letterPairs = [
                { letters: 'あい', word: '愛', },
                { letters: 'あか', word: '赤', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あい', avgSec: '2.0', },
                { userName: 'user1', letters: 'あし', avgSec: '1.0', }, // 削除済
            ];

            const actual = letterPairQuiz.selectUnsolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [ { letters: 'あか', words: [ '赤', ], }, ];
            assert.deepStrictEqual(actual, expected);
        });
    });
});
