const _ = require('lodash');
const count = require('count-array-values');
const rp = require('request-promise');
const config = require('./config');
const letterPairTableUtils = require('./letterPairTableUtils');
const utils = require('./utils');

const suggestWord = () => {
    const lettersText = document.querySelector('.registerLetterPairForm__lettersText');
    const letters = lettersText.value.replace(/\s/g, '');

    // 欄が空のときはサジェストしない
    // APIの仕様で、空でリクエストすると全ての単語が返ってくる
    if (letters === '') {
        return;
    }
    const wordText = document.querySelector('.registerLetterPairForm__wordText');

    const options = {
        url: `${config.apiRoot}/letterPair?letters=${letters}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
        },
    };

    rp(options)
        .then((ans) => {
            const results = ans.success.result.map(x => x.word);
            // 登録されている数の多い順にソート
            const suggestedWordsCount = count(results, 'word').sort((a, b) => {
                if (a.count < b.count) return 1;
                if (a.count === b.count) return 0;
                if (a.count > b.count) return -1;
            });

            const suggestedWordsStr = suggestedWordsCount.map(x => x.word).join('\n');

            if (wordText.value.length === 0) {
                wordText.value = suggestedWordsStr;
            } else {
                wordText.value += '\n' + suggestedWordsStr;
            }
        })
        .catch((err) => {
            alert(err);
        });
};

const registerLetterPair = () => {
    const userName = localStorage.userName;
    const token = localStorage.token;

    const lettersText = document.querySelector('.registerLetterPairForm__lettersText');
    const letters = lettersText.value;
    const wordText = document.querySelector('.registerLetterPairForm__wordText');
    const word = wordText.value.replace(/\n/g, '、');

    const headers = {
        'Content-Type': 'application/json',
    };

    const characterTypes = letters.split('').map(s => utils.getCharacterType(s));
    if (new Set(characterTypes).size !== 1) {
        alert('ひらがなとアルファベットが混在しています。(Use only Japanese or Alphabet.)');
        return;
    }

    const options = {
        url: `${config.apiRoot}/letterPair/${userName}`,
        method: 'POST',
        headers: headers,
        json: true,
        form: {
            word,
            letters,
            token,
        },
    };

    rp(options)
        .then((ans) => {
            lettersText.value = '';
            wordText.value = '';
        })
        .catch(() => {
            alert('登録に失敗しました');
        });
};

const resetWordText = () => {
    const wordText = document.querySelector('.registerLetterPairForm__wordText');
    wordText.value = '';
};

// ナンバリングから、ありうる2文字のセットを返す
const getLettersSet = (cornerNumberings, edgeNumberings) => {
    // ありうるひらがな2文字
    const lettersSet = new Set();

    // MBLDなどで、CO/EO処理せずに2文字として処理するかもしれないので、
    // 同じパーツのステッカーを特別視せず、全て列挙する
    for (let i = 0; i < cornerNumberings.length; i++) {
        const numbering1 = cornerNumberings[i];

        for (let k = 0; k < cornerNumberings.length; k++) {
            const numbering2 = cornerNumberings[k];

            // 同じステッカーの場合はスキップ
            if (numbering1.letter === numbering2.letter) {
                continue;
            }

            const letters = `${numbering1.letter}${numbering2.letter}`;
            lettersSet.add(letters);
        }
    }

    // MBLDなどで、CO/EO処理せずに2文字として処理するかもしれないので、
    // 同じパーツのステッカーを特別視せず、全て列挙する
    for (let i = 0; i < edgeNumberings.length; i++) {
        const numbering1 = edgeNumberings[i];

        for (let k = 0; k < edgeNumberings.length; k++) {
            const numbering2 = edgeNumberings[k];

            // 同じステッカーの場合はスキップ
            if (numbering1.letter === numbering2.letter) {
                continue;
            }

            const letters = `${numbering1.letter}${numbering2.letter}`;
            lettersSet.add(letters);
        }
    }

    return lettersSet;
};

const getWordToLettersListHash = (letterPairs) => {
    const wordToLettersListHash = {};

    for (let i = 0; i < letterPairs.length; i++) {
        const letterPair = letterPairs[i];
        const letters = letterPair.letters;
        const word = letterPair.word;

        if (word in wordToLettersListHash) {
            wordToLettersListHash[word].push(letters);
        } else {
            wordToLettersListHash[word] = [ letters, ];
        }
    }

    return wordToLettersListHash;
};

// rankMaxは同じletters内で設定ユーザ数が多い順に何単語までをサジェストするか。nullの時は全てサジェスト
// 一度groupByしてしまうと順番が崩れるので、絞り込んだ後に復元する
const filterLetterPairCount = (letterPairCount, rankMax = null) => {
    if (!rankMax) {
        return letterPairCount;
    }

    const filteredGroupedDict = {};
    const groupedDict = _.groupBy(letterPairCount, (record) => record.letters);
    const keys = Object.keys(groupedDict);
    for (let i = 0; i < keys.length; i++) {
        const letters = keys[i];
        const groupedRecords = groupedDict[letters];

        const selectedWords = groupedRecords.slice(0, rankMax).map(record => record.word);
        filteredGroupedDict[letters] = selectedWords;
    }

    return letterPairCount.filter(record => {
        const letters = record.letters;
        const word = record.word;

        return filteredGroupedDict[letters].includes(word);
    });
};

// POSTするためのデータを作って返す
export const getAllLetterPairs = (letterPairCount, myLetterPairs, lettersSet, skipRegisteredLetters) => {
    // 自分が登録したレターペアは必ず残すようにする
    // POST /letterPairTable を使うため、自分が登録したレターペアを入れておかないと、
    // 上書きされて消えてしまう

    // 何度もアクセスするのでハッシュ化
    // word => [letters]
    // letterPairCountはuserCountの降順に並んでいるので、wordToLettersListHashの中身もuserCountの降順になっている
    const wordToLettersListHash = _.groupBy(letterPairCount, (record) => record.word);
    const myWordToLettersListHash = getWordToLettersListHash(myLetterPairs);

    // letters => [Words]
    const myLetterPairHash = {};
    for (let i = 0; i < myLetterPairs.length; i++) {
        const myLetterPair = myLetterPairs[i];
        const letters = myLetterPair.letters;
        const word = myLetterPair.word;

        if (letters in myLetterPairHash) {
            myLetterPairHash[letters].push(word);
        } else {
            myLetterPairHash[letters] = [ word, ];
        }
    }

    // 1つの単語が複数のひらがなに割り当てられていた場合は、採用数が多いほうを採用
    // letters => [Words]
    const letterPairHash = {};
    const words = [ ...new Set([ ...Object.keys(wordToLettersListHash), ...Object.keys(myWordToLettersListHash), ]), ];
    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // 降順にソートされているので、このwordは先頭のlettersのレターペアとして最も多く使用されている
        // もしwordが自分が登録した単語であれば、それは自分が設定したlettersとして登録
        // そうでなければ、先頭のlettersとして登録
        const letters = (() => {
            if (word in myWordToLettersListHash) {
                return myWordToLettersListHash[word][0];
            } else {
                const records = wordToLettersListHash[word];
                return records[0].letters;
            }
        })();

        if (letters in letterPairHash) {
            letterPairHash[letters].push(word);
        } else {
            letterPairHash[letters] = [ word, ];
        }
    }

    const ans = [];
    const notFoundLetters = []; // サジェストできなかったひらがな

    const lettersList = Array.from(lettersSet);
    if (lettersList.length === 0) {
        return {
            letterPairs: [],
            notFoundLetters: [],
        };
    }

    const characterType = utils.getCharacterType(lettersList[0][0]);
    const characters = utils.getCharacters(characterType);

    for (let i = 0; i < characters.length; i++) {
        for (let j = 0; j < characters.length; j++) {
            const letters = `${characters[i]}${characters[j]}`;

            // ナンバリングに無い文字
            // 既に登録してある単語は保護
            if (!lettersList.includes(letters)) {
                if (letters in myLetterPairHash) {
                    const letterPair = {
                        letters,
                        words: myLetterPairHash[letters],
                    };
                    ans.push(letterPair);
                }

                continue;
            }

            if (lettersList.includes(letters) && !(letters in letterPairHash)) {
                notFoundLetters.push(letters);
                continue;
            }

            if (skipRegisteredLetters && (letters in myLetterPairHash)) {
            // 自分のレターペアだけを登録
                const letterPair = {
                    letters,
                    words: myLetterPairHash[letters],
                };
                ans.push(letterPair);
            } else {
                const letterPair = {
                    letters,
                    words: letterPairHash[letters],
                };
                ans.push(letterPair);
            }
        }
    }

    return {
        letterPairs: ans,
        notFoundLetters,
    };
};

const registerAllLetterPairs = (userName) => {
    const registerAllLetterPairsBtn = document.querySelector('.registerAllLetterPairsForm__btn');
    registerAllLetterPairsBtn.disabled = true; // 連打を防ぐ

    const skipRegisteredLettersCheckbox = document.querySelector('.registerAllLetterPairsForm__checkBox');
    const skipRegisteredLetters = skipRegisteredLettersCheckbox.checked;

    const allLetterPairCountOptions = {
        url: `${config.apiRoot}/letterPairCount`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
        },
    };

    const myLetterPairOptions = {
        url: `${config.apiRoot}/letterPair?userName=${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
        },
    };

    const numberingCornerOptions = {
        url: `${config.apiRoot}/numbering/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    const numberingEdgeOptions = {
        url: `${config.apiRoot}/numbering/edgeMiddle/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(allLetterPairCountOptions)
        .then((result) => {
            const rankMax = 5;
            const letterPairCount = filterLetterPairCount(result.success.result, rankMax);

            return rp(numberingCornerOptions)
                .then((result) => {
                    // バッファの情報は使わない
                    const cornerNumberings = result.success.result.filter(x => x.letter !== '@');

                    return rp(numberingEdgeOptions)
                        .then((result) => {
                            // バッファの情報は使わない
                            const edgeNumberings = result.success.result.filter(x => x.letter !== '@');

                            return rp(myLetterPairOptions)
                                .then((result) => {
                                    const myLetterPairs = result.success.result;

                                    const lettersSet = getLettersSet(cornerNumberings, edgeNumberings);

                                    const suggested = getAllLetterPairs(letterPairCount, myLetterPairs, lettersSet, skipRegisteredLetters);
                                    const letterPairTable = suggested.letterPairs;
                                    const notFoundLetters = suggested.notFoundLetters;
                                    notFoundLetters.sort();

                                    if (notFoundLetters.length > 1) {
                                        alert(`次のひらがなは、単語をサジェストできませんでした。\n${JSON.stringify(notFoundLetters)}`);
                                    }

                                    // 置き換えて登録することに注意
                                    return letterPairTableUtils.saveLetterPairTable(letterPairTable)
                                        .then((result) => {
                                            alert('保存が完了しました');
                                            registerAllLetterPairsBtn.disabled = false; // 元に戻す
                                        })
                                        .catch((err) => {
                                            // FIXME なかなかひどい実装
                                            alert(err);
                                            const msg = err.message.match(/『[^』]*』/)[0];
                                            alert(msg);
                                            registerAllLetterPairsBtn.disabled = false; // 元に戻す
                                        });
                                })
                                .catch((err) => {
                                    alert(`4: ${err}`);
                                });
                        })
                        .catch((err) => {
                            alert(`3: ${err}`);
                        });
                })
                .catch((err) => {
                    alert(`2: ${err}`);
                });
        })
        .catch((err) => {
            alert(`1: ${err}`);
        });
};

const init = () => {
    const userName = localStorage.userName;

    // ひらがなのテキストボックスが変更されたら単語のテキストボックスを空にする
    const lettersText = document.querySelector('.registerLetterPairForm__lettersText');
    if (lettersText) {
        lettersText.addEventListener('change', resetWordText);
    }

    const registerLetterPairBtn = document.querySelector('.registerLetterPairForm__btn');
    if (registerLetterPairBtn) {
        registerLetterPairBtn.addEventListener('click', registerLetterPair);
    }

    const suggestWordBtn = document.querySelector('.registerLetterPairForm__suggestWordBtn');
    if (suggestWordBtn) {
        suggestWordBtn.addEventListener('click', suggestWord);
    }

    const registerAllLetterPairsBtn = document.querySelector('.registerAllLetterPairsForm__btn');
    if (registerAllLetterPairsBtn) {
        registerAllLetterPairsBtn.addEventListener('click', () => registerAllLetterPairs(userName));
    }
};

init();
