const partType = {
    corner: { value: 0, name: 'corner', japanese: 'コーナー', },
    edgeMiddle: { value: 1, name: 'edgeMiddle', japanese: 'エッジ', },
    edgeWing: { value: 2, name: 'edgeWing', japanese: 'ウイングエッジ', },
    centerX: { value: 3, name: 'centerX', japanese: 'Xセンター', },
    centerT: { value: 4, name: 'centerT', japanese: '+センター', },
};

// .nameや.japaneseを備えた値を初期値として入れておくため
const dummyPartType = {
    value: -1,
    name: 'dummyPartType',
    japanese: '',
};

const characterType = {
    hiragana: 'hiragana',
    alphabet: 'alphabet',
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

const edgesFUr = [
    'BDr', 'BLd', 'BRu', 'BUl',
    'DBl', 'DFr', 'DLf', 'DRb',
    'FDl', 'FLu', 'FRd', 'FUr',
    'LBu', 'LDb', 'LFd', 'LUf',
    'RBd', 'RDf', 'RFu', 'RUb',
    'UBr', 'UFl', 'ULb', 'URf',
];

const edgesUFr = [
    'BDl', 'BLu', 'BRd', 'BUr',
    'DBr', 'DFl', 'DLb', 'DRf',
    'FDr', 'FLd', 'FRu', 'FUl',
    'LBd', 'LDf', 'LFu', 'LUb',
    'RBu', 'RDb', 'RFd', 'RUf',
    'UBl', 'UFr', 'ULf', 'URb',
];

exports.partType = partType;
exports.dummyPartType = dummyPartType;
exports.characterType = characterType;
exports.faces = faces;
exports.defaultColor = defaultColor;
exports.threeStyleEvangelists = threeStyleEvangelists;
exports.edgesFUr = edgesFUr;
exports.edgesUFr = edgesUFr;
