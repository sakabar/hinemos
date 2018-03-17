const config = require('./config');

const init = () => {
    setTimeout(() => {
        location.href = `${config.urlRoot}/top.html`;
    }, 5000);
};

init();
