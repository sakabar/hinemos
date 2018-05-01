const rp = require('request-promise');
const url = require('url');
const config = require('./config');

const init = () => {
    const token = localStorage.token;

    // 別サイトのURLを埋め込まれて悪意あるリダイレクトをされないように、
    // ドメイン部は外す
    const urlObj = url.parse(location.href, true);
    const regexp = new RegExp(`^${config.urlRoot}/`);
    const redirectPath = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`.replace(regexp, '');

    let newUrl = `${config.urlRoot}/signin.html?redirect=${redirectPath}`;

    const keys = Object.keys(urlObj.query);
    for (let i = 0; i < keys.length; i++) {
        const paramKey = keys[i];
        if (paramKey === '') {
            continue;
        }
        const paramVal = urlObj.query[paramKey];
        newUrl = `${newUrl}&${paramKey}=${paramVal}`;
    }

    if (!token) {
        location.href = newUrl;
        return;
    }

    const options = {
        url: `${config.apiRoot}/checkAuth`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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
            location.href = newUrl;
        });
};

init();
