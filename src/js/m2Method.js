const rp = require('request-promise');
const config = require('./config');

const m2Methods = {};
m2Methods['BD'] = 'M2 D U R2 U\' M\' U R2 U\' M D\'';
m2Methods['BL'] = 'U\' L U M2 U\' L\' U';
m2Methods['BR'] = 'U R\' U\' M2 U R U\'';
m2Methods['BU'] = '(U\' M\' U\' M\' U\' M\') U\' M (U\' M\' U\' M\' U\' M\' U\' M\')';
m2Methods['DR'] = 'U R2 U\' M2 U R2 U\'';
// m2Methods['DF'] = '(Buffer)';
m2Methods['DL'] = 'U\' L2 U M2 U\' L2 U';
m2Methods['DB'] = 'M U2 M U2';
m2Methods['FU'] = 'D M\' U R2 U\' M U R2 U\' D\' M2';
m2Methods['FR'] = 'U R U\' M2 U R\' U\'';
// m2Methods['FD'] = '(Buffer)';
m2Methods['FL'] = 'U\' L\' U M2 U\' L U';
m2Methods['LF'] = 'B L2 B\' M2 B L2 B\'';
m2Methods['LU'] = 'B L\' B\' M2 B L B\'';
m2Methods['LB'] = 'L\' B L B\' M2 B L\' B\' L';
m2Methods['LD'] = 'B L B\' M2 B L\' B\'';
m2Methods['RF'] = 'B\' R2 B M2 B\' R2 B';
m2Methods['RU'] = 'B\' R B M2 B\' R\' B';
m2Methods['RB'] = 'R B\' R\' B M2 B\' R B R\'';
m2Methods['RD'] = 'B\' R\' B M2 B\' R B';
m2Methods['UR'] = 'R U R\' U\' M2 U R U\' R\'';
m2Methods['UB'] = 'M2';
m2Methods['UL'] = 'L\' U\' L U M2 U\' L\' U L';
m2Methods['UF'] = 'U2 M\' U2 M\'';

const render = (m2Methods, numberings) => {
    const tableNode = document.querySelector('.m2Method__table');

    const l2s = numberings.l2s;
    const s2l = numberings.s2l;
    const letters = Object.keys(l2s).filter(ch => ch !== '@').sort();

    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const sticker = l2s[letter];
        const m2Method = m2Methods[sticker];

        const stickerTdNode = document.createElement('td');
        stickerTdNode.appendChild(document.createTextNode(sticker));

        const numberingTdNode = document.createElement('td');

        let t = letter;
        if (sticker === 'FU') {
            t = `${letter}←→${s2l['BD']}`;
        }
        if (sticker === 'BD') {
            t = `${letter}←→${s2l['FU']}`;
        }
        if (sticker === 'UF') {
            t = `${letter}←→${s2l['DB']}`;
        }
        if (sticker === 'DB') {
            t = `${letter}←→${s2l['UF']}`;
        }
        numberingTdNode.appendChild(document.createTextNode(t));

        const m2MethodTdNode = document.createElement('td');
        m2MethodTdNode.appendChild(document.createTextNode(m2Method));

        const textTdNode = document.createElement('td');
        const note = ''; // 備考
        textTdNode.appendChild(document.createTextNode(note));

        const trNode = document.createElement('tr');
        trNode.appendChild(stickerTdNode);
        trNode.appendChild(numberingTdNode);
        trNode.appendChild(m2MethodTdNode);
        trNode.appendChild(textTdNode);
        tableNode.appendChild(trNode);
    }
};

const loadEdgeNumbering = () => {
    const userName = localStorage.userName;
    const numberingEdgeOptions = {
        url: `${config.apiRoot}/numbering/edgeMiddle/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(numberingEdgeOptions)
        .then((result) => {
            const s2l = {};
            const l2s = {};

            const edgeNumberings = result.success.result;
            for (let i = 0; i < edgeNumberings.length; i++) {
                const sticker = edgeNumberings[i].sticker;
                const letter = edgeNumberings[i].letter;
                l2s[letter] = sticker;
                s2l[sticker] = letter;
            }

            return {
                l2s,
                s2l,
            };
        })
        .catch(() => {
            return {};
        });
};

const init = () => {
    loadEdgeNumbering()
        .then((numberings) => {
            if (numberings.s2l['DF'] !== '@') {
                throw new Error('バッファをDFステッカーに設定してください');
            }
            render(m2Methods, numberings);
        })
        .catch((err) => {
            alert(err);
        });
};

init();
