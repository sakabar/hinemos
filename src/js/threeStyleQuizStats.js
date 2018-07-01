const rp = require('request-promise');
const math = require('mathjs');
const config = require('./config');

const init = () => {
    const userName = localStorage.userName;
    const msgArea = document.querySelector('.msgArea');

    // クイズ履歴
    const quizOptions = {
        url: `${config.apiRoot}/threeStyleQuizLog/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    rp(quizOptions)
        .then((ans) => {
            const results = ans.success.result;

            const threshold = 6.0;
            const avgSecs = results.map(x => x.avg_sec);
            const over5Secs = avgSecs.filter(x => x >= threshold);
            const sum = math.sum(avgSecs);
            const mean = avgSecs.length === 0 ? 0 : math.mean(avgSecs);
            const sumOver5 = math.sum(over5Secs);
            const avgSecsIn6 = avgSecs.filter(x => x < threshold);
            const meanIn6 = avgSecsIn6.length === 0 ? 0 : math.mean(avgSecsIn6);

            const p1 = document.createElement('p');
            p1.appendChild(document.createTextNode(`所要時間合計: ${sum.toFixed(1)}秒 (${Math.floor(sum / 60)}分${(Math.floor(sum) % 60)}秒)`));
            msgArea.appendChild(p1);

            const p3 = document.createElement('p');
            p3.appendChild(document.createTextNode(`手順総数: ${avgSecs.length}手順`));
            msgArea.appendChild(p3);

            const p2 = document.createElement('p');
            p2.appendChild(document.createTextNode(`平均: ${mean.toFixed(2)}秒 (全体)`));
            msgArea.appendChild(p2);

            const p8 = document.createElement('p');
            p8.appendChild(document.createTextNode(`平均: ${meanIn6.toFixed(2)}秒 (${threshold}秒以内の手順)`));
            msgArea.appendChild(p8);

            const p4 = document.createElement('p');
            p4.appendChild(document.createTextNode(`${threshold}秒以上かかっている手順の数: ${over5Secs.length}手順`));
            msgArea.appendChild(p4);

            const p5 = document.createElement('p');
            p5.appendChild(document.createTextNode(`${threshold}秒以上かかっている手順の合計時間: ${sumOver5.toFixed(1)}秒 (${Math.floor(sumOver5 / 60)}分${(Math.floor(sumOver5) % 60)}秒)`));
            msgArea.appendChild(p5);

            const p6 = document.createElement('p');
            p6.appendChild(document.createTextNode(`${threshold}秒以上かかっている手順を3回ずつ回す練習にかかる時間: ${(sumOver5 * 3).toFixed(1)}秒 (${Math.floor(sumOver5 * 3 / 60)}分${Math.floor(sumOver5 * 3) % 60}秒)`));
            msgArea.appendChild(p6);
        })
        .catch((err) => {
            alert(`エラーが発生しました:${err}`);
        });
};

init();
