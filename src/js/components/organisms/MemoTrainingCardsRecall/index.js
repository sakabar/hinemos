import React from 'react';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Txt from '../../atoms/Txt';
import Button from '../../atoms/Button';
// import PlayingCard from '../../molecules/PlayingCard';
const memoTrainingUtils = require('../../../memoTrainingUtils');
const _ = require('lodash');

const MemoTrainingCardsRecall = ({
    // startMemoMiliUnixtime,
    // startRecallMiliUnixtime,
    // timerMiliUnixtime,
    // timeVisible,

    decks,
    deckInd,
    pairInd,
    posInd,

    solution,

    handDict,
    handSuits, // 手札を並べる順番

    sagaFinishRecallPhase,

    // sagaToggleTimer,
    selectHole,
    goToPrevDeckRecall,
    goToNextDeckRecall,
    selectHand,
}) => {
    return (
        <div>
            <Txt>回答フェーズだよ。上のほうに</Txt>
            {/* <Txt>{deckInd + 1}束目の{pairInd}-{posInd}</Txt> */}
            <Txt>{deckInd + 1}束目</Txt>
            <Br/>
            {
                (() => {
                    const components = decks[deckInd].map((pair, holePairInd) => {
                        return pair.map((elem, holePosInd) => {
                            const val = (() => {
                                if (solution[deckInd] && solution[deckInd][holePairInd] && solution[deckInd][holePairInd][holePosInd]) {
                                    const tag = solution[deckInd][holePairInd][holePosInd].tag;
                                    return memoTrainingUtils.cardTagToMarkStr(tag);
                                }

                                return '[]';
                            })();

                            return (<Button value={val} style={ { width: '3em', fontFamily: [ 'Courier New', 'monospace', ], }} key={`${deckInd}-${holePairInd}-${holePosInd}`} onClick={ () => { selectHole(deckInd, holePairInd, holePosInd); }}/>);
                        });
                    });

                    const chunkSize = 12;
                    return _.chunk(_.flattenDeep(components), chunkSize).map((bulk, bulkInd) => {
                        return (
                            <div key={bulkInd}>
                                {bulk}
                            </div>
                        );
                    });
                })()
            }
            <Br/>

            <Button value="←←" onClick={(e) => goToPrevDeckRecall()} disabled={deckInd === 0} />
            <Button value="→→" onClick={(e) => goToNextDeckRecall()} disabled={deckInd === decks.length - 1}/>

            <Br/>
            {
                (() => {
                    return handSuits.map((suit, suitInd) => {
                        const cards = memoTrainingUtils.getSameSuitCards(suit);
                        return (
                            <div key={suitInd}>
                                {
                                    cards.map((element, cardInd) => {
                                        // 手礼に残っているカードだけ選択できるようにしている
                                        return (<Button value={memoTrainingUtils.cardTagToMarkStr(element.tag)} style={ { fontFamily: [ 'Courier New', 'monospace', ], }} key={`${cardInd}`} disabled={!handDict[deckInd][element.tag]} onClick={ () => { selectHand(element); }}/>);
                                    })
                                }
                            </div>
                        );
                    });
                })()
            }

        </div>
    );
};

MemoTrainingCardsRecall.propTypes = {
    decks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
    deckInd: PropTypes.number.isRequired,
    pairInd: PropTypes.number.isRequired,
    posInd: PropTypes.number.isRequired,

    handDict: PropTypes.object.isRequired,
    handSuits: PropTypes.array.isRequired,

    solution: PropTypes.array.isRequired,

    sagaFinishRecallPhase: PropTypes.func.isRequired,

    selectHole: PropTypes.func.isRequired,
    goToPrevDeckRecall: PropTypes.func.isRequired,
    goToNextDeckRecall: PropTypes.func.isRequired,
    selectHand: PropTypes.func.isRequired,
};

export default MemoTrainingCardsRecall;
