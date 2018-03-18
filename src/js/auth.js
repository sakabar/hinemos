const rp = require('request-promise');
const config = require('./config');

const init = () => {
    const token = localStorage.token;
    if (!token) {
        location.href = `${config.urlRoot}/signin.html`;
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
    };

    const options = {
        url: `${config.apiRoot}/checkAuth`,
        method: 'POST',
        headers: headers,
        json: true,
        form: {
            token,
        },
    };

    rp(options)
        .then((ans) => {
            const ks = Object.keys(ans.success.result);
            for (let i = 0; i < ks.length; i++) {
                const key = ks[i];
                localStorage[key] = ans.success.result[key];
            }
        })
        .catch(() => {
            location.href = `${config.urlRoot}/signin.html`;
        });
};

init();
