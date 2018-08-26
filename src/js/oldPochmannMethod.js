const rp = require('request-promise');
const config = require('./config');

// FIXME M2法と大部分が重複しているのでなんとかしたい
const getOldPochmannMethods = (s2l) => {
    const oldPochmannMethods = {};
    const commonAlg = 'U\' R\' U\' R U R\' F\' R U R\' U\' R\' F';
    oldPochmannMethods['RBD'] = `R2 (${commonAlg})`;
    oldPochmannMethods['RBU'] = `R' (${commonAlg}) R'`;
    oldPochmannMethods['RDF'] = `R (${commonAlg}) R`;
    oldPochmannMethods['RFU'] = `(${commonAlg}) R2`;

    oldPochmannMethods['FDL'] = `D (「${s2l['RDF']}」手順 ) D'`;
    oldPochmannMethods['FDR'] = `D (「${s2l['RBD']}」手順 ) D'`;
    oldPochmannMethods['FLU'] = `F' D (「${s2l['RDF']}」手順 ) D' F`;
    oldPochmannMethods['FRU'] = `F D (「${s2l['RBD']}」手順 ) D' F'`;

    oldPochmannMethods['BDL'] = `D' (「${s2l['RBD']}」手順 ) D`;
    oldPochmannMethods['BDR'] = `D' (「${s2l['RDF']}」手順 ) D`;
    // oldPochmannMethods['BLU']
    oldPochmannMethods['BRU'] = `R F (「${s2l['RDF']}」手順 ) F' R'`;

    // oldPochmannMethods['LBU']
    oldPochmannMethods['LDF'] = `D2 (「${s2l['RBD']}」手順 ) D2`;
    oldPochmannMethods['LFU'] = `F2 (「${s2l['RDF']}」手順 ) F2`;
    oldPochmannMethods['LBD'] = `D2 (「${s2l['RDF']}」手順 ) D2`;

    // oldPochmannMethods['UBL']
    oldPochmannMethods['UBR'] = `R D' (「${s2l['RDF']}」手順 ) D R'`;
    oldPochmannMethods['UFR'] = `F (「${s2l['RDF']}」手順 ) F'`;
    oldPochmannMethods['UFL'] = `F (「${s2l['RFU']}」手順 ) F'`;

    oldPochmannMethods['DBR'] = `R2 F (「${s2l['RDF']}」手順 ) F' R2`;
    oldPochmannMethods['DFL'] = `F' (「${s2l['RDF']}」手順 ) F`;
    oldPochmannMethods['DFR'] = `F' (「${s2l['RFU']}」手順 ) F`;
    oldPochmannMethods['DBL'] = `D F' (「${s2l['RDF']}」手順 ) F D'`;

    return oldPochmannMethods;
};

const render = (numberings) => {
    const tableNode = document.querySelector('.oldPochmannMethod__table');

    const l2s = numberings.l2s;
    const s2l = numberings.s2l;
    const letters = Object.keys(l2s).filter(ch => ch !== '@').sort();

    const oldPochmannMethods = getOldPochmannMethods(s2l);

    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const sticker = l2s[letter];

        const stickerTdNode = document.createElement('td');
        stickerTdNode.appendChild(document.createTextNode(sticker));

        const numberingTdNode = document.createElement('td');
        numberingTdNode.appendChild(document.createTextNode(letter));

        // ステッカーによって色分け
        const colorRBD = '#2acf44';
        // const colorRBU = '#000000';
        const colorRDF = '#cf2a44';
        const colorRFU = '#2a44cf';

        // 色分けのための正規表現
        const reRBD = new RegExp(`${s2l['RBD']}`);
        // const reRBU = new RegExp(`${s2l['RBU']}`);
        const reRDF = new RegExp(`${s2l['RDF']}`);
        const reRFU = new RegExp(`${s2l['RFU']}`);

        if (reRBD.test(letter)) {
            numberingTdNode.style.backgroundColor = colorRBD;
            numberingTdNode.style.color = '#ffffff';
        // } else if (reRBU.test(letter)) {
        //     numberingTdNode.style.color = colorRBU;
        } else if (reRDF.test(letter)) {
            numberingTdNode.style.backgroundColor = colorRDF;
            numberingTdNode.style.color = '#ffffff';
        } else if (reRFU.test(letter)) {
            numberingTdNode.style.backgroundColor = colorRFU;
            numberingTdNode.style.color = '#ffffff';
        }

        const oldPochmannMethodTdNode = document.createElement('td');
        const oldPochmannMethod = oldPochmannMethods[sticker];

        const setupMatch = oldPochmannMethod.match(/^[^(]*/);
        const setup = setupMatch ? setupMatch[0] : '';

        const bodyAlgMatch = oldPochmannMethod.match(/\(.*\)/);
        const bodyAlg = bodyAlgMatch ? bodyAlgMatch[0] : '';

        const revSetupMatch = oldPochmannMethod.match(/[^)]*$/);
        const revSetup = revSetupMatch ? revSetupMatch[0] : '';

        const setupNode = document.createTextNode(setup);
        const bodyAlgNode = document.createElement('b');
        bodyAlgNode.appendChild(document.createTextNode(bodyAlg));

        // セットアップ後のステッカーによって色分け
        if (reRBD.test(bodyAlg)) {
            bodyAlgNode.style.color = colorRBD;
        // } else if (reRBU.test(bodyAlg)) {
        //     bodyAlgNode.style.color = colorRBU;
        } else if (reRDF.test(bodyAlg)) {
            bodyAlgNode.style.color = colorRDF;
        } else if (reRFU.test(bodyAlg)) {
            bodyAlgNode.style.color = colorRFU;
        }

        const revSetupNode = document.createTextNode(revSetup);

        oldPochmannMethodTdNode.appendChild(setupNode);
        oldPochmannMethodTdNode.appendChild(bodyAlgNode);
        oldPochmannMethodTdNode.appendChild(revSetupNode);

        const textTdNode = document.createElement('td');
        const note = ''; // 備考
        textTdNode.appendChild(document.createTextNode(note));

        const trNode = document.createElement('tr');
        trNode.appendChild(stickerTdNode);
        trNode.appendChild(numberingTdNode);
        trNode.appendChild(oldPochmannMethodTdNode);
        trNode.appendChild(textTdNode);
        tableNode.appendChild(trNode);
    }
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
    loadCornerNumbering()
        .then((numberings) => {
            render(numberings);
        })
        .catch((err) => {
            alert(err);
        });
};

init();
