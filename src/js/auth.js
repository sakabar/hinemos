const rp = require('request-promise');

const init = () => {
    const token = localStorage.token;
    if (!token) {
        location.href = URL_ROOT + "/signin.html";
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        url: API_ROOT + '/checkAuth',
        method: 'POST',
        headers: headers,
        json: true,
        form: {
            token,
        },
    };

    rp(options)
        .then((ans) => {
            return;
        })
        .catch((err) => {
            location.href = URL_ROOT + "/signin.html";
            return;
        });
};

init();
