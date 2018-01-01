const rp = require('request-promise');

const submit = () => {
    const userName = document.querySelector('.signinForm__userNameText').value;
    const password = document.querySelector('.signinForm__passwordText').value;

    const form = document.querySelector('.signinForm');
    if (! form.checkValidity()) {
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

    rp(options)
        .then((ans) => {
            localStorage.clear();
            localStorage.token = ans.success.token;
            localStorage.userName = userName;
            location.href = URL_ROOT + '/mypage.html?version=0.0.1';
        })
        .catch((err) => {
            alert('ユーザ名かパスワードが違います');
            return err;
        });
};

const init = () => {
    const submitBtn = document.querySelector('.signinForm__submitBtn');

    submitBtn.addEventListener('click', submit);
};

init();
