const axios = require('axios');
const qs = require('qs');
const rp = require('request-promise');
const shuffle = require('shuffle-array');
const url = require('url');
const constant = require('./constant');
const config = require('./config');
const utils = require('./utils');

// ページのロード時に、daysとsolvedの設定に応じてinput属性の値を変える
// FIXME レターペアと実装が重複
const renderSettings = (days, solved, onlyOnce) => {
    const daysText = document.querySelector('.settingForm__daysText');
    const solvedRadio = document.querySelector('#settingForm__radio--solved');
    const onlyOnceCheckBox = document.querySelector('.settingForm__checkBox');

    if (days && daysText) {
        daysText.value = days;
    }

    if (solved) {
        solvedRadio.checked = true;
    }

    if (onlyOnce) {
        onlyOnceCheckBox.checked = true;
    }
};

// 入力された設定を反映
const reloadWithOptions = (part, problemListType, quizOrder, problemListId) => {
    const daysText = document.querySelector('.settingForm__daysText');

    // daysは0以上の値であることを想定
    const days = Math.max(parseFloat(daysText.value), 0);

    const solved = document.querySelector('#settingForm__radio--solved').checked;

    const onlyOnce = document.querySelector('.settingForm__checkBox').checked;

    location.href = `${config.urlRoot}/threeStyle/quiz.html?&part=${part.name}&problemListType=${problemListType.name}&solved=${solved}&days=${days}&sort=${quizOrder}&onlyOnce=${onlyOnce}&problemListId=${problemListId}`;
};

const getHint = (setup, move1, move2) => {
    if (setup === '') {
        return '(セットアップなし)';
    }

    // Cyclic Shiftの場合: 4手目まで返す
    if (move1.length === 0) {
        const setupList = setup.split(' ');
        return `[${setupList.slice(0, 4).join(' ')}    ]`;
    }

    // セットアップとmove1の1手目を返す
    const move1List = move1.split(' ');
    return `[${setup} [${move1List[0]}    ]]`;
};

const stickersToThreeStyles = (threeStyles, stickers) => {
    return {
        stickers,
        hints: threeStyles.filter(x => x.stickers === stickers).map(x => getHint(x.setup, x.move1, x.move2)),
        moves: threeStyles.filter(x => x.stickers === stickers).map(x => utils.showMove(x.setup, x.move1, x.move2)),
    };
};

// クイズに使うlettersを決定
// まだやっていない問題をシャッフルしたもの + やったことある問題を遅い順
const selectThreeStyles = (threeStyles, quizLogRes) => {
    const allThreeStyles = Array.from(new Set(threeStyles.map(x => x.stickers)));
    const solvedThreeStyles = quizLogRes.map(x => x.stickers).filter(stickers => allThreeStyles.includes(stickers));
    const unsolvedThreeStyles = allThreeStyles.filter(x => !solvedThreeStyles.includes(x));

    const unsolvedAns = shuffle(unsolvedThreeStyles.map(stickers => stickersToThreeStyles(threeStyles, stickers)), { copy: true, });
    const solvedAns = solvedThreeStyles.map(stickers => stickersToThreeStyles(threeStyles, stickers));

    return unsolvedAns.concat(solvedAns);
};

// problemListにthreeStyleの情報を付けて返す
// 問題リストにthreeStyleが登録されていないものがあっても出題
const selectFromManualList = (threeStyles, quizLogRes, problemList) => {
    if (problemList.length === 0) {
        return [];
    }

    // const problemListStickers = problemList.map(x => x.stickers);

    // stickers -> [threeStyle]
    const stickersToThreeStyles = {};
    threeStyles.map(threeStyle => {
        const stickers = threeStyle.stickers;

        if (stickers in stickersToThreeStyles) {
            stickersToThreeStyles[stickers].push(threeStyle);
        } else {
            stickersToThreeStyles[stickers] = [ threeStyle, ];
        }
    });

    const joinedProblemList = [];
    problemList.map(problem => {
        const stickers = problem.stickers;

        if (stickers in stickersToThreeStyles) {
            stickersToThreeStyles[stickers].map(t => {
                joinedProblemList.push(t);
            });
        } else {
            const rec = {
                id: undefined,
                userName: undefined,
                buffer: problem.buffer,
                sticker1: problem.sticker1,
                sticker2: problem.sticker2,
                stickers,
                setup: '',
                move1: '',
                move2: '',
            };

            joinedProblemList.push(rec);
        }
    });

    return selectThreeStyles(joinedProblemList, quizLogRes);
};

const showHint = () => {
    const hintText = document.querySelector('.quizForm__hintText');
    hintText.style.display = 'block';
};

// 次の次の問題があれば取得
const getNextNextLettersAndWords = (nextInd, selectedThreeStyles, numberings, letterPairs) => {
    const nextNextInd = nextInd + 1;
    if (nextNextInd > selectedThreeStyles.length - 1) {
        return '';
    }

    const nextLetters = selectedThreeStyles[nextNextInd].stickers.split(' ').map(sticker => numberings.filter(x => x.sticker === sticker)[0].letter).join('').replace(/@/g, '');
    // const nextWords = letterPairs.filter(x => x.letters === nextLetters).map(x => x.word).join(',');
    return `(NEXT:「${nextLetters}」)`;
};

const submit = (part, letterPairs, numberings, selectedThreeStyles, isRecalled, quizLogRes, onlyOnce) => {
    const token = localStorage.token;
    const hintText = document.querySelector('.quizForm__hintText');
    const quizIndHidden = document.querySelector('.quizForm__quizIndHidden');
    const quizFormStartUnixTimeHidden = document.querySelector('.quizForm__startUnixTimeHidden');
    const quizFormLettersText = document.querySelector('.quizForm__lettersText');
    const quizFormPrevSecText = document.querySelector('.quizForm__prevSecText');
    const quizFormPrevAnsText = document.querySelector('.quizForm__prevAnsText');

    const usedHint = hintText.style.display === 'none' ? 0 : 1;

    const ind = parseInt(quizIndHidden.value.split(':')[1]);
    if (ind > selectedThreeStyles.length - 1) {
        return;
    }

    const stickers = selectedThreeStyles[ind].stickers;
    const lst = stickers.split(' ');
    const buffer = lst[0];
    const sticker1 = lst[1];
    const sticker2 = lst[2];
    const moves = selectedThreeStyles[ind].moves;

    const startTime = parseFloat(quizFormStartUnixTimeHidden.value);
    const now = new Date().getTime();
    const sec = (now - startTime) / 1000.0;

    // secが短すぎる場合、誤操作の可能性が高いので無視
    if (sec < 0.5) {
        return;
    }

    // onlyOnceがtrueではない場合、1回ぶん回すタイムに換算
    const sendSec = onlyOnce ? sec : sec / 3.0;

    const options = {
        url: `${config.apiRoot}/threeStyleQuizLog/${part.name}`,
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            buffer,
            sticker1,
            sticker2,
            usedHint,
            isRecalled,
            token,
            sec: sendSec,
        }),
    };

    // レスポンスを利用しないので、非同期に通信する
    axios(options);

    const prevAns = '前問の答え\n' + moves.join('\n');
    if (isRecalled === 0) {
        alert(prevAns);
    }
    const nextInd = ind + 1;

    // これまでの記録との差を計算
    const quizLog = quizLogRes.filter(x => x.stickers === selectedThreeStyles[ind].stickers);
    const timeDiff = (() => {
        if (quizLog.length === 0) {
            return 0.0;
        }

        if (onlyOnce) {
            return sendSec - quizLog[0]['avg_sec'];
        } else {
            return (sendSec - quizLog[0]['avg_sec']) * 3.0;
        }
    })();

    let diffStr = '';
    if (isRecalled === 0) {
        diffStr = '';
    } else {
        if (quizLog.length > 0) {
            if (timeDiff >= 0) {
                diffStr = `(+${timeDiff.toFixed(2)})`;
            } else {
                diffStr = `(${timeDiff.toFixed(2)})`;
            }
        } else {
            diffStr = '(new)';
        }
    }

    if (nextInd <= selectedThreeStyles.length - 1) {
        quizFormStartUnixTimeHidden.value = String(new Date().getTime());
        quizIndHidden.value = `このセッションで解いた問題数:${nextInd}`;
        const letters = selectedThreeStyles[nextInd].stickers.split(' ').map(sticker => numberings.filter(x => x.sticker === sticker)[0].letter).join('').replace(/@/g, '');
        const words = letterPairs.filter(x => x.letters === letters).map(x => x.word).join(',');

        const nextLettersAndWords = getNextNextLettersAndWords(nextInd, selectedThreeStyles, numberings, letterPairs);
        quizFormLettersText.value = `${letters}: ${words} ${nextLettersAndWords}`;

        const hints = selectedThreeStyles[nextInd].hints;
        hintText.style.display = 'none';
        hintText.value = hints.join('\nまたは\n');

        quizFormPrevAnsText.value = prevAns;
        quizFormPrevSecText.value = `前問の秒数:${sec.toFixed(2)} ${diffStr}`;
    } else {
        quizIndHidden.value = `このセッションで解いた問題数:${nextInd}`;
        quizFormLettersText.value = 'お疲れ様です、ページを更新してください。';
        quizFormPrevAnsText.value = prevAns;
        quizFormPrevSecText.value = `前問の秒数:${sec.toFixed(2)} ${diffStr}`;
    }
};

// 問題リストは、全問か、それとも自分で設定した問題のみか
// 新しくproblemListを追加。いずれはallも特殊な問題リストと見なすことで、全てproblemListだけにする予定
// その時にはproblemListTypeを廃止する
const ProblemListType = {
    all: { value: 0, name: 'all', },
    manual: { value: 1, name: 'manual', },
    problemList: { value: 2, name: 'problemList', },
};

// 右/左のボタンの挙動を設定
// 画面での配置を変えた時にはこれも変えないといけない
const keyUpAction = (part, letterPairs, numberings, selectedThreeStyles, quizLogRes, onlyOnce) => {
    return (evt) => {
        // 日数のテキストボックスにフォーカスしている間は、何もしない
        if (document.activeElement.className === 'settingForm__daysText') {
            return;
        }

        if (evt.which === 37 || evt.which === 32) {
            // 左キー or Space
            submit(part, letterPairs, numberings, selectedThreeStyles, 1, quizLogRes, onlyOnce);
        } else if (evt.which === 38) {
            // 上キー
        } else if (evt.which === 39 || evt.which === 8) {
            // 右キー or BackSpace
            submit(part, letterPairs, numberings, selectedThreeStyles, 0, quizLogRes, onlyOnce);
        } else if (evt.which === 40 || evt.which === 13) {
            // 下キー or Enter
            showHint();
        }
    };
};

const init = () => {
    const userName = localStorage.userName;
    const hintBtn = document.querySelector('.quizForm__submitBtn--hint');
    const okBtn = document.querySelector('.quizForm__submitBtn--OK');
    const ngBtn = document.querySelector('.quizForm__submitBtn--NG');
    const quizFormLettersText = document.querySelector('.quizForm__lettersText');
    const hintText = document.querySelector('.quizForm__hintText');
    const quizFormStartUnixTimeHidden = document.querySelector('.quizForm__startUnixTimeHidden');
    const h2Part = document.querySelector('.h2__part');
    const onlyOnceCheckBox = document.querySelector('.settingForm__checkBox');

    // テスト時などは以降の処理をスキップ
    if (!quizFormLettersText) {
        return;
    }

    const urlObj = url.parse(location.href, true);

    // URLのオプションでpart=(corner|edgeMiddle)という形式で、パートが渡される
    // それ以外の場合はエラー
    const partQuery = urlObj.query.part;
    const part = constant.partType[partQuery];
    if (!part) {
        alert('URLが不正です: part=(corner|edgeMiddle|edgeWing|centerX|centerT) のいずれかを指定してください');
        return;
    }
    h2Part.appendChild(document.createTextNode(part.japanese));

    const days = urlObj.query.days ? parseFloat(urlObj.query.days) : 28; // 「n日間に」
    const solved = urlObj.query.solved === 'true'; // 解いた or 解いていない問題
    // FIXME 本来はこれをAPIにそのまま渡すべき
    // 本来は+avgSecのように明示したかったが、+が半角スペースに置き換わってしまうので断念
    // 'acc' -> 正解率昇順、タイム降順 (デフォルトはacc)
    // '-acc' -> 正解率降順、タイム昇順
    // '-avgSec' -> タイム降順、(かつ、sovled === triedである手順だけに絞り込む)
    // 本来は、sort順とフィルタ条件は分けるべき FIXME
    const quizOrder = urlObj.query['sort'];

    // 同じ3-style手順を3回回して復元するのではなく、1回ずつだけ回すモード
    const onlyOnce = urlObj.query['onlyOnce'] === 'true';

    // ロード時に埋める
    renderSettings(days, solved, onlyOnce);

    // URLでproblemListType=manualが指定された場合、自分が設定した問題でやる
    const problemListType = urlObj.query.problemListType === ProblemListType.manual.name ? ProblemListType.manual : ProblemListType.problemList;

    const problemListId = parseInt(urlObj.query.problemListId) || null;
    // problemListId !== null →問題リスト(複数)
    // else : これまでの処理

    // 設定読み込みボタン
    const reloadBtn = document.querySelector('.settingForm__reloadBtn');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => reloadWithOptions(part, problemListType, quizOrder, problemListId));
        onlyOnceCheckBox.addEventListener('change', () => reloadWithOptions(part, problemListType, quizOrder, problemListId));
    }

    const quizUrlStr = days ? `${config.apiRoot}/threeStyleQuizLog/${part.name}/${userName}?days=${days}` : `${config.apiRoot}/threeStyleQuizLog/${part.name}/${userName}`;

    // クイズ履歴
    const quizOptions = {
        url: quizUrlStr,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // ナンバリング
    const numberingOptions = {
        url: `${config.apiRoot}/numbering/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // レターペア
    const letterPairOptions = {
        url: `${config.apiRoot}/letterPair?userName=${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(letterPairOptions)
        .then((ans) => {
            const letterPairs = ans.success.result;

            return rp(numberingOptions)
                .then((ans) => {
                    const numberings = ans.success.result;
                    const buffer = numberings.filter(numbering => numbering.letter === '@')[0].sticker;

                    if (numberings.length === 0) {
                        return;
                    }

                    // 登録した問題
                    // 新旧の問題リストの並行稼働中は、入力タイプによってどちらAPIを叩くか分岐させる
                    const problemListOptions = (problemListType !== ProblemListType.manual) ? {
                        url: `${config.apiRoot}/getThreeStyleQuizProblemListDetail/${part.name}`,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        json: true,
                        form: problemListId ? {
                            token: localStorage.token,
                            problemListId,
                        } : {
                            token: localStorage.token,
                        },
                    }
                        : {
                            url: `${config.apiRoot}/threeStyleQuizList/${part.name}/${userName}?buffer=${buffer}`,
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            json: true,
                            form: {},
                        };

                    return rp(quizOptions)
                        .then((ans) => {
                            const quizLogRes = quizOrder === '-acc' ? ans.success.result.reverse() : ans.success.result;
                            const quizLogStickers = quizLogRes.map(x => x.stickers);

                            // 登録済の3-styleを持っておく
                            const threeStyleOptions = {
                                url: `${config.apiRoot}/threeStyle/${part.name}?userName=${userName}&buffer=${buffer}`,
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                json: true,
                                form: {},
                            };

                            return rp(threeStyleOptions)
                                .then((ans) => {
                                    // n日以内に解いた問題をやるという機能は、登録済の手順を「n日以内に解いた手順」のみにすることで実現
                                    // 得意な順に解く場合や、正解率100%の手順を遅い順で解く場合にも、同様に登録済の手順を絞り込む (あまり美しくない実現方法である。FIXME)
                                    let tmpThreeStyles = ans.success.result;
                                    if (solved || quizOrder === '-acc') {
                                        // 履歴無しの問題が出題されないようにする
                                        tmpThreeStyles = tmpThreeStyles.filter(x => quizLogStickers.includes(x.stickers));
                                    } else if (quizOrder === '-avgSec') {
                                        // 履歴無しの問題が出題されないようにする
                                        // かつ、正解率100%の手順だけ出題するようにする

                                        const quizLogStickersAccurate = quizLogRes.filter(x => x.solved === x.tried).map(x => x.stickers);
                                        tmpThreeStyles = tmpThreeStyles.filter(x => quizLogStickersAccurate.includes(x.stickers));
                                    }
                                    const threeStyles = tmpThreeStyles;

                                    return rp(problemListOptions)
                                        .then((ans) => {
                                            const problemList = ans.success.result;

                                            const selectedThreeStyles = utils.chunkAndShuffle(selectFromManualList(threeStyles, quizLogRes, problemList), 10);

                                            if (selectedThreeStyles.length === 0) {
                                                alert('出題できる3-styleがありません。先に登録してください。');
                                                return;
                                            }

                                            const stickers = selectedThreeStyles[0].stickers;
                                            const lst = stickers.split(' ');
                                            // const buffer = lst[0];
                                            const sticker1 = lst[1];
                                            const sticker2 = lst[2];

                                            const letter1 = numberings.filter(x => x.sticker === sticker1)[0].letter;
                                            const letter2 = numberings.filter(x => x.sticker === sticker2)[0].letter;
                                            const letters = letter1 + letter2;
                                            const words = letterPairs.filter(x => x.letters === letters).map(x => x.word).join(',');

                                            const nextLettersAndWords = getNextNextLettersAndWords(0, selectedThreeStyles, numberings, letterPairs);
                                            quizFormLettersText.value = `${letters}: ${words}${nextLettersAndWords}`;
                                            const hints = selectedThreeStyles[0].hints;
                                            hintText.style.display = 'none';
                                            hintText.value = hints.join('\nまたは\n');

                                            okBtn.addEventListener('click', () => submit(part, letterPairs, numberings, selectedThreeStyles, 1, quizLogRes, onlyOnce));
                                            ngBtn.addEventListener('click', () => submit(part, letterPairs, numberings, selectedThreeStyles, 0, quizLogRes, onlyOnce));
                                            hintBtn.addEventListener('click', showHint);

                                            // 左右のキーのショートカット
                                            document.onkeyup = keyUpAction(part, letterPairs, numberings, selectedThreeStyles, quizLogRes, onlyOnce);

                                            // これを前に持ってくるとウィンドウを表示している間にロードが進まないので、
                                            // ロードが終わった後に表示するようにした
                                            if (onlyOnce) {
                                                alert('onlyOnceモードです。手順を3回ではなく1回回したら「わかった」を押してください\nより実際のソルブに近い形での練習ができ、しかも通常の1/3の時間で練習できますが、キューブが崩れたまま次の手順に進むので、手順が間違っているかどうか分からない点にご注意ください。');
                                            }

                                            // 注意書きを表示した後でタイマーを計測開始
                                            quizFormStartUnixTimeHidden.value = String(new Date().getTime());
                                        })
                                        .catch((err) => {
                                            alert('1' + err);
                                            // alert('エラー');
                                        });
                                })
                                .catch((err) => {
                                    alert('2' + err);
                                    // alert('エラー');
                                });
                        })
                        .catch((err) => {
                            alert('3' + err);
                            // alert('エラー');
                        });
                })
                .catch((err) => {
                    alert('4' + err);
                    // alert('エラー');
                });
        })
        .catch((err) => {
            alert('5' + err);
            // alert('エラー');
        });
};

init();

exports.getHint = getHint;
exports.selectFromManualList = selectFromManualList;
