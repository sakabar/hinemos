const rp = require('request-promise');
const math = require('mathjs');
const url = require('url');
const config = require('./config');
const constant = require('./constant');
const threeStyleUtils = require('./threeStyleUtils');

const renderStats = (threeStyles, threeStyleQuizLog, problemList) => {
    const msgArea = document.querySelector('.msgArea');

    const threeStyleStickerSet = new Set(threeStyles.map(x => x.stickers));

    const avgSecs = threeStyleQuizLog.map(x => x.avg_sec);
    // FIXME 3がマジックナンバー
    const over5Secs = threeStyleQuizLog.filter(x => x.solved < 3).map(x => x.avg_sec);
    const sum = math.sum(avgSecs);
    const avgSecsWithoutZero = threeStyleQuizLog.filter(x => x.avg_sec > 0).map(x => x.avg_sec);
    const mean = avgSecsWithoutZero.length === 0 ? 0 : math.mean(avgSecsWithoutZero);
    const avgSecsIn6 = threeStyleQuizLog.filter(x => x.solved >= 3).map(x => x.avg_sec);
    const meanIn6 = avgSecsIn6.length === 0 ? 0 : math.mean(avgSecsIn6);
    const newnessList = threeStyleQuizLog.map(x => x.newness);
    const worstNewness = newnessList.length === 0 ? 0 : Math.min(...newnessList);
    const avgNewness = newnessList.length === 0 ? 0 : math.mean(newnessList);
    const problemListStickers = problemList.map(x => x.stickers);
    const threeStylesInProblemList = threeStyleQuizLog.filter(x => problemListStickers.includes(x.stickers));
    const avgSecInThreeStylesInProblemListWithoutZero = threeStylesInProblemList.filter(x => x.avg_sec > 0).map(x => x.avg_sec);
    const meanInProblemList = avgSecInThreeStylesInProblemListWithoutZero.length === 0 ? 0 : math.mean(avgSecInThreeStylesInProblemListWithoutZero);

    const p1 = document.createElement('p');
    p1.appendChild(document.createTextNode(`所要時間合計: ${sum.toFixed(1)}秒 (${Math.floor(sum / 60)}分${(Math.floor(sum) % 60)}秒)`));
    msgArea.appendChild(p1);

    const p3 = document.createElement('p');
    // ここ、マジックナンバー入っている FIXME
    p3.appendChild(document.createTextNode(`28日間で解いた手順数: ${avgSecs.length}/${threeStyleStickerSet.size}手順`));
    msgArea.appendChild(p3);

    const p9 = document.createElement('p');
    p9.appendChild(document.createTextNode(`平均の「鮮度」: ${avgNewness.toFixed(1)}日`));
    msgArea.appendChild(p9);

    const p10 = document.createElement('p');
    p10.appendChild(document.createTextNode(`「鮮度」が最も悪い問題の鮮度 : ${worstNewness}日`));
    msgArea.appendChild(p10);

    const p2 = document.createElement('p');
    p2.appendChild(document.createTextNode(`平均: ${mean.toFixed(2)}秒 (全体)`));
    msgArea.appendChild(p2);

    const p8 = document.createElement('p');
    p8.appendChild(document.createTextNode(`平均: ${meanIn6.toFixed(2)}秒 (直近で3回連続で正解できた手順)`));
    msgArea.appendChild(p8);

    const p12 = document.createElement('p');
    p12.appendChild(document.createTextNode(`平均: ${meanInProblemList.toFixed(2)}秒 (問題リスト内)`));
    msgArea.appendChild(p12);

    const p4 = document.createElement('p');
    p4.appendChild(document.createTextNode(`直近で3回連続で正解できなかった手順: ${over5Secs.length}手順`));
    msgArea.appendChild(p4);

    const p11 = document.createElement('p');
    // FIXME 3がマジックナンバー
    p11.appendChild(document.createTextNode(`問題リストの中で、直近で3回連続で正解できなかった手順: ${threeStylesInProblemList.filter(x => x.solved < 3).length}/${threeStylesInProblemList.length}手順`));
    msgArea.appendChild(p11);
};

const init = () => {
    const userName = localStorage.userName;
    const h2Part = document.querySelector('.h2__part');

    const urlObj = url.parse(location.href, true);

    // URLのオプションでpart=(corner|edgeMiddle)という形式で、パートが渡される
    // それ以外の場合はエラー
    const partQuery = urlObj.query.part;
    let part;
    if (partQuery === 'corner') {
        part = constant.partType.corner;
        h2Part.appendChild(document.createTextNode('コーナー'));
    } else if (partQuery === 'edgeMiddle') {
        part = constant.partType.edgeMiddle;
        h2Part.appendChild(document.createTextNode('エッジ'));
    } else {
        alert('URLが不正です: part=corner か part=edgeMiddle のどちらかを指定してください');
        return;
    }

    // クイズ履歴
    const quizOptions = {
        url: `${config.apiRoot}/threeStyleQuizLog/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // 問題リスト
    const problemListOptions = {
        url: `${config.apiRoot}/threeStyleQuizList/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return threeStyleUtils.getThreeStyles(userName, part)
        .then((threeStyles) => {
            return rp(quizOptions)
                .then((ans) => {
                    const threeStyleQuizLog = ans.success.result;

                    return rp(problemListOptions)
                        .then((threeStyleQuizListAns) => {
                            const problemList = threeStyleQuizListAns.success.result;
                            return renderStats(threeStyles, threeStyleQuizLog, problemList);
                        })
                        .catch((err) => {
                            alert(`エラーが発生しました:${err}`);
                        });
                })
                .catch((err) => {
                    alert(`エラーが発生しました:${err}`);
                });
        })
        .catch((err) => {
            alert(`エラーが発生しました:${err}`);
        });
};

init();
