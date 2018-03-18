const corners = [
    'BDL', 'BDR', 'BLU', 'BRU',
    'DBL', 'DBR', 'DFL', 'DFR',
    'FDL', 'FDR', 'FLU', 'FRU',
    'LBD', 'LBU', 'LDF', 'LFU',
    'RBD', 'RBU', 'RDF', 'RFU',
    'UBL', 'UBR', 'UFL', 'UFR',
];

const edges = [
    'BD', 'BL', 'BR', 'BU',
    'DB', 'DF', 'DL', 'DR',
    'FD', 'FL', 'FR', 'FU',
    'LB', 'LD', 'LF', 'LU',
    'RB', 'RD', 'RF', 'RU',
    'UB', 'UF', 'UL', 'UR',
];

const showMove = (setup, move1, move2) => {
    if (setup === '') {
        return `[${move1}, ${move2}]`;
    } else if (move1 === '' && move2 === '') {
        return `${setup}`;
    } else {
        return `${setup}, [${move1}, ${move2}]`;
    }
};

const strMax = (s1, s2) => {
    if (s1 >= s2) {
        return s1;
    }
    return s2;
};

const strMin = (s1, s2) => {
    if (s1 <= s2) {
        return s1;
    }
    return s2;
};

exports.corners = corners;
exports.edges = edges;
exports.showMove = showMove;
exports.strMax = strMax;
exports.strMin = strMin;
