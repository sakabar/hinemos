import React from 'react';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Txt from '../../atoms/Txt';
import Button from '../../atoms/Button';
import PlayingCard from '../../molecules/PlayingCard';
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

    handDict,
    handSuits, // 手札を並べる順番

    sagaGoToNextPair,
    sagaGoToPrevPair,
    sagaGoToDeckHead,
    sagaGoToNextDeck,

    sagaFinishRecallPhase,

    // sagaToggleTimer,
}) => {
    return (
        <div>
            <Txt>回答フェーズだよ。上のほうに</Txt>
            <Br/>
            {
                (() => {
                    const chunkSize = 12;
                    return _.chunk(_.flattenDeep(decks), chunkSize).map((bulk, bulkInd) => {
                        return (
                            <div key={bulkInd}>
                                {
                                    bulk.map((element, colInd) => {
                                        const val = colInd + 1 + bulkInd * chunkSize;
                                        return (<Button value={`${val}`.padStart(2, '0')} style={ { fontFamily: [ 'Courier New', 'monospace', ], }} key={`${bulkInd}-${colInd}`}/>);
                                    })
                                }
                            </div>
                        );
                    });
                })()
            }
            <Br/>

            <Button value="←←" onClick={(e) => sagaGoToDeckHead()} disabled={deckInd === 0 && pairInd === 0} />
            <Button value="→→" onClick={(e) => sagaGoToNextDeck()} disabled={deckInd === decks.length - 1}/>

            <Br/>
            {
                (() => {
                    return handSuits.map((suit, suitInd) => {
                        const cards = memoTrainingUtils.getSameSuitCards(suit);
                        return (
                                <div key={suitInd}>
                                {
                        cards.map((element, cardInd) => {
                            if (handDict[element.tag]) {
                                // 手札に残っている
                                return (<PlayingCard tag={element.tag} rowInd={suitInd} colInd={cardInd} onClick={() => alert(`${element.tag}`)} key={`${suitInd}-${cardInd}`}/>);
                            } else {
                                return (<PlayingCard tag='gray' rowInd={suitInd} colInd={cardInd} onClick={() => alert(`(${element.tag})`)} key={`${suitInd}-${cardInd}`}/>);
                            }
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

    handDict: PropTypes.object.isRequired,
    handSuits: PropTypes.array.isRequired,

    sagaGoToNextPair: PropTypes.func.isRequired,
    sagaGoToPrevPair: PropTypes.func.isRequired,
    sagaGoToDeckHead: PropTypes.func.isRequired,
    sagaGoToNextDeck: PropTypes.func.isRequired,

    sagaFinishRecallPhase: PropTypes.func.isRequired,
};

export default MemoTrainingCardsRecall;
