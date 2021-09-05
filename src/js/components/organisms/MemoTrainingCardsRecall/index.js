import React from 'react';
import PropTypes from 'prop-types';
import {
    chunk as _chunk,
    flattenDeep as _flattenDeep,
    reverse as _reverse,
} from 'lodash-es';
import Br from '../../atoms/Br';
import Txt from '../../atoms/Txt';
import Button from '../../atoms/Button';
import MemoTimer from '../../molecules/MemoTimer';
const memoTrainingUtils = require('../../../memoTrainingUtils');

const getColor = (tag) => {
    if (!tag) {
        return 'black';
    }

    if ([ 'C', 'S', ].includes(tag[0])) {
        return 'black';
    } else if ([ 'D', 'H', ].includes(tag[0])) {
        return 'red';
    } else {
        return 'black';
    }
};

const MemoTrainingCardsRecall = ({
    startMemoMiliUnixtime,
    startRecallMiliUnixtime,
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
            {/* <Txt>{deckInd + 1}束目の{pairInd}-{posInd}</Txt> */}
            <Button color="primary" value="回答終了" onClick={(e) => sagaFinishRecallPhase()}/>
            <Br/>

            <Txt>記憶時間:{((startRecallMiliUnixtime - startMemoMiliUnixtime) / 1000.0).toFixed(2)}秒</Txt>
            <Br/>

            <Txt>{deckInd + 1}束目</Txt>
            <Br/>
            {
                (() => {
                    let cnt = 1;
                    const components = decks[deckInd].map((pair, holePairInd) => {
                        return pair.map((elem, holePosInd) => {
                            const tag = (() => {
                                if (solution[deckInd] && solution[deckInd][holePairInd] && solution[deckInd][holePairInd][holePosInd]) {
                                    return solution[deckInd][holePairInd][holePosInd].tag;
                                }

                                return null;
                            })();

                            const val = tag ? memoTrainingUtils.cardTagToMarkStr(tag) : `[${cnt}]`;
                            const color = getColor(tag);
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

                            return (<Button color={holeColor} value={val} style={ { color, width: '4em', height: '3em', fontFamily: [ 'Courier New', 'monospace', ], }} key={`${deckInd}-${holePairInd}-${holePosInd}`} onClick={ () => { selectHole(deckInd, holePairInd, holePosInd); }}/>);
                        });
                    });

                    // _.reverse()は破壊的なメソッドだが、_.flattenDeep()によって新しい配列が生成されているので、その新しい配列が破壊されても問題ない
                    const flatten = isLefty ? _flattenDeep(components) : _reverse(_flattenDeep(components));

                    const chunkSize = 12;
                    return _chunk(flatten, chunkSize).map((bulk, bulkInd) => {
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
            {
                (() => {
                    return handSuits.map((suit, suitInd) => {
                        const cards = memoTrainingUtils.getSameSuitCards(suit);
                        return (
                            <div key={suitInd}>
                                {
                                    cards.map((element, cardInd) => {
                                        const color = getColor(element.tag);
                                        const disabled = !handDict[deckInd][element.tag];
                                        const value = disabled ? '' : memoTrainingUtils.cardTagToMarkStr(element.tag);

                                        // 手礼に残っているカードだけ選択できるようにしている
                                        return (<Button color="light" value={value} style={ { color, width: '4em', height: '3em', fontFamily: [ 'Courier New', 'monospace', ], }} key={`${cardInd}`} disabled={disabled} onClick={ () => { sagaSelectHand(element); }}/>);
                                    })
                                }
                            </div>
                        );
                    });
                })()
            }
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

MemoTrainingCardsRecall.propTypes = {
    startMemoMiliUnixtime: PropTypes.number.isRequired,
    startRecallMiliUnixtime: PropTypes.number.isRequired,
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

export default MemoTrainingCardsRecall;
