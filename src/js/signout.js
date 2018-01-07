const init = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    location.href = URL_ROOT + '/signin.html?version=v0.1.0';
};

init();
