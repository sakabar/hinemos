const rp = require('request-promise');
const math = require('mathjs');

const init = () => {
    const userName = localStorage.userName;
    const msgArea = document.querySelector('.msgArea');

    // クイズ履歴
    const quizOptions = {
        url: API_ROOT + '/threeStyleQuizLog/corner/' + userName,
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
            const mean = math.mean(avgSecs);
            const sumOver5 = math.sum(over5Secs);

            const p1 = document.createElement('p');
            p1.appendChild(document.createTextNode('所要時間合計: ' + sum.toFixed(1) + '秒'));

            msgArea.appendChild(p1);

            const p3 = document.createElement('p');
            p3.appendChild(document.createTextNode('手順総数: ' + avgSecs.length));
            msgArea.appendChild(p3);

            const p2 = document.createElement('p');
            p2.appendChild(document.createTextNode('平均: ' + mean.toFixed(2) + '秒'));
            msgArea.appendChild(p2);

            const p4 = document.createElement('p');
            p4.appendChild(document.createTextNode(String(threshold) + '秒以上かかっている手順の数: ' + over5Secs.length));
            msgArea.appendChild(p4);

            const p5 = document.createElement('p');
            p5.appendChild(document.createTextNode(String(threshold) + '秒以上かかっている手順の合計時間: ' + sumOver5.toFixed(1) + '秒'));
            msgArea.appendChild(p5);

            const p6 = document.createElement('p');
            p6.appendChild(document.createTextNode(String(threshold) + '秒以上かかっている手順を3回ずつ回す練習にかかる時間: ' + (sumOver5 * 3).toFixed(1) + '秒'));
            msgArea.appendChild(p6);
        })
        .catch(() => {
            alert('エラーが発生しました');
        });
};

init();
