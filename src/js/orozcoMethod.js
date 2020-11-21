const rp = require('request-promise');
const config = require('./config');

const edgeOrozcoMethods = {};
edgeOrozcoMethods['LU'] = '[L\' U\' L U, M\']';
edgeOrozcoMethods['LF'] = '[U\' L\' U, M\']';
edgeOrozcoMethods['LD'] = '[U\' L2 U, M\']';
edgeOrozcoMethods['LB'] = '[U\' L U, M\']';

edgeOrozcoMethods['RU'] = '[R U R\' U\', M\']';
edgeOrozcoMethods['RF'] = '[U R U\', M\']';
edgeOrozcoMethods['RD'] = '[U R2 U\', M\']';
edgeOrozcoMethods['RB'] = '[U R\' U\', M\']';

edgeOrozcoMethods['UL'] = '[M, L U L\' U\']';
edgeOrozcoMethods['FL'] = '[M, U L\' U\']';
edgeOrozcoMethods['DL'] = '[M, U L2 U\']';
edgeOrozcoMethods['BL'] = '[M, U L U\']';

edgeOrozcoMethods['UR'] = '[M, R\' U\' R U]';
edgeOrozcoMethods['FR'] = '[M, U\' R U]';
edgeOrozcoMethods['DR'] = '[M, U\' R2 U]';
edgeOrozcoMethods['BR'] = '[M, U\' R\' U]';

edgeOrozcoMethods['DF'] = '[D: [M, U\' R2 U]]';
edgeOrozcoMethods['FD'] = '[D: [U R2 U\', M\']]';
edgeOrozcoMethods['DB'] = '[D\': [M, U\' R2 U]]';
edgeOrozcoMethods['BD'] = '[D\': [U R2 U\', M\']]';

edgeOrozcoMethods['UB'] = 'M\' U M\' U M\' U M\' U2 M\' U M\' U M\' U M\'';
edgeOrozcoMethods['BU'] = '(Skip!)';

const cornerOrozcoMethods = {};
cornerOrozcoMethods['UFL'] = 'U\' (Lw\' U R\' D2 R U\' R\' D2 R2 x\') U';
cornerOrozcoMethods['UBL'] = 'Lw\' U R\' D2 R U\' R\' D2 R2 x\'';
cornerOrozcoMethods['LFU'] = 'R\' U\' R\' D\' R U R\' D R2';
cornerOrozcoMethods['LBU'] = 'R2 D R\' U R D\' R\' U\' R\'';
cornerOrozcoMethods['FLU'] = 'R2 D R\' U2 R D\' R\' U2 R\'';
cornerOrozcoMethods['BLU'] = 'R\' U2 R\' D\' R U2 R\' D R2';

cornerOrozcoMethods['LDF'] = '[U, R\' D R]';
cornerOrozcoMethods['LBD'] = '[R D\' R\', U\']';
cornerOrozcoMethods['FDR'] = '[U, D\' R\' D R]';
cornerOrozcoMethods['FDL'] = '[R D2 R\', U\']';
cornerOrozcoMethods['RBD'] = '[U, D R\' D2 R]';
cornerOrozcoMethods['RDF'] = '[D\' R D2 R\', U\']';
cornerOrozcoMethods['BDL'] = '[U, R\' D2 R]';
cornerOrozcoMethods['BDR'] = '[D R D\' R\', U\']';

cornerOrozcoMethods['DFL'] = '[x\': [R U R\', D2]]';
cornerOrozcoMethods['DFR'] = '[D\' x\': [R U R\', D2]]';
cornerOrozcoMethods['DBL'] = '[x: [D2, R\' U\' R]]';
cornerOrozcoMethods['DBR'] = '[D x: [D2, R\' U\' R]]';
cornerOrozcoMethods['RBU'] = 'R U2 R\' U\' R U\' R\' L\' U2 L U L\' U L';
cornerOrozcoMethods['BRU'] = 'L\' U\' L U\' L\' U2 L R U R\' U R U2 R\'';
cornerOrozcoMethods['UBR'] = '(Skip!)';

const renderEdge = (edgeOrozcoMethods, numberings) => {
    const tableNode = document.querySelector('.orozcoMethod__table--edge');

    const l2s = numberings.l2s;
    // const s2l = numberings.s2l;
    const buffer = l2s['@'];
    const letters = Object.keys(l2s).filter(ch => ch !== '@').sort();

    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const sticker = l2s[letter];
        const revSticker = `${sticker[1]}${sticker[0]}`;
        const orozcoMethod = buffer === 'UF' ? edgeOrozcoMethods[sticker] : edgeOrozcoMethods[revSticker];

        const stickerTdNode = document.createElement('td');
        stickerTdNode.appendChild(document.createTextNode(sticker));

        const numberingTdNode = document.createElement('td');
        numberingTdNode.appendChild(document.createTextNode(letter));

        const orozcoMethodTdNode = document.createElement('td');
        orozcoMethodTdNode.appendChild(document.createTextNode(orozcoMethod));

        const textTdNode = document.createElement('td');
        const note = ''; // 備考
        textTdNode.appendChild(document.createTextNode(note));

        const trNode = document.createElement('tr');
        trNode.appendChild(stickerTdNode);
        trNode.appendChild(numberingTdNode);
        trNode.appendChild(orozcoMethodTdNode);
        trNode.appendChild(textTdNode);
        tableNode.appendChild(trNode);
    }
};

const renderCorner = (cornerOrozcoMethods, numberings) => {
    const tableNode = document.querySelector('.orozcoMethod__table--corner');

    const l2s = numberings.l2s;
    const s2l = numberings.s2l;
    const letters = Object.keys(l2s).filter(ch => ch !== '@').sort();

    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const sticker = l2s[letter];
        const orozcoMethod = cornerOrozcoMethods[sticker];

        const stickerTdNode = document.createElement('td');
        let t1 = sticker;
        if (sticker === 'BRU') {
            t1 = 'BRU←→RBU';
        }
        if (sticker === 'RBU') {
            t1 = 'RBU←→BRU';
        }
        stickerTdNode.appendChild(document.createTextNode(t1));

        const numberingTdNode = document.createElement('td');

        let t = letter;
        if (sticker === 'BRU') {
            t = `${letter}←→${s2l['RBU']}`;
        }
        if (sticker === 'RBU') {
            t = `${letter}←→${s2l['BRU']}`;
        }
        numberingTdNode.appendChild(document.createTextNode(t));

        const orozcoMethodTdNode = document.createElement('td');
        orozcoMethodTdNode.appendChild(document.createTextNode(orozcoMethod));

        const textTdNode = document.createElement('td');
        const note = ''; // 備考
        textTdNode.appendChild(document.createTextNode(note));

        const trNode = document.createElement('tr');
        trNode.appendChild(stickerTdNode);
        trNode.appendChild(numberingTdNode);
        trNode.appendChild(orozcoMethodTdNode);
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

const loadCornerNumbering = () => {
    const userName = localStorage.userName;
    const numberingCornerOptions = {
        url: `${config.apiRoot}/numbering/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(numberingCornerOptions)
        .then((result) => {
            const s2l = {};
            const l2s = {};

            const cornerNumberings = result.success.result;
            for (let i = 0; i < cornerNumberings.length; i++) {
                const sticker = cornerNumberings[i].sticker;
                const letter = cornerNumberings[i].letter;
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
        .then((edgeNumberings) => {
            if (Object.keys(edgeNumberings.s2l).length === 0) {
                throw new Error('先にナンバリングを登録してください');
            } else if (edgeNumberings.s2l['UF'] !== '@' && edgeNumberings.s2l['FU'] !== '@') {
                throw new Error('バッファをUF/FUステッカーに設定してください');
            }
            renderEdge(edgeOrozcoMethods, edgeNumberings);

            loadCornerNumbering()
                .then((cornerNumberings) => {
                    if (Object.keys(cornerNumberings.s2l).length === 0) {
                        throw new Error('先にナンバリングを登録してください');
                    } else if (cornerNumberings.s2l['UFR'] !== '@') {
                        throw new Error('バッファをUFRステッカーに設定してください');
                    }
                    renderCorner(cornerOrozcoMethods, cornerNumberings);
                })
                .catch((err) => {
                    alert(err);
                });
        })
        .catch((err) => {
            alert(err);
        });
};

init();
