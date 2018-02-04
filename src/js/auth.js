const rp = require('request-promise');

const init = () => {
    const token = localStorage.token;
    if (!token) {
        location.href = URL_ROOT + '/signin.html?version=v0.2.1';
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
            const ks = Object.keys(ans.success.result);
            for (let i = 0; i < ks.length; i++) {
                const key = ks[i];
                localStorage[key] = ans.success.result[key];
            }
        })
        .catch(() => {
            location.href = URL_ROOT + '/signin.html?version=v0.2.1';
        });
};

init();
