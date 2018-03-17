const config = require('./config');

const init = () => {
    localStorage.clear();
    location.href = `${config.urlRoot}/signin.html`;
};

init();
