const constant = require('./constant');
const faceColorJS = require('./registerFaceColor');
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

// "emb__faceColor--U"クラスなどの子要素として、面の色のノードを追加
const embedFaceColor = (faceColors) => {
    for (let i = 0; i < constant.faces.length; i++) {
        const face = constant.faces[i];
        const spans = document.querySelectorAll(`.emb__faceColor--${face}`);

        for (let k = 0; k < spans.length; k++) {
            const span = spans[k];
            const tmpList = faceColors.filter(x => x.face === face);
            const color = tmpList.length >= 1 ? tmpList[0].color : constant.defaultColor[face];
            span.appendChild(document.createTextNode(color));
        }
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

                    return faceColorJS.getFaceColors(userName)
                        .then((faceColors) => {
                            embedFaceColor(faceColors);
                        });
                });
        });
};

init();
