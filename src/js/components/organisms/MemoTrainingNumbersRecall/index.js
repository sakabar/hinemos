import React from 'react';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Txt from '../../atoms/Txt';
import Button from '../../atoms/Button';
import MemoTimer from '../../molecules/MemoTimer';
const memoTrainingUtils = require('../../../memoTrainingUtils');

const _ = require('lodash');

const MemoTrainingNumbersRecall = ({
    // startMemoMiliUnixtime,
    // startRecallMiliUnixtime,
    timerMiliUnixtime,
    timeVisible,
    isLefty,

    decks,
    deckInd,
    pairInd,
    posInd,

    solution,

    handDict,
    handSuits, // 手札を並べる順番

    sagaFinishRecallPhase,

    sagaToggleTimer,
    selectHole,
    goToPrevDeckRecall,
    goToNextDeckRecall,
    sagaSelectHand,
}) => {
    return (
        <div>
            <Button color="primary" value="回答終了" onClick={(e) => sagaFinishRecallPhase()}/>
            <Br/>

            <Txt>{deckInd + 1}束目</Txt>
            <Br/>
            {
                (() => {
                    let cnt = 1;

                    // ここで、finishMemorizationPhaseした段階で1桁1イメージのデッキに変換されていることに注意
                    const components = decks[deckInd].map((pair, holePairInd) => {
                        return pair.map((elem, holePosInd) => {
                            const tag = (() => {
                                if (solution[deckInd] && solution[deckInd][holePairInd] && solution[deckInd][holePairInd][holePosInd]) {
                                    return solution[deckInd][holePairInd][holePosInd].tag;
                                }

                                return null;
                            })();

                            const val = tag || `[${cnt}]`;
                            cnt += 1;

                            const holeColor = (() => {
                                if (pairInd === holePairInd && posInd === holePosInd) {
                                    return 'warning';
                                } else if (!tag) {
                                    return 'secondary';
                                } else {
                                    return 'light';
                                }
                            })();

                            return (<Button color={holeColor} value={val} style={ { width: '4em', height: '3em', fontFamily: [ 'Courier New', 'monospace', ], }} key={`${deckInd}-${holePairInd}-${holePosInd}`} onClick={ () => { selectHole(deckInd, holePairInd, holePosInd); }}/>);
                        });
                    });

                    // _.reverse()は破壊的なメソッドだが、_.flattenDeep()によって新しい配列が生成されているので、その新しい配列が破壊されても問題ない
                    const flatten = isLefty ? _.flattenDeep(components) : _.reverse(_.flattenDeep(components));

                    // 横一列に何桁表示するか
                    const chunkSize = 10;
                    return _.chunk(flatten, chunkSize).map((bulk, bulkInd) => {
                        return (
                            <div key={bulkInd}>
                                {bulk}
                            </div>
                        );
                    });
                })()
            }
            <Br/>

            <Button color="primary" value="←←" onClick={(e) => goToPrevDeckRecall()} disabled={deckInd === 0} />
            <Button color="primary" value="→→" onClick={(e) => goToNextDeckRecall()} disabled={deckInd === decks.length - 1}/>
            <MemoTimer timeVisible={timeVisible} timerMiliUnixtime={timerMiliUnixtime} sagaToggleTimer={sagaToggleTimer}/>

            <Br/>

            <div>
                {
                    (() => {
                        return _.range(0, 10).map(numberInd => {
                            const element = new memoTrainingUtils.NumberElement(String(numberInd));
                            return (<Button color="light" value={String(numberInd)} style={ { width: '4em', height: '3em', fontFamily: [ 'Courier New', 'monospace', ], }} key={`${numberInd}`} disabled={false} onClick={ () => { sagaSelectHand(element); }}/>);
                        });
                    })()
                }
            </div>
            <Br/>

            <div>
                {
                    (() => {
                        // 設定画面で充分に下スクロールできるように空白を設けた
                        // FIXME レイアウトのためのbrはバッドノウハウ
                        return [ ...Array(5).keys(), ].map(i => {
                            return (<Br key={i} />);
                        });
                    })()
                }
            </div>
            <Br/>
        </div>
    );
};

MemoTrainingNumbersRecall.propTypes = {
    timerMiliUnixtime: PropTypes.number.isRequired,
    timeVisible: PropTypes.bool.isRequired,

    isLefty: PropTypes.bool.isRequired,

    decks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
    deckInd: PropTypes.number.isRequired,
    pairInd: PropTypes.number.isRequired,
    posInd: PropTypes.number.isRequired,

    handDict: PropTypes.object.isRequired,
    handSuits: PropTypes.array.isRequired,

    solution: PropTypes.array.isRequired,

    sagaToggleTimer: PropTypes.func.isRequired,

    sagaFinishRecallPhase: PropTypes.func.isRequired,

    selectHole: PropTypes.func.isRequired,
    goToPrevDeckRecall: PropTypes.func.isRequired,
    goToNextDeckRecall: PropTypes.func.isRequired,
    sagaSelectHand: PropTypes.func.isRequired,
};

export default MemoTrainingNumbersRecall;
