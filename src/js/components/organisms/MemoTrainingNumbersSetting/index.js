import React from 'react';
import {
    Link,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Checkbox from '../../atoms/Checkbox';
import Select from '../../molecules/Select';
import ModeDecisionButtons from '../../molecules/ModeDecisionButtons';
import MemoShortcutModal from '../../molecules/MemoShortcutModal';
const config = require('../../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const deckNumOptions = [ ...Array(10).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const deckSizeOptions = [ ...Array(200).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const digitsPerImageOptions = [ ...Array(2).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const pairSizeList = [ ...Array(4).keys(), ].map(ind => [ String(ind + 1), String(ind + 1) + 'イメージ', ]);

const MemoTrainingNumbersSetting = ({
    deckSize,
    deckNum,
    digitsPerImage,
    pairSize,
    isLefty,
    isUniqInDeck,

    isOpenMemoShortcutModal,

    setDeckNum,
    setDeckSize,
    setDigitsPerImage,
    setPairSize,
    setIsLefty,
    setIsUniqInDeck,

    sagaStartMemorizationPhase,

    toggleShortcutModal,
}) => {
    return (
        <div>
            <div>
                <ul>
                    <li><Link to={`/${urlRoot}/memoTraining/index.html`}>種目選択に戻る</Link></li>
                    <li><Link to={`/${urlRoot}/memoTraining/result.html`}>結果確認</Link></li>
                </ul>
            </div>

            <div>
                <MemoShortcutModal isOpenMemoShortcutModal={isOpenMemoShortcutModal} toggleShortcutModal={toggleShortcutModal}/>
                <Button value="操作説明" onClick={ () => { toggleShortcutModal(true); } }/>
            </div>
            <div>
            挑戦する束数: <Select options={deckNumOptions} defaultValue={deckNum || '1' } onChange={(e) => setDeckNum(parseInt(e.target.value))} />
                <Br/>
            1束あたりの桁数: <Select options={deckSizeOptions} defaultValue={deckSize || '80'} onChange={(e) => setDeckSize(parseInt(e.target.value))}/>
                <Br/>
            1イメージの桁数: <Select options={digitsPerImageOptions} defaultValue={digitsPerImage || '2'} onChange={(e) => setDigitsPerImage(parseInt(e.target.value))}/>
                <Br/>
            同時に表示するイメージ数: <Select options={pairSizeList} defaultValue={pairSize || '1'} onChange={(e) => setPairSize(parseInt(e.target.value))} />
                <Br/>
                <Checkbox text="束内で重複して出現させない" checked={isUniqInDeck} onChange={(e) => setIsUniqInDeck(e.target.checked)}/>
            </div>
            <div>
                <ModeDecisionButtons deckNum={deckNum} deckSize={deckSize} pairSize={pairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase}/>
            </div>
        </div>
    );
};

MemoTrainingNumbersSetting.propTypes = {
    deckNum: PropTypes.number,
    deckSize: PropTypes.number,
    digitsPerImage: PropTypes.number,
    pairSize: PropTypes.number,
    isLefty: PropTypes.bool,
    isUniqInDeck: PropTypes.bool,
    isOpenMemoShortcutModal: PropTypes.bool.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setDeckSize: PropTypes.func.isRequired,
    setDigitsPerImage: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,
    setIsLefty: PropTypes.func.isRequired,
    setIsUniqInDeck: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,

    toggleShortcutModal: PropTypes.func.isRequired,
};

export default MemoTrainingNumbersSetting;
