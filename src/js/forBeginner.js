// const rp = require('request-promise');
// const config = require('./config');
const numberingJS = require('./numbering3');
const utils = require('./utils');

// "emb__userName"クラスの子要素として、ユーザ名のノードを追加
const embedUserName = (userName) => {
    const spans = document.querySelectorAll('.emb__userName');
    for (let i = 0; i < spans.length; i++) {
        const span = spans[i];
        span.appendChild(document.createTextNode(userName));
    }
};

// "emb__edgeMiddle--FR"クラスなどの子要素として、ひらがなのノードを追加
const embedEdgeMiddleLetter = (edgeNumbering) => {
    for (let i = 0; i < utils.edges.length; i++) {
        const edge = utils.edges[i];
        const spans = document.querySelectorAll(`.emb__edgeMiddle--${edge}`);

        for (let k = 0; k < spans.length; k++) {
            const span = spans[k];
            const tmpList = edgeNumbering.filter(x => x.sticker === edge);
            const letter = tmpList.length >= 1 ? tmpList[0].letter : '(読み込み失敗)';
            span.appendChild(document.createTextNode(letter));
        }
    }
};

// "emb__corner--UBL"クラスなどの子要素として、ひらがなのノードを追加
const embedCornerLetter = (cornerNumbering) => {
    for (let i = 0; i < utils.corners.length; i++) {
        const corner = utils.corners[i];
        const spans = document.querySelectorAll(`.emb__corner--${corner}`);

        for (let k = 0; k < spans.length; k++) {
            const span = spans[k];
            const tmpList = cornerNumbering.filter(x => x.sticker === corner);
            const letter = tmpList.length >= 1 ? tmpList[0].letter : '(読み込み失敗)';
            span.appendChild(document.createTextNode(letter));
        }
    }
};

const init = () => {
    const userName = localStorage.userName;

    embedUserName(userName);

    numberingJS.getEdgeNumbering(userName)
        .then((edgeNumbering) => {
            embedEdgeMiddleLetter(edgeNumbering);

            return numberingJS.getCornerNumbering(userName)
                .then((cornerNumbering) => {
                    embedCornerLetter(cornerNumbering);
                });
        });
};

init();
