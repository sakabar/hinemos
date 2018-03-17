const rp = require('request-promise');
const config = require('./config');

const submit = () => {
    const userName = document.querySelector('.signupForm__userNameText').value;
    const password = document.querySelector('.signupForm__passwordText').value;

    const form = document.querySelector('.signupForm');
    if (!form.checkValidity() || password.length < 8) {
        alert('入力に問題があります');
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        url: `${config.apiRoot}/users`,
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
            alert('新規登録が完了しました');

            const authOptions = {
                url: `${config.apiRoot}/auth`,
                method: 'POST',
                headers: headers,
                json: true,
                form: {
                    userName,
                    password,
                },
            };

            rp(authOptions)
                .then((authAns) => {
                    localStorage.clear();
                    localStorage.token = authAns.success.token;
                    localStorage.userName = userName;
                    location.href = `${config.urlRoot}/mypage.html`;
                });
        })
        .catch((err) => {
            alert('そのユーザ名は既に使われています');
            return err;
        });
};

const init = () => {
    const submitBtn = document.querySelector('.signupForm__submitBtn');

    submitBtn.addEventListener('click', submit);
};

init();
