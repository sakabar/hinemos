const rp = require('request-promise');
const config = require('./config');
const url = require('url');

const submit = () => {
    const userName = document.querySelector('.signinForm__userNameText').value;
    const password = document.querySelector('.signinForm__passwordText').value;

    const form = document.querySelector('.signinForm');
    if (!form.checkValidity()) {
        alert('入力に問題があります');
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        url: `${config.apiRoot}/auth`,
        method: 'POST',
        headers: headers,
        json: true,
        form: {
            userName,
            password,
        },
    };

    const checkBox = document.querySelector('.signinForm__checkBox');

    rp(options)
        .then((ans) => {
            localStorage.token = ans.success.token;
            localStorage.userName = userName;

            localStorage.rememberPassword = checkBox.checked;
            if (checkBox.checked) {
                localStorage.password = password;
            }

            const urlObj = url.parse(location.href, true);
            const redirectUrl = urlObj.query.redirect;

            let newUrl = '';
            // redirectUrlの前にurlRootを付与することで、
            // hinemos内のページにのみリダイレクトを許す
            if (redirectUrl && redirectUrl !== '') {
                newUrl = `${config.urlRoot}/${redirectUrl}?`;
            } else {
                newUrl = `${config.urlRoot}/mypage.html?`;
            }

            const keys = Object.keys(urlObj.query);
            for (let i = 0; i < keys.length; i++) {
                const paramKey = keys[i];
                if (paramKey === 'redirect') {
                    // redirectパラメータは処理済
                    continue;
                }

                const paramVal = urlObj.query[paramKey];
                newUrl = `${newUrl}&${paramKey}=${paramVal}`;
            }

            location.href = newUrl;
        })
        .catch((err) => {
            if (err.statusCode === 400) {
                alert('ユーザ名かパスワードが違います');
            } else {
                alert('サーバと通信ができません。しばらく経ってから再度お試しください');
            }
            return err;
        });
};

const inputSavedInfo = () => {
    const userNameText = document.querySelector('.signinForm__userNameText');
    const passwordText = document.querySelector('.signinForm__passwordText');

    if (localStorage.userName) {
        userNameText.value = localStorage.userName;
    }
    if (localStorage.password) {
        passwordText.value = localStorage.password;
    }
};

const init = () => {
    const submitBtn = document.querySelector('.signinForm__submitBtn');
    submitBtn.addEventListener('click', submit);

    // 「ユーザ名とパスワードを保存する」設定の場合、あらかじめフォームに入力
    // localStorageに入る値は文字列なので注意。
    if (localStorage.rememberPassword === 'true') {
        inputSavedInfo();
    }
};

init();
