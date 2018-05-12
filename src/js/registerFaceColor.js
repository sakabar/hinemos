const rp = require('request-promise');
const config = require('./config');
const constant = require('./constant');
// const utils = require('./utils');

const defaultColor = {
    U: '白',
    L: '橙',
    F: '緑',
    R: '赤',
    B: '青',
    D: '黄',
};

const load = (userName) => {
    const options = {
        url: `${config.apiRoot}/faceColor/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(options)
        .then((result) => {
            const faceColors = result.success.result;

            for (let i = 0; i < faceColors.length; i++) {
                const faceColor = faceColors[i];
                const text = document.querySelector(`.registerFaceColorForm__text--${faceColor.face}`);
                text.value = faceColor.color;
            }
        })
        .catch(() => {
            //
        });
};

// { U: '白', L: '橙', … } のようなデータを作り、APIにPOST
const save = () => {
    const token = localStorage.token;
    const faceColor = {};

    for (let i = 0; i < constant.faces.length; i++) {
        const face = constant.faces[i];
        const text = document.querySelector(`.registerFaceColorForm__text--${face}`);

        // 空欄もしくはスペースしか入力されていない場合、デフォルトの色を入力
        const color = (text.value.match(/^\s*$/)) ? defaultColor[face] : text.value;

        faceColor[face] = color;
    }

    const options = {
        url: `${config.apiRoot}/faceColor/`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            faceColor,
            token,
        },
    };

    rp(options)
        .then((result) => {
            alert('登録しました');
        })
        .catch(() => {
            alert('登録に失敗しました');
        });
};

const init = () => {
    const userName = localStorage.userName;

    const button = document.querySelector('.registerFaceColorForm__btn');

    if (button) {
        button.addEventListener('click', save);
        load(userName);
    }
};

init();
