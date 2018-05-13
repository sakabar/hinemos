const utils = require('./utils');

// sticker1とsticker2のパーツを、若い順に並べる
// パーツを表す2(or 3)文字も、アルファベット順にソートする
const getPartPair = (sticker1, sticker2) => {
    const part1 = Array.from(sticker1).sort().join('');
    const part2 = Array.from(sticker2).sort().join('');

    return [ utils.strMin(part1, part2), utils.strMax(part1, part2) ];
};

const classifyWithPartPairs = (threeStyles) => {
    if (threeStyles.length === 0) {
        return {};
    }

    const ans = {};

    for (let i = 0; i < threeStyles.length; i++) {
        const threeStyle = threeStyles[i];
        const [ part1, part2, ] = getPartPair(threeStyle.sticker1, threeStyle.sticker2);

        if (part1 in ans) {
            if (part2 in ans[part1]) {
                ans[part1][part2].push(threeStyle);
            } else {
                ans[part1][part2] = [ threeStyle, ];
            }
        } else {
            ans[part1] = {};
            ans[part1][part2] = [ threeStyle, ];
        }
    }

    return ans;
};

const init = () => {
    //
};

init();

exports.getPartPair = getPartPair;
exports.classifyWithPartPairs = classifyWithPartPairs;
