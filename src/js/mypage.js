const init = () => {
    const userName = localStorage.userName;
    const token = localStorage.token;

    const welcomeMsg = document.querySelector('.welcomeMsg');
    const textNode = document.createTextNode('ようこそ' + userName + 'さん');
    welcomeMsg.appendChild(textNode);
}

init();
