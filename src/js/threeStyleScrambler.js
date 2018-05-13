const shuffle = require('shuffle-array');
const utils = require('./utils');

// sticker1とsticker2のパーツを、若い順に並べる
// パーツを表す2(or 3)文字も、アルファベット順にソートする
const getPartPair = (sticker1, sticker2) => {
    const part1 = Array.from(sticker1).sort().join('');
    const part2 = Array.from(sticker2).sort().join('');

    return [ utils.strMin(part1, part2), utils.strMax(part1, part2), ];
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

// threeStyleの中から、以下の条件を満たすようにいくつかランダムに選ぶ
// 同じパーツが2回以上採用されない
// 登録済みの3-styleから選ばれる
// できるだけ多くの3-styleを選ぶ (n個選んだ後、まだ条件を満たすような選び方があるならば、停止せずに次を選ぶ)
// 必ず停止する
// 許容できる時間で停止する (曖昧...)
const pickThreeStyles = (threeStyles) => {
    if (threeStyles.length === 0) {
        return [];
    }

    const threeStyleGroups = classifyWithPartPairs(threeStyles);

    const ans = [];
    const delim = '-'; // 区切り文字。ステッカーに出てこない文字なら何でもいい

    // ペアを列挙 (`${part1}-${part2}` の形式に変形してからflatten)
    const pairs = Object.keys(threeStyleGroups).map(part1 => Object.keys(threeStyleGroups[part1]).map(part2 => `${part1}${delim}${part2}`));
    let flattenedPairs = pairs.reduce((acc, val) => acc.concat(val), []);

    while (flattenedPairs.length > 0) {
        // キーの中からランダムに1つ選ぶ
        const [ part1, part2, ] = shuffle.pick(flattenedPairs).split(delim);
        const pickedThreeStyle = shuffle.pick(threeStyleGroups[part1][part2]);
        ans.push(pickedThreeStyle);

        // 選んだkeyを削除
        delete threeStyleGroups[part1];
        delete threeStyleGroups[part2];
        // *-part1 か *-part2
        const ks = Object.keys(threeStyleGroups);
        for (let i = 0; i < ks.length; i++) {
            const key1 = ks[i];
            delete threeStyleGroups[key1][part1];
            delete threeStyleGroups[key1][part2];
        }

        const pairs = Object.keys(threeStyleGroups).map(part1 => Object.keys(threeStyleGroups[part1]).map(part2 => `${part1}${delim}${part2}`));

        // 削除後のkeysを反映
        flattenedPairs = pairs.reduce((acc, val) => acc.concat(val), []);
    }

    return ans;
};

const init = () => {
    //
};

init();

exports.getPartPair = getPartPair;
exports.classifyWithPartPairs = classifyWithPartPairs;
exports.pickThreeStyles = pickThreeStyles;
