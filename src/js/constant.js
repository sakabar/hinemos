const partType = {
    corner: { value: 0, name: 'corner', },
    edgeMiddle: { value: 1, name: 'edgeMiddle', },
};

const faces = [ 'B', 'D', 'F', 'L', 'R', 'U', ];

const defaultColor = {
    U: '白',
    L: '橙',
    F: '緑',
    R: '赤',
    B: '青',
    D: '黄',
};

const threeStyleEvangelists = [
    'Ishaan_DF_UBL',
    'Graham_DF_UBL',
    'Graham_UF_UFR',
    'Jack_UF_UFR',
];

exports.partType = partType;
exports.faces = faces;
exports.defaultColor = defaultColor;
exports.threeStyleEvangelists = threeStyleEvangelists;
