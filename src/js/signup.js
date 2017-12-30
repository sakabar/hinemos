const rp = require('request-promise');

const submit = () => {
    const userName = document.querySelector('.signupForm__userNameText').value;
    const password = document.querySelector('.signupForm__passwordText').value;

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        url: API_ROOT + '/users',
        method: 'POST',
        headers: headers,
        json: true,
        form: {
            userName,
            password,
        },
    };

    rp(options)
        .then((htmlStr) => {
            alert('新規登録が完了しました,' + JSON.stringify(htmlStr));
        })
        .catch((err) => {
            return err;
        });
};

const init = () => {
    const submitBtn = document.querySelector('.signupForm__submitBtn');

    submitBtn.addEventListener('click', submit);
};

init();
