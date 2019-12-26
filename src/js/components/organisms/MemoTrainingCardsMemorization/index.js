import React from 'react';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Txt from '../../atoms/Txt';
import Button from '../../atoms/Button';
import PlayingCard from '../../molecules/PlayingCard';
import MemoTimer from '../../molecules/MemoTimer';

const MemoTrainingCardsMemorization = ({
    startMemoMiliUnixtime,
    startRecallMiliUnixtime,
    timerMiliUnixtime,
    timeVisible,

    decks,
    deckInd,
    pairInd,

    sagaFinishMemorizationPhase,
    sagaGoToNextPair,
    sagaGoToPrevPair,
    sagaGoToDeckHead,
    sagaGoToNextDeck,

    sagaToggleTimer,
}) => {
    return (
        <div>
            <Txt style={{ fontSize: '30px', }}>{`${deckInd + 1}-${pairInd + 1}`}</Txt>
            <Br/>

            {
                decks[deckInd][pairInd].map((element, i) => (<PlayingCard tag={element.tag} colInd={i} key={i}/>))
            }

            <div>
                <Button value="←←" onClick={(e) => sagaGoToDeckHead()} disabled={deckInd === 0 && pairInd === 0} />
                <Button value="←" onClick={(e) => sagaGoToPrevPair()} disabled={deckInd === 0 && pairInd === 0}/>
                <Button value="→" onClick={(e) => sagaGoToNextPair()} disabled={deckInd === decks.length - 1 && pairInd === decks[deckInd].length - 1}/>
                <Button value="→→" onClick={(e) => sagaGoToNextDeck()} disabled={deckInd === decks.length - 1}/>
                <MemoTimer timeVisible={timeVisible} timerMiliUnixtime={timerMiliUnixtime} sagaToggleTimer={sagaToggleTimer}/>
                <Br/>
                <Button value="記憶終了" onClick={(e) => sagaFinishMemorizationPhase()}/>
                <p>※<a href="https://www.ac-illust.com/">イラストAC</a>にてダウンロードした<a href="https://www.ac-illust.com/main/profile.php?id=OLC8qIlx&amp;area=1">johan</a>さんのイラストを利用規約に則って利用しています。</p>
                <p>画像を利用したい場合はhinemosからダウンロードするのではなく、イラストACにてダウンロードしてください。</p>
            </div>
        </div>
    );
};

MemoTrainingCardsMemorization.propTypes = {
    startMemoMiliUnixtime: PropTypes.number.isRequired,
    startRecallMiliUnixtime: PropTypes.number.isRequired,
    timerMiliUnixtime: PropTypes.number.isRequired,
    timeVisible: PropTypes.bool.isRequired,

    decks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)).isRequired,
    deckInd: PropTypes.number.isRequired,
    pairInd: PropTypes.number.isRequired,

    sagaFinishMemorizationPhase: PropTypes.func.isRequired,
    sagaGoToNextPair: PropTypes.func.isRequired,
    sagaGoToPrevPair: PropTypes.func.isRequired,
    sagaGoToDeckHead: PropTypes.func.isRequired,
    sagaGoToNextDeck: PropTypes.func.isRequired,

    sagaToggleTimer: PropTypes.func.isRequired,
};

export default MemoTrainingCardsMemorization;
