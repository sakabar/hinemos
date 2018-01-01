const init = () => {
    const userName = localStorage.userName;
    const welcomeMsg = document.querySelector('.welcomeMsg');
    const textNode = document.createTextNode('ようこそ' + userName + 'さん');
    welcomeMsg.appendChild(textNode);
};

init();
