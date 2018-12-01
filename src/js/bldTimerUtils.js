const config = require('./config');
const Cube = require('cubejs');
const normalize = require('cube-notation-normalizer');
const _ = require('lodash');

export const TimerState = {
    stop: 0,
    holding: 1,
    ready: 2,
    updating: 3,
};

export const WAIT_THRESHOLD_MILISEC = 1000;

// 1手の回転と、それが完了したUnixtimestamp (ミリ秒)
// export const MoveOps = (notation, miliUnixtime) => {
export function MoveOps(notation, miliUnixtime) {
    // FIXME cubejsで使えるように置換するロジックが分散している気がする
    this.notation = notation.replace('2\'', '2').replace('\'2', '2'); // 回転記号
    this.miliUnixtime = miliUnixtime; // 手順を回し終えた時間(Int)
};

export const parseMoveHistoryStr = (inputStr) => {
    return inputStr.split('\n').filter(s => s !== '').map(s => {
        const lst = s.split(' ');
        return new MoveOps(lst[0], parseInt(lst[1]));
    });
}

// 1ステッカーなどの部分回転列
function SectionResult(startRecallMiliUnixtime, moveOpsList){
    // 植木算
    const miliSecPerMove = 1.0 * (moveOpsList.slice(-1)[0].miliUnixtime - moveOpsList[0].miliUnixtime) / (moveOpsList.filter(ops => ![ 'x', 'y', 'z', ].includes(ops.notation[0])).length - 1);
    const tps = 1.0 / (miliSecPerMove / 1000.0);

    const endRecallMiliUnixtime = moveOpsList[0].miliUnixtime - miliSecPerMove;
    if (typeof startRecallMiliUnixtime === 'undefined') {
        startRecallMiliUnixtime = endRecallMiliUnixtime;
    }

    this.moveOpsList = moveOpsList;
    this.movesStr = moveOpsList.map(mo => mo.notation).join(' ');

    this.startRecallMiliUnixtime = startRecallMiliUnixtime;
    this.endRecallMiliUnixtime = endRecallMiliUnixtime;
    this.endExecMiliUnixtime = moveOpsList.slice(-1)[0].miliUnixtime;

    this.recallMiliSec = this.endRecallMiliUnixtime - this.startRecallMiliUnixtime;
    this.execMiliSec = this.endExecMiliUnixtime - this.endRecallMiliUnixtime
    this.totalMiliSec = this.endExecMiliUnixtime - this.startRecallMiliUnixtime;

    this.tps = tps;
};

// 2つの状態とで、「変化があった」パーツの数を返す
// 持ち替えは変化と見なす
// cubejsのtoJSON()の結果に依存しているため、仕様変更があるとまずい
const calcDiff = (prevStateJSON, newStateJSON) => {
    const calcCenterDiff = (p, n) => {
        return _.zip(p.center, n.center).filter(pair => pair[0] !== pair[1]).length;
    };

    const calcCornerDiff = (p, n) => {
        return _.zip(p.cp, n.cp, p.co, n.co).filter(tpl => (tpl[0] !== tpl[1]) || (tpl[2] !== tpl[3])).length;
    };

    const calcEdgeDiff = (p, n) => {
        return _.zip(p.ep, n.ep, p.eo, n.eo).filter(tpl => (tpl[0] !== tpl[1]) || (tpl[2] !== tpl[3])).length;
    };

    const ans = {
        center: calcCenterDiff(prevStateJSON, newStateJSON),
        corner: calcCornerDiff(prevStateJSON, newStateJSON),
        edge: calcEdgeDiff(prevStateJSON, newStateJSON),
    };

    return ans;
};

// [{notation, miliUnixtime}]を受け取り、ステッカー単位で[[{notation, miliUnixtime}]]に変換する
// GiiKERの出力をM列、S列変換をして、かつ、x2などの持ち替え記号を消した状態のmoveOpsSeqを与える前提
export const splitMoveOpsSeq = (moveOpsSeq) => {
    const cube = new Cube();

    let prevStateJSON = undefined;
    let startMiliUnixtime = 0;
    const raps = [];
    let tmp_rap = [];

    for (let i = 0; i < moveOpsSeq.length; i++) {
        const notation = moveOpsSeq[i].notation;
        if (notation === '@') {
            // タイマー開始したタイミング (@) より前の操作はセクションに登録しない
            // @が2回以上あった場合、最後の@を優先
            startMiliUnixtime = moveOpsSeq[i].miliUnixtime;
            prevStateJSON = _.cloneDeep(cube.toJSON());
            raps.length = 0;
            tmp_rap.length = 0;

            continue;
        }

        cube.move(notation);

        // スクランブル中は以降の処理をスキップ
        if (startMiliUnixtime === 0) {
            continue;
        }

        const newStateJSON = _.cloneDeep(cube.toJSON());
        tmp_rap.push(moveOpsSeq[i]);

        // // M2していない状態からした状態に変えて比較するため
        // // GiiKERが基準面の変更が考慮しないので、持ち替えが必要
        // const parityCube = cube.clone();
        // parityCube.move('D\' L2 D M2 D\' L2 D x2');
        // const parityStateJSON = _.cloneDeep(parityCube.toJSON());

        // // M2した状態からしていない状態に変えて比較するため
        // // GiiKERが基準面の変更が考慮しないので、持ち替えが必要
        // const nonParityCube = cube.clone();
        // nonParityCube.move('x2 D\' L2 D M2 D\' L2 D');
        // const nonParityStateJSON = _.cloneDeep(nonParityCube.toJSON());

        // rotateを消した場合、x2不要
        // M2した状態からしていない状態に変えて比較するため
        const noRotationCube = cube.clone();
        noRotationCube.move('D\' L2 D M2 D\' L2 D');
        const noRotationStateJSON = _.cloneDeep(noRotationCube.toJSON());

        const diffJSON = calcDiff(prevStateJSON, newStateJSON);
        // const diffParityJSON = calcDiff(prevStateJSON, parityStateJSON);
        // const diffNonParityJSON = calcDiff(prevStateJSON, nonParityStateJSON);
        const diffNoRotationJSON = calcDiff(prevStateJSON, noRotationStateJSON);

        // const judged = diffJSON.center === 0 && ((diffJSON.edge <= 3 && diffJSON.corner <= 2) ||
        //                                          (diffJSON.edge <= 2 && diffJSON.corner <= 3) ||
        //                                          (diffParityJSON.edge <= 3 && diffParityJSON.corner <= 2) ||
        //                                          (diffParityJSON.edge <= 2 && diffParityJSON.corner <= 3))
        //       || (diffNonParityJSON.edge <= 3 && diffNonParityJSON.corner <= 2)
        //       || (diffNonParityJSON.edge <= 2 && diffNonParityJSON.corner <= 3);

        const sameCenterBool = diffJSON.center === 0 && ((diffJSON.edge <= 3 && diffJSON.corner <= 2) ||
                                                         (diffJSON.edge <= 2 && diffJSON.corner <= 3));
        const differentCenterBool = diffJSON.center !== 0 && ((diffNoRotationJSON.edge <= 4 && diffNoRotationJSON.corner <= 2) ||
                                                              (diffNoRotationJSON.edge <= 2 && diffNoRotationJSON.corner <= 3));
        const judged = sameCenterBool || differentCenterBool;

        if (judged) {
            // ここまでで1区切りの手順とする
            raps.push(tmp_rap);
            prevStateJSON = _.cloneDeep(cube.toJSON());
            tmp_rap = [];
        } else {
            // console.dir('S----')
            // console.log(notation);
            // console.log(JSON.stringify(diffJSON));
            // console.log(JSON.stringify(diffNonParityJSON));
            // console.log(JSON.stringify(diffParityJSON));
            // console.dir('E----');
        }
    }

    // 最後にtmp_rapsを掃き出す
    raps.push(tmp_rap);

    // 手順の塊ごとに整形
    let startRecallMiliUnixtime = undefined;
    const ans = raps.filter(rap => rap.length !== 0).map(rap => {
        // 最初、startRecallMiliUnixtimeがundefinedの場合はSectionResultの中でなんとかする
        const secRes = new SectionResult(startRecallMiliUnixtime, rap);
        startRecallMiliUnixtime = rap.slice(-1)[0].miliUnixtime;
        return secRes;
    });

    return ans;
};

// [ 'U', 'R', 'L', ] のようなmovesと['U', 'R', 'D', ]のようなスクランブルを比較し、
// { 一致: ['U', 'R', ], 過剰: ['L'], 残り: ['D']} のように解析する
export const compareMovesAndScramble = (moves, scramble) => {
    const normalizedMoves = normalize(moves.join(' '), {
        separator: '',
        useModifiers: false,
        uniformCenterMoves: false,
    });

    const normalizedScramble = normalize(scramble.join(' '), {
        separator: '',
        useModifiers: false,
        uniformCenterMoves: false,
    });

    const minLen = Math.min(normalizedMoves.length, normalizedScramble.length);
    for (let i = 0; i < minLen; i++) {
        if (normalizedMoves[i] !== normalizedScramble[i]) {
            const tmpMatch = normalize(normalizedMoves.slice(0, i), { separator: ' ' });
            const tmpOverdo = normalize(normalizedMoves.slice(i), { separator: ' ' });
            const tmpRemain = normalize(normalizedScramble.slice(i), { separator: ' ' });

            return {
                match: (tmpMatch === '') ? [] : tmpMatch.split(' '),
                overdo: (tmpOverdo === '') ? [] : tmpOverdo.split(' '),
                remain: (tmpRemain === '') ? [] : tmpRemain.split(' '),
            };
        }
    }

    const tmpMatch = normalize(normalizedMoves.slice(0, minLen), { separator: ' ' });
    const tmpOverdo = normalize(normalizedMoves.slice(minLen), { separator: ' ' });
    const tmpRemain = normalize(normalizedScramble.slice(minLen), { separator: ' ' });

    return {
        match: (tmpMatch === '') ? [] : tmpMatch.split(' '),
        overdo: (tmpOverdo === '') ? [] : tmpOverdo.split(' '),
        remain: (tmpRemain === '') ? [] : tmpRemain.split(' '),
    };
};

export const modifyScramble = (moves, scramble) => {
    const { match, overdo, remain, } = compareMovesAndScramble(moves, scramble);
    return (Cube.inverse(overdo.join(' ')) + ' ' + remain.join(' ')).trim();
};

const getNewMoveOpsList = (newNotationsStr, miliUnixtime) => {
    const newNotations = newNotationsStr.split(' ').filter(s => s !== '');
    return newNotations.map(newNotation => new MoveOps(newNotation, miliUnixtime));
};

const getChangeDict = () => {
    const changeDict = {};

    /* eslint-disable quotes */

    // L' R  -> M  x
    const mCube = new Cube();
    mCube.move("M x");
    changeDict["M x"] = mCube;

    // L  R' -> M' x'
    const mpCube = new Cube();
    mpCube.move("M' x'");
    changeDict["M' x'"] = mpCube;

    // L2 R2 -> M2 x2
    const m2Cube = new Cube();
    m2Cube.move("M2 x2");
    changeDict["M2 x2"] = m2Cube;

    // B  F' -> S  z'
    const sCube = new Cube();
    sCube.move("S z'");
    changeDict["S z'"] = sCube;

    // B' F  -> S' z
    const spCube = new Cube();
    spCube.move("S' z");
    changeDict["S' z"] = spCube;

    // B2 F2 -> S2 z2
    const s2Cube = new Cube();
    s2Cube.move("S2 z2");
    changeDict["S2 z2"] = s2Cube;

    /* eslint-enable */

    return changeDict;
};

// @が入っていないものだけ渡す想定
// exportしない
const mergeSliceAutoInSolve = (moveOpsList) => {
    const ans = [];
    const MAX_WINDOW_SIZE = 4;
    const changeDict = getChangeDict();

    loop: for (let startInd = 0; startInd < moveOpsList.length; startInd++) {
        // L L R Rのような、大きな塊を優先して処理
        const initialWindowWidth = Math.min(MAX_WINDOW_SIZE, moveOpsList.length - startInd);
        for (let windowWidth = initialWindowWidth; windowWidth >= 1; windowWidth--) {
            const notationsStr = _.range(startInd, startInd + windowWidth).map(t => moveOpsList[t].notation).join(' ');
            const cube = new Cube();
            cube.move(notationsStr);

            const finalMiliUnixtime = moveOpsList[startInd + windowWidth - 1].miliUnixtime;

            const keys = Object.keys(changeDict);
            for (let candIndex = 0; candIndex < keys.length; candIndex++) {
                const newNotationsStr = keys[candIndex];
                if (cube.asString() === changeDict[newNotationsStr].asString()) {
                    // 置き換えを行う
                    const newMoveOpsList = getNewMoveOpsList(newNotationsStr, finalMiliUnixtime);
                    Array.prototype.push.apply(ans, newMoveOpsList);

                    // for文の中だが、ここでstartIndを進める
                    startInd += windowWidth - 1;
                    continue loop; // ラベル付きcontinue怖い
                }
            }
        }

        // 置き換えなかった場合には、何もせずにansに追加
        const moveOps = moveOpsList[startInd];
        ans.push(moveOps);
    }

    return ans;
};

// M, M', M2, S, S', S2 に相当する回転を検知した場合に変換
// E列は検知できない。UD同時回しは普通にありうるため
export const mergeSliceAuto = (moveOpsList) => {
    // 最後の@以降を変換する
    const solveLen = _.takeRightWhile(moveOpsList, (obj) => obj.notation !== '@').length;
    const solveOpsList = moveOpsList.slice(-(solveLen),);

    // ソルブ前までのリストに、変換後をつけ加える
    const ans = moveOpsList.slice(0, -(solveLen));
    Array.prototype.push.apply(ans, mergeSliceAutoInSolve(solveOpsList));

    return ans;
};


// x'した状態で緑色(F)を回すことは、x'がなければUを回すことだ
// R' L F2 -> M' x' F2 -> M' U2
// スライスムーブが関係ない場合の持ち替えに関しては、
// 想定している挙動が違うはず。そういう場合は使えない
const rotateNotation = (rotationsStr, moveOps) => {
    const transDict = {
        x: {
            U: 'F',
            F: 'D',
            R: 'R',
            B: 'U',
            L: 'L',
            D: 'B',
            M: 'M',
            S: 'E',
            E: 'S\'',
        },
        y: {
            U: 'U',
            F: 'R',
            R: 'B',
            B: 'L',
            L: 'F',
            D: 'D',
            M: 'S',
            S: 'M',
            E: 'E',
        },
        z: {
            U: 'L',
            F: 'F',
            R: 'U',
            B: 'B',
            L: 'D',
            D: 'R',
            M: 'E',
            S: 'S',
            E: 'M\'',
        },
    };


    const notation = moveOps.notation;
    const rotations = normalize(rotationsStr, { separator: ' ', useModifiers: false }).split(' ').filter(s => s !== '');

    const newNotation = _.reduce(rotations, (ans, rotation) => {
        // 先頭の文字だけ変換
        const c0 = transDict[rotation][ans[0]];
        return `${c0}${ans.slice(1)}`;
    }, notation);
    const miliUnixtime = moveOps.miliUnixtime;

    return new MoveOps(newNotation, miliUnixtime);
};

const mergeRotationRec = (rotationsStr, acc, moveOpsList) => {
    if (moveOpsList.length === 0) {
        return acc;
    }

    const hd = moveOpsList[0];
    const tl = moveOpsList.slice(1);

    if ([ 'x', 'y', 'z', ].includes(hd.notation[0])) {
        // console.log(`Rec1: "${rotationsStr} ${hd.notation}", ${JSON.stringify(acc)}, ${JSON.stringify(tl)}`);
        // console.log(`Rec1: "${rotationsStr} ${hd.notation}", ${JSON.stringify(tl[0])}`);
        return mergeRotationRec(`${rotationsStr} ${hd.notation}`, acc, tl);
    }

    const newHd = rotateNotation(rotationsStr, hd);
    // console.log(`Rec2: "${rotationsStr}", ${JSON.stringify(acc.concat([newHd]))}, ${JSON.stringify(tl[0])}`);
    return mergeRotationRec(rotationsStr, acc.concat([newHd]), tl);
};

export const mergeRotation = (moveOpsList) => {
    return mergeRotationRec('', [], moveOpsList);
};
