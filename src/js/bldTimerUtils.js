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
    const miliSecPerMove = 1.0 * (moveOpsList.slice(-1)[0].miliUnixtime - moveOpsList[0].miliUnixtime) / (moveOpsList.length - 1);
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

        // M2していない状態からした状態に変えて比較するため
        // Giikerが基準面の変更が考慮しないので、持ち替えが必要
        const parityCube = cube.clone();
        parityCube.move('D\' L2 D M2 D\' L2 D x2');
        const parityStateJSON = _.cloneDeep(parityCube.toJSON());

        // M2した状態からしていない状態に変えて比較するため
        // Giikerが基準面の変更が考慮しないので、持ち替えが必要
        const nonParityCube = cube.clone();
        nonParityCube.move('x2 D\' L2 D M2 D\' L2 D');
        const nonParityStateJSON = _.cloneDeep(nonParityCube.toJSON());

        const diffJSON = calcDiff(prevStateJSON, newStateJSON);
        const diffParityJSON = calcDiff(prevStateJSON, parityStateJSON);
        const diffNonParityJSON = calcDiff(prevStateJSON, nonParityStateJSON);

        if (diffJSON.center === 0 && ((diffJSON.edge <= 3 && diffJSON.corner <= 2) ||
                                      (diffJSON.edge <= 2 && diffJSON.corner <= 3) ||
                                      (diffParityJSON.edge <= 3 && diffParityJSON.corner <= 2) ||
                                      (diffParityJSON.edge <= 2 && diffParityJSON.corner <= 3))
            || (diffNonParityJSON.edge <= 3 && diffNonParityJSON.corner <= 2)
            || (diffNonParityJSON.edge <= 2 && diffNonParityJSON.corner <= 3)) {
            // ここまでで1区切りの手順とする
            raps.push(tmp_rap);
            prevStateJSON = _.cloneDeep(cube.toJSON());
            tmp_rap = [];
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
