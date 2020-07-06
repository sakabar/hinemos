// This software includes the work that is distributed in the Apache License 2.0.

// This source file derives from the following source lines.
// https://github.com/tribox/tribox-contest/blob/ce0f9cc16815c1808392bf8f1d9b82e021118980/contestmanager/fmcchecker.js#L26-L104

// [CHANGELOG]
// 2020/07/06
// Author: Takafumi Sakakibara
// Changes: export convAlg().


// convAlg: 手順変換
//   Sarumawashi 用に回転操作を含まない手順に変換する
// var convAlg = function(str) {
export const convAlg = (str) => {
    // まず、簡単にするために、
    // 2層回し表現を1文字にするために小文字にして、
    // 反時計回りと180度回転を90度回転に変換する
    str = str.replace(/'2/g, '2').replace(/2'/g, '2');
    str = str.replace(/'w/g, "w'");
    str = str.replace(/Rw/g, 'r').replace(/Lw/g, 'l')
        .replace(/Uw/g, 'u').replace(/Dw/g, 'd')
        .replace(/Fw/g, 'f').replace(/Bw/g, 'b');
    str = str.replace(/R'/g, 'R R R').replace(/r'/g, 'r r r')
        .replace(/L'/g, 'L L L').replace(/l'/g, 'l l l')
        .replace(/U'/g, 'U U U').replace(/u'/g, 'u u u')
        .replace(/D'/g, 'D D D').replace(/d'/g, 'd d d')
        .replace(/F'/g, 'F F F').replace(/f'/g, 'f f f')
        .replace(/B'/g, 'B B B').replace(/b'/g, 'b b b');
    str = str.replace(/R2/g, 'R R').replace(/r2/g, 'r r')
        .replace(/L2/g, 'L L').replace(/l2/g, 'l l')
        .replace(/U2/g, 'U U').replace(/u2/g, 'u u')
        .replace(/D2/g, 'D D').replace(/d2/g, 'd d')
        .replace(/F2/g, 'F F').replace(/f2/g, 'f f')
        .replace(/B2/g, 'B B').replace(/b2/g, 'b b');
    str = str.replace(/x'/g, 'x x x').replace(/x2/g, 'x x')
        .replace(/y'/g, 'y y y').replace(/y2/g, 'y y')
        .replace(/z'/g, 'z z z').replace(/z2/g, 'z z');

    // 2層回しを全体回転と1層回しに置き換える
    str = str.replace(/r/g, 'L x')
        .replace(/l/g, 'R x x x')
        .replace(/u/g, 'D y')
        .replace(/d/g, 'U y y y')
        .replace(/f/g, 'B z')
        .replace(/b/g, 'F z z z');

    // これで手順には以下の文字のみ使用されるように変換できた
    //   R, L, U, D, F, B, x, y ,z
    //console.log('only: ', str);

    // 末尾の全体回転は削除する
    while(str.slice(-2) == ' x' || str.slice(-2) == ' y' || str.slice(-2) == ' z') {
        str = str.slice(0, -2);
    }

    // 回転が無くなったら、以降のmoveがどう変換されるか辞書
    var rotMap = {
        'x': {'R': 'R', 'L': 'L', 'U': 'F', 'D': 'B', 'F': 'D', 'B': 'U', 'x': 'x', 'y': 'z', 'z': 'y y y'},
        'y': {'R': 'B', 'L': 'F', 'U': 'U', 'D': 'D', 'F': 'R', 'B': 'L', 'x': 'z z z', 'y': 'y', 'z': 'x'},
        'z': {'R': 'U', 'L': 'D', 'U': 'L', 'D': 'R', 'F': 'F', 'B': 'B', 'x': 'y', 'y': 'x x x', 'z': 'z'}
    };

    // 全体回転がなくなるまで繰り返す
    while(str.indexOf('x') != -1 || str.indexOf('y') != -1 || str.indexOf('z') != -1) {
        // x x x x みたいに消せるものを消す
        str = str.replace(/ x x x x/g, '')
            .replace(/ y y y y/g, '')
            .replace(/ z z z z/g, '');

        var arr = str.split(' ');
        var found = '';
        for (var i = 0; i < arr.length; i++) {
            if (found == '') {
                if (arr[i] == 'x' || arr[i] == 'y' || arr[i] == 'z') {
                    found = arr[i];
                    arr[i] = '';
                    continue;
                }
            }
            if (found != '') {
                // 上の規則にしたがって置換する
                arr[i] = rotMap[found][arr[i]];
            }
        }
        str = arr.join(' ');
        //console.log(str);
    }

    return str;
};
