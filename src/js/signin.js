const rp = require('request-promise');

const submit = () => {
    const userName = document.querySelector('.signinForm__userNameText').value;
    const password = document.querySelector('.signinForm__passwordText').value;

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
            localStorage.userName = ans.success.result.userName;
            localStorage.token = ans.success.token;
            location.href = URL_ROOT + "/mypage.html";
        })
        .catch((err) => {
            return err;
        });
};

const init = () => {
    const submitBtn = document.querySelector('.signinForm__submitBtn');

    submitBtn.addEventListener('click', submit);
};

init();
