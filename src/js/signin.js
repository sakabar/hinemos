const rp = require('request-promise');

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
        url: API_ROOT + '/auth',
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
            location.href = URL_ROOT + '/mypage.html?version=v0.2.1';
        })
        .catch((err) => {
            alert('ユーザ名かパスワードが違います');
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
    if (localStorage.rememberPassword) {
        inputSavedInfo();
    }
};

init();
