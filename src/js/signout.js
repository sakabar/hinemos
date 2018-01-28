const init = () => {
    localStorage.clear();
    location.href = URL_ROOT + '/signin.html?version=v0.2.0';
};

init();
