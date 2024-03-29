const assert = require('assert');
const registerLetterPairJS = require('../src/js/registerLetterPair');

describe('registerLetterPair.js', () => {
    describe('getAllLetterPairs()', () => {
        it('正常系: setが空の場合', () => {
            const actual = registerLetterPairJS.getAllLetterPairs([], [], new Set(), false);
            assert.deepStrictEqual(actual.letterPairs, []);
            assert.deepStrictEqual(actual.notFoundLetters, []);
        });

        it('正常系: 自分が登録していた単語は、他の人の単語で置き換わらない', () => {
            const allLetterPairs = [
                { userName: 'user1', letters: 'むつ', word: '陸奥', },
                { userName: 'user2', letters: 'むつ', word: '陸奥', },
                { userName: 'me', letters: 'ぬつ', word: '陸奥', },
                { userName: 'me', letters: 'のな', word: 'ナンバリングに無いけど登録してある', },
                { userName: 'me', letters: 'AB', word: 'アルファベットナンバリングも使ってる', },
                { userName: 'me', letters: 'CT', word: 'ナンバリングに無いけど登録してある', },
            ];
            const myLetterPairs = [
                { letters: 'ぬつ', word: '陸奥', },
                { letters: 'のな', word: 'ナンバリングに無いけど登録してある', },
                { letters: 'AB', word: 'アルファベットナンバリングも使ってる', },
                { letters: 'CT', word: 'ナンバリングに無いけど登録してある', },
            ];
            const lettersSet = new Set([ 'ぬつ', 'AB', ]);

            const expected = [
                { letters: 'ぬつ', words: [ '陸奥', ], },
                { letters: 'のな', words: [ 'ナンバリングに無いけど登録してある', ], },
                { letters: 'AB', words: [ 'アルファベットナンバリングも使ってる', ], },
                { letters: 'CT', words: [ 'ナンバリングに無いけど登録してある', ], },
            ];
            const actual = registerLetterPairJS.getAllLetterPairs(allLetterPairs, myLetterPairs, lettersSet, false);
            assert.deepStrictEqual(actual.letterPairs, expected);
            assert.deepStrictEqual(actual.notFoundLetters, []);
        });

        it('正常系: 全ユーザのレターペアには含まれているが、衝突してしたため登録できない場合がある', () => {
            const allLetterPairs = [
                { userName: 'user1', letters: 'むつ', word: '陸奥', },
                { userName: 'user2', letters: 'むつ', word: '陸奥', },
                { userName: 'me', letters: 'ぬつ', word: '陸奥', },
                { userName: 'me', letters: 'のな', word: 'ナンバリングに無いけど登録してある', },
            ];
            const myLetterPairs = [
                { letters: 'ぬつ', word: '陸奥', },
                { letters: 'のな', word: 'ナンバリングに無いけど登録してある', },
            ];
            const lettersSet = new Set([ 'ぬつ', 'むつ', ]);

            const expected = [
                { letters: 'ぬつ', words: [ '陸奥', ], },
                { letters: 'のな', words: [ 'ナンバリングに無いけど登録してある', ], },
            ];
            const actual = registerLetterPairJS.getAllLetterPairs(allLetterPairs, myLetterPairs, lettersSet, false);
            assert.deepStrictEqual(actual.letterPairs, expected);
            assert.deepStrictEqual(actual.notFoundLetters, [ 'むつ', ]);
        });

        it('正常系: 登録済みの文字をスキップ', () => {
            const allLetterPairs = [
                { userName: 'user1', letters: 'あい', word: 'アリ', },
                { userName: 'user2', letters: 'あい', word: 'アイス', },
                { userName: 'user2', letters: 'あえ', word: '亜鉛', },
                { userName: 'me', letters: 'あい', word: 'アイマスク', },
                { userName: 'me', letters: 'のな', word: 'ナンバリングに無いけど登録してある', },
            ];
            const myLetterPairs = [
                { letters: 'あい', word: 'アイコス', },
                { letters: 'のな', word: 'ナンバリングに無いけど登録してある', },
            ];
            const lettersSet = new Set([ 'あい', 'あえ', ]);

            // レターペア登録済みの文字はスキップ
            const skipRegisteredLetters = true;

            const expected = [
                // 「あい」は追加されない
                { letters: 'あい', words: [ 'アイコス', ], },

                // 「あえ」は追加される
                { letters: 'あえ', words: [ '亜鉛', ], },

                // ナンバリングに無いが元から登録してあった単語は残る
                { letters: 'のな', words: [ 'ナンバリングに無いけど登録してある', ], },
            ];

            const actual = registerLetterPairJS.getAllLetterPairs(allLetterPairs, myLetterPairs, lettersSet, skipRegisteredLetters);
            assert.deepStrictEqual(actual.letterPairs, expected);
            assert.deepStrictEqual(actual.notFoundLetters, []);
        });
    });
});
