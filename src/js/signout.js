const init = () => {
    localStorage.clear();
    location.href = URL_ROOT + '/signin.html?version=v0.3.0';
};

init();
