const rp = require('request-promise');
const url = require('url');
const constant = require('./constant');
const config = require('./config');

// テキストボックスに入ってる文字で検索
// <あか|あ?|?か>
const searchThreeStyles = (part) => {
    const userName = localStorage.userName;
    const inputText = document.querySelector('.editQuizListForm__inputArea__text');
    const letters = inputText.value;

    const inputAreaUlistNode = document.querySelector('.editQuizListForm__inputArea .editQuizListForm__uList');

    // ulの現在の子を全て削除
    while (inputAreaUlistNode.firstChild) {
        inputAreaUlistNode.removeChild(inputAreaUlistNode.firstChild);
    };

    // なぜか、3文字以上あってもAPIがヒットしてしまうため
    if (letters.length > 2) {
        return;
    };

    const threeStyleOptions = {
        url: `${config.apiRoot}/threeStyleFromLetters/${part.name}?userName=${userName}&letters=${letters}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(threeStyleOptions)
        .then((ans) => {
            const results = ans.success.result;
            // const stickersHash = {};

            // 結果を追加
            // FIXME 1個しか入力しない場合はループで回す必要がない
            const stickers = results[0].stickers;
            // for (let i = 0; i < results.length; i++) {
            //     const stickers = results[i].stickers;
            // if (stickers in stickersHash) {
            //     continue;
            // }
            // stickersHash[stickers] = true;

            const liNode = document.createElement('li');
            const text = `${letters} (${stickers})`; // FIXME 正規表現verにする場合は、ここを変えないといけない
            liNode.appendChild(document.createTextNode(text));
            liNode.addEventListener('click', () => {
                inputAreaUlistNode.removeChild(liNode);
                addCandStickers(text);
            });
            inputAreaUlistNode.appendChild(liNode);
            // }
        })
        .catch(() => {
            // alert(err);
        });
};

// stickersを渡して、追加候補に入れる
// 渡すのは"あた (UBL UFR UFL)"という形式の文字列
const addCandStickers = (text) => {
    const addCandAreaUlistNode = document.querySelector('.editQuizListForm__addCandArea .editQuizListForm__uList--cand');

    const liNode = document.createElement('li');
    liNode.appendChild(document.createTextNode(text));
    liNode.addEventListener('click', () => {
        addCandAreaUlistNode.removeChild(liNode);
    });
    addCandAreaUlistNode.appendChild(liNode);
};

// タイムの遅いものから順に5個登録
const addStickersAutomatically = (userName, part) => {
    const threeStyleOptions = {
        url: `${config.apiRoot}/threeStyleQuizLog/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // ナンバリング
    const numberingOptions = {
        url: `${config.apiRoot}/numbering/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(numberingOptions)
        .then((result) => {
            const numbering = result.success.result;
            return rp(threeStyleOptions)
                .then((result) => {
                    const num = 5;
                    // ログの遅いほうから5個取る
                    const slowestStickers = result.success.result.slice(0, num);
                    // 追加
                    for (let i = 0; i < slowestStickers.length; i++) {
                        const slowest = slowestStickers[i];
                        const letter1 = numbering.filter(x => x.sticker === slowest.sticker1)[0].letter;
                        const letter2 = numbering.filter(x => x.sticker === slowest.sticker2)[0].letter;
                        const letters = `${letter1}${letter2}`;
                        const text = `${letters} (${slowest.stickers})`;
                        addCandStickers(text);
                    }
                })
                .catch((err) => {
                    alert(`エラーが発生しました: ${err}`);
                });
        })
        .catch((err) => {
            alert(`エラーが発生しました: ${err}`);
        });
};

// stickersを渡して、削除候補に入れる
const deleteCandStickers = (text) => {
    const deleteCandAreaUlistNode = document.querySelector('.editQuizListForm__deleteCandArea .editQuizListForm__uList--cand');

    const liNode = document.createElement('li');
    liNode.appendChild(document.createTextNode(text));
    liNode.addEventListener('click', () => {
        deleteCandAreaUlistNode.removeChild(liNode);
    });
    deleteCandAreaUlistNode.appendChild(liNode);
};

const submit = (part) => {
    // 追加候補になっているものをまとめて、POST
    const token = localStorage.token;
    const registeredLiNodes = document.querySelectorAll('.editQuizListForm__registeredArea .editQuizListForm__uList li');
    const addCandLiNodes = document.querySelectorAll('.editQuizListForm__addCandArea .editQuizListForm__uList--cand li');
    const deleteCandLiNodes = document.querySelectorAll('.editQuizListForm__deleteCandArea .editQuizListForm__uList--cand li');

    // "UBL UFR DFR" -> true
    const stickersHash = {};

    // 最初から登録済のものをONに
    for (let i = 0; i < registeredLiNodes.length; i++) {
        const text = registeredLiNodes[i].textContent;
        const m = text.match(/\((\S{2,3} \S{2,3} \S{2,3})\)/);
        if (!m) {
            continue;
        }

        const stickers = m[1];
        stickersHash[stickers] = true;
    }

    // 追加候補のものをONに
    for (let i = 0; i < addCandLiNodes.length; i++) {
        const text = addCandLiNodes[i].textContent;
        const m = text.match(/\((\S{2,3} \S{2,3} \S{2,3})\)/);
        if (!m) {
            continue;
        }

        const stickers = m[1];
        stickersHash[stickers] = true;
    }

    // 削除候補のものをOFFに
    for (let i = 0; i < deleteCandLiNodes.length; i++) {
        const text = deleteCandLiNodes[i].textContent;
        const m = text.match(/\((\S{2,3} \S{2,3} \S{2,3})\)/);
        if (!m) {
            continue;
        }

        const stickers = m[1];
        stickersHash[stickers] = false;
    }

    // 登録
    const instances = [];
    const keys = Object.keys(stickersHash);
    for (let i = 0; i < keys.length; i++) {
        const stickers = keys[i];
        if (!stickersHash[stickers]) {
            continue;
        }

        const m = stickers.match(/(\S{2,3}) (\S{2,3}) (\S{2,3})/);
        if (!m) {
            continue;
        }
        const buffer = m[1];
        const sticker1 = m[2];
        const sticker2 = m[3];

        const instance = {
            buffer,
            sticker1,
            sticker2,
            stickers: `${buffer} ${sticker1} ${sticker2}`,
        };
        instances.push(instance);
    }

    const options = {
        url: `${config.apiRoot}/threeStyleQuizList/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            token,
            threeStyleQuizList: instances,
        },
    };

    return rp(options)
        .then(() => {
            alert('登録しました');
        })
        .catch((err) => {
            alert(`エラー: ${err}`);
        });
};

// 登録済の問題リストを読み込んで表示
const loadList = (part) => {
    const userName = localStorage.userName;

    const problemListOptions = {
        url: `${config.apiRoot}/threeStyleQuizList/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // ナンバリング
    const numberingOptions = {
        url: `${config.apiRoot}/numbering/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    const registeredAreaUlistNode = document.querySelector('.editQuizListForm__registeredArea .editQuizListForm__uList');

    return rp(numberingOptions)
        .then((ans) => {
            const numberings = ans.success.result;

            return rp(problemListOptions)
                .then((ans) => {
                    const results = ans.success.result;

                    // 登録済みの問題数を表示
                    const problemListSizeSpan = document.querySelector('.problemListSize');
                    problemListSizeSpan.appendChild(document.createTextNode(`${results.length}問`));
                    // 登録済みの問題数を表示、ここまで

                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];

                        const liNode = document.createElement('li');

                        const letter1 = numberings.filter(x => x.sticker === result.sticker1)[0].letter;
                        const letter2 = numberings.filter(x => x.sticker === result.sticker2)[0].letter;
                        const text = `${letter1}${letter2} (${result.stickers})`;

                        liNode.appendChild(document.createTextNode(text));
                        liNode.addEventListener('click', () => {
                            deleteCandStickers(text);
                        });
                        registeredAreaUlistNode.appendChild(liNode);
                    }
                })
                .catch(() => {
                    //
                });
        })
        .catch(() => {
            //
        });
};

const deleteAllQuizzes = (userName, part) => {
    const token = localStorage.token;
    const confirmed = confirm('登録済の問題を全てリセットします。よろしいですか？');

    if (!confirmed) {
        return;
    }

    const options = {
        url: `${config.apiRoot}/threeStyleQuizList/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            token,
            threeStyleQuizList: [],
        },
    };

    return rp(options)
        .then(() => {
            location.reload(false);
        })
        .catch((err) => {
            alert(`エラー: ${err}`);
        });
};

const init = () => {
    const userName = localStorage.userName;

    // 内部表現
    // const addCandHash = {};
    // const deleteCandHash = {};
    const h2Part = document.querySelector('.h2__part');

    const urlObj = url.parse(location.href, true);

    // URLのオプションでpart=(corner|edgeMiddle)という形式で、パートが渡される
    // それ以外の場合はエラー
    const partQuery = urlObj.query.part;
    let part;
    if (partQuery === 'corner') {
        part = constant.partType.corner;
        h2Part.appendChild(document.createTextNode('コーナー'));
    } else if (partQuery === 'edgeMiddle') {
        part = constant.partType.edgeMiddle;
        h2Part.appendChild(document.createTextNode('エッジ'));
    } else {
        alert('URLが不正です: part=corner か part=edgeMiddle のどちらかを指定してください');
        return;
    }

    const inputText = document.querySelector('.editQuizListForm__inputArea__text');
    inputText.addEventListener('keyup', () => searchThreeStyles(part));

    const buttons = document.querySelectorAll('.editQuizListForm__submitBtn');
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        button.addEventListener('click', () => submit(part));
    }

    const autoAddButton = document.querySelector('.editQuizListForm__autoAddButton');
    autoAddButton.addEventListener('click', () => addStickersAutomatically(userName, part));

    const deleteAllQuizzesButton = document.querySelector('.editQuizListForm__deleteAllQuizzesButton');
    deleteAllQuizzesButton.addEventListener('click', () => deleteAllQuizzes(userName, part));

    loadList(part);
};

init();
