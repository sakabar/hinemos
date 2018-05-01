const assert = require('assert');
const registerLetterPairJS = require('../src/js/registerLetterPair');

describe('registerLetterPair.js', () => {
    describe('getAllLetterPairs()', () => {
        it('正常系: setが空の場合', () => {
            const actual = registerLetterPairJS.getAllLetterPairs([], [], new Set());
            assert.deepEqual(actual.letterPairs, []);
            assert.deepEqual(actual.notFoundLetters, []);
        });

        it('正常系: 自分が登録していた単語は、他の人の単語で置き換わらない', () => {
            const allLetterPairs = [
                { userName: 'user1', letters: 'むつ', word: '陸奥', },
                { userName: 'user2', letters: 'むつ', word: '陸奥', },
                { userName: 'me', letters: 'ぬつ', word: '陸奥', },
            ];
            const myLetterPairs = [
                { letters: 'ぬつ', word: '陸奥', },
            ];
            const lettersSet = new Set([ 'ぬつ', ]);

            const expected = [
                { letters: 'ぬつ', words: [ '陸奥', ], },
            ];
            const actual = registerLetterPairJS.getAllLetterPairs(allLetterPairs, myLetterPairs, lettersSet);
            assert.deepEqual(actual.letterPairs, expected);
            assert.deepEqual(actual.notFoundLetters, []);
        });

        it('正常系: 全ユーザのレターペアには含まれているが、衝突してしたため登録できない場合がある', () => {
            const allLetterPairs = [
                { userName: 'user1', letters: 'むつ', word: '陸奥', },
                { userName: 'user2', letters: 'むつ', word: '陸奥', },
                { userName: 'me', letters: 'ぬつ', word: '陸奥', },
            ];
            const myLetterPairs = [
                { letters: 'ぬつ', word: '陸奥', },
            ];
            const lettersSet = new Set([ 'ぬつ', 'むつ', ]);

            const expected = [
                { letters: 'ぬつ', words: [ '陸奥', ], },
            ];
            const actual = registerLetterPairJS.getAllLetterPairs(allLetterPairs, myLetterPairs, lettersSet);
            assert.deepEqual(actual.letterPairs, expected);
            assert.deepEqual(actual.notFoundLetters, [ 'むつ', ]);
        });
    });
});
