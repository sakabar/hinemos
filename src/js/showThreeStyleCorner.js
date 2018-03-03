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
    const letters = lettersText.value;

    const elms = document.getElementsByName('showThreeStyleCornerForm__radio');
    const checkedBtn = [ ...elms, ].find(elm => elm.checked);
    if (!checkedBtn) {
        // HTMLで最初から片方選択されており、チェックは外せないので、
        // どちらも選ばれていない状況は起こらないと思うが、念のため
        alert('前方/後方一致のどちらかを選んでください');
        return;
    }
    // FIXME 後で使う
    // const searchCond = checkedBtn.value;

    // 2文字だったらその2文字に対応する3-style手順を表示
    // 1文字だったら前方/後方一致の条件によって複数引いて表示
    if (letters.length === 1) {
        // alert(`FIXME ボタンが押されました。これはまだ実装されていません。${letters}, ${searchCond}`);
        // FIXME
        alert('エラー: 2文字入力してください');
    } else if (letters.length === 2) {
        // lettersから3-styleを引く
        const threeStyleCornerOptions = {
            url: API_ROOT + '/threeStyleFromLetters/corner?userName=' + userName + '&letters=' + letters,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            json: true,
            form: {},
        };

        rp(threeStyleCornerOptions)
            .then((ans) => {
                const results = ans.success.result;

                if (results.length === 0) {
                    // 結果が無い場合は、登録するための表示
                    const liNode = document.createElement('li');
                    const textNode = document.createTextNode(`${letters} 3-style未登録 `);
                    const btnNode = document.createElement('input');
                    btnNode.type = 'button';
                    btnNode.className = 'showThreeStyleCornerForm__registerBtn';
                    btnNode.value = '登録';
                    btnNode.style.borderColor = '#00ff00';
                    btnNode.addEventListener('click', () => openRegisterPage(letters));

                    liNode.appendChild(textNode);
                    liNode.appendChild(btnNode);
                    olNode.appendChild(liNode);
                } else {
                    // 結果がある場合は、それを表示
                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];
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
                }
            })
            .catch(() => {
                alert('エラーが発生しました');
            });
    } else {
        // alert('エラー: 1文字か2文字を入力してください');
        // FIXME
        alert('エラー: 2文字入力してください');
    }
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
