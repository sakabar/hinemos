const count = require('count-array-values');
const rp = require('request-promise');
const config = require('./config');
const letterPairTableUtils = require('./letterPairTableUtils');
const utils = require('./utils');

const suggestWord = () => {
    const lettersText = document.querySelector('.registerLetterPairForm__lettersText');
    const letters = lettersText.value.replace(/\s/g, '');
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

    const hiraganas = utils.getHiraganas();

    const lettersText = document.querySelector('.registerLetterPairForm__lettersText');
    const letters = lettersText.value;
    const wordText = document.querySelector('.registerLetterPairForm__wordText');
    const word = wordText.value.replace(/\n/g, '、');

    const headers = {
        'Content-Type': 'application/json',
    };

    if (!letters.split(/(.)/).filter(x => x).every(ch => hiraganas.includes(ch))) {
        alert('「あ」〜「ん」の、濁点が付かないひらがなのみを使ってください');
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

            lettersText.value = '';
            wordText.value = '';
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

// POSTするためのデータを作って返す
const getAllLetterPairs = (letterPairs, myLetterPairs, lettersSet) => {
    // 自分が登録したレターペアは必ず残すようにする
    // POST /letterPairTable を使うため、自分が登録したレターペアを入れておかないと、
    // 上書きされて消えてしまう

    // 暫定的に、全ユーザのレターペアを使うことにする
    // ユーザ数が増えると、単語が登録されすぎてしまうので、
    // いずれは人気トップ3などを登録するようにしたい

    // 何度もアクセスするのでハッシュ化
    // word => [letters]
    const wordToLettersListHash = getWordToLettersListHash(letterPairs);
    const myWordToLettersListHash = getWordToLettersListHash(myLetterPairs);

    // 1つの単語が複数のひらがなに割り当てられていた場合は、採用数が多いほうを採用
    // letters => [Words]
    const letterPairHash = {};
    const words = Object.keys(wordToLettersListHash);
    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // 登録されている数の多い順にソート
        const suggestedLettersCount = count(wordToLettersListHash[word], 'letters').sort((a, b) => {
            if (a.count < b.count) return 1;
            if (a.count === b.count) return 0;
            if (a.count > b.count) return -1;
        });

        // 降順にソートしたので、先頭のレターペアが一番人気である
        // 自分が登録した単語であれば自分が登録した単語を使用
        // そうでなければ、先頭のレターペアを使用
        let letters = [];
        if (suggestedLettersCount.length > 1) {
            if (word in myWordToLettersListHash) {
                letters = myWordToLettersListHash[word][0];
            } else {
                letters = suggestedLettersCount[0].letters;
            }
        } else {
            letters = suggestedLettersCount[0].letters;
        }

        if (letters in letterPairHash) {
            if (!letterPairHash[letters].includes(word)) {
                // リストを探査するので遅い。効率を改善する場合はまずここを狙うこと。
                letterPairHash[letters].push(word);
            }
        } else {
            letterPairHash[letters] = [ word, ];
        }
    }

    const ans = [];
    const notFoundLetters = []; // サジェストできなかったひらがな

    const lettersList = Array.from(lettersSet);
    for (let i = 0; i < lettersList.length; i++) {
        const letters = lettersList[i];
        if (letters in letterPairHash) {
            const letterPair = {
                letters,
                words: letterPairHash[letters],
            };
            ans.push(letterPair);
        } else {
            notFoundLetters.push(letters);
        }
    }

    alert(`次のひらがなは、単語をサジェストできませんでした。\n${JSON.stringify(notFoundLetters)}`);
    return ans;
};

const registerAllLetterPairs = (userName) => {
    const registerAllLetterPairsBtn = document.querySelector('.registerAllLetterPairsForm__btn');
    registerAllLetterPairsBtn.disabled = true; // 連打を防ぐ

    const allLetterPairOptions = {
        url: `${config.apiRoot}/letterPair`,
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

    return rp(allLetterPairOptions)
        .then((result) => {
            const letterPairs = result.success.result;

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
                                    const letterPairTable = getAllLetterPairs(letterPairs, myLetterPairs, lettersSet);

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
    lettersText.addEventListener('change', resetWordText);

    const registerLetterPairBtn = document.querySelector('.registerLetterPairForm__btn');
    registerLetterPairBtn.addEventListener('click', registerLetterPair);

    const suggestWordBtn = document.querySelector('.registerLetterPairForm__suggestWordBtn');
    suggestWordBtn.addEventListener('click', suggestWord);

    const registerAllLetterPairsBtn = document.querySelector('.registerAllLetterPairsForm__btn');
    registerAllLetterPairsBtn.addEventListener('click', () => registerAllLetterPairs(userName));
};

init();
