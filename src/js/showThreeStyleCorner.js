const rp = require('request-promise');

// FIXME threeStyleQuizCornerと重複しているので統合する
const showMove = (setup, move1, move2) => {
    if (setup === '') {
        return '[' + move1 + ',' + move2 + ']';
    } else {
        return '[' + setup + ' [' + move1 + ',' + move2 + ']]';
    }
};

// 3-style登録ページを開く
const openRegisterPage = (letters) => {
    window.open(URL_ROOT + '/threeStyle/registerCorner.html?version=v0.2.4&letters=' + letters);
};

// threeStyleを削除する
const deleteThreeStyle = (id) => {
    const token = localStorage.token;

    const olNode = document.querySelector('.showThreeStyleCornerForm__oList');

    const deleteOption = {
        url: API_ROOT + '/deleteThreeStyle/corner',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            id,
            token,
        },
    };

    rp(deleteOption)
        .then(() => {
            const liNode = document.querySelector(`.showThreeStyleCornerForm__oList__list--id${id}`);
            olNode.removeChild(liNode);
        })
        .catch(() => {
            alert('削除中に何らかのエラーが発生しました');
        });
};

// タブを開きっぱなしの場合にも対応できるように、
// 検索ボタンを押した時に最新の情報を取得する
const submit = () => {
    const userName = localStorage.userName;

    const olNode = document.querySelector('.showThreeStyleCornerForm__oList');
    // まずolNodeの要素を空に
    while (olNode.firstChild) {
        olNode.removeChild(olNode.firstChild);
    };

    const lettersText = document.querySelector('.showThreeStyleCornerForm__lettersText');
    const inputLetters = lettersText.value;

    const elms = document.getElementsByName('showThreeStyleCornerForm__radio');
    const checkedBtn = [ ...elms, ].find(elm => elm.checked);
    if (!checkedBtn) {
        // HTMLで最初から片方選択されており、チェックは外せないので、
        // どちらも選ばれていない状況は起こらないと思うが、念のため
        alert('前方/後方一致のどちらかを選んでください');
        return;
    }

    const searchCond = checkedBtn.value;

    // ナンバリング
    const numberingOptions = {
        url: API_ROOT + '/numbering/corner/' + userName,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(numberingOptions)
        .then((numberingResult) => {
            const numberings = numberingResult.success.result.sort((a, b) => { if (a.letter < b.letter) return -1; if (a.letter === b.letter) return 0; if (a.letter > b.letter) return 1; });

            if (numberings.length === 0) {
                alert('先にナンバリングを登録してください');
                return;
            }

            const buffer = numberings.filter(numbering => numbering.letter === '@').map(numbering => numbering.sticker)[0];

            // ありうる3-styleの文字 [{letters: 'あか', stickers: 'UBL UFR DFR'}]
            const allLetterPerms = [];

            for (let i = 0; i < numberings.length; i++) {
                const numbering1 = numberings[i];

                // バッファはスキップ
                if (numbering1.letter === '@') {
                    continue;
                }

                for (let k = 0; k < numberings.length; k++) {
                    const numbering2 = numberings[k];

                    // バッファはスキップ
                    if (numbering2.letter === '@') {
                        continue;
                    }

                    const sticker1 = numbering1.sticker;
                    const sticker2 = numbering2.sticker;

                    // 同じパーツの場合はスキップ
                    if (JSON.stringify(Array.from(sticker1).sort()) === JSON.stringify(Array.from(sticker2).sort())) {
                        continue;
                    }

                    const v = {
                        letters: `${numbering1.letter}${numbering2.letter}`,
                        stickers: `${buffer} ${sticker1} ${sticker2}`,
                    };

                    allLetterPerms.push(v);
                }
            }

            // 列挙した文字から、条件にマッチするもののみを抽出
            let selectedPerms = [];
            if (inputLetters === '') {
                selectedPerms = allLetterPerms;
            } else {
                if (searchCond === '後方一致') {
                    selectedPerms = allLetterPerms.filter(perm => perm.letters.endsWith(inputLetters));
                } else {
                    // 想定していない入力が入った場合は、前方一致として扱う
                    selectedPerms = allLetterPerms.filter(perm => perm.letters.startsWith(inputLetters));
                }
            }

            const threeStyleCornerOptions = {
                url: API_ROOT + '/threeStyle/corner?userName=' + userName,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                json: true,
                form: {},
            };

            return rp(threeStyleCornerOptions)
                .then((ans) => {
                    const results = ans.success.result;

                    // 何回も引くことになるのでハッシュ化
                    let threeStyleHash = {};
                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];

                        const stickers = result.stickers;
                        if (stickers in threeStyleHash) {
                            threeStyleHash[stickers].push(result);
                        } else {
                            threeStyleHash[stickers] = [ result, ];
                        }
                    }

                    for (let i = 0; i < selectedPerms.length; i++) {
                        const perm = selectedPerms[i];

                        if (perm.stickers in threeStyleHash) {
                            // 結果がある場合は、それを表示
                            const lst = threeStyleHash[perm.stickers];
                            for (let k = 0; k < lst.length; k++) {
                                const result = lst[k];
                                const id = result.id;
                                const buffer = result.buffer;
                                const sticker1 = result.sticker1;
                                const sticker2 = result.sticker2;
                                const setup = result.setup;
                                const move1 = result.move1;
                                const move2 = result.move2;
                                const moveStr = showMove(setup, move1, move2);

                                const liNode = document.createElement('li');
                                liNode.className = `showThreeStyleCornerForm__oList__list--id${id}`;

                                const letters = perm.letters;
                                const textNode = document.createTextNode(`${letters} ${buffer} ${sticker1} ${sticker2} ${moveStr} `);
                                const btnNode = document.createElement('input');
                                btnNode.type = 'button';
                                btnNode.className = 'showThreeStyleCornerForm__deleteBtn';
                                btnNode.value = '削除';
                                btnNode.style.borderColor = '#ff0000';
                                btnNode.addEventListener('click', () => deleteThreeStyle(id));

                                liNode.appendChild(textNode);
                                liNode.appendChild(btnNode);
                                olNode.appendChild(liNode);
                            }
                        } else {
                            // 結果が無い場合は、登録するための表示
                            const liNode = document.createElement('li');
                            const textNode = document.createTextNode(`${perm.letters} ${perm.stickers} 3-style未登録 `);
                            const btnNode = document.createElement('input');
                            btnNode.type = 'button';
                            btnNode.className = 'showThreeStyleCornerForm__registerBtn';
                            btnNode.value = '登録';
                            btnNode.style.borderColor = '#00ff00';
                            btnNode.addEventListener('click', () => openRegisterPage(perm.letters));

                            liNode.appendChild(textNode);
                            liNode.appendChild(btnNode);
                            olNode.appendChild(liNode);
                        }
                    }
                })
                .catch((err) => {
                    alert(`3-style読み込み中にエラーが発生しました: ${err}`);
                });
        })
        .catch(() => {
            alert('ナンバリング読み込み中にエラーが発生しました');
        });
};

const init = () => {
    const submitBtn = document.querySelector('.showThreeStyleCornerForm__submitBtn');
    submitBtn.addEventListener('click', submit);
    // やりたいこと
    // 1. ひらがな1文字を入れる
    // 2. 前方 or 後方一致を選択
    // 3. Go
    // 4. 3-style一覧を表示
    // 5. 登録済の手順を削除 or 未登録の手順を登録
};

init();
