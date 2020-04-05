import React from 'react';
import {
    Link,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Select from '../../molecules/Select';
import ModeDecisionButtons from '../../molecules/ModeDecisionButtons';
import MemoShortcutModal from '../../molecules/MemoShortcutModal';
const config = require('../../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const deckNumOptions = [ ...Array(10).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const deckSizeOptions = [ ...Array(80).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const digitsPerImageOptions = [ [ '2', '2', ], ];
const pairSizeList = [ ...Array(4).keys(), ].map(ind => [ String(ind + 1), String(ind + 1) + 'イメージ', ]);

const MemoTrainingNumbersSetting = ({
    deckSize,
    deckNum,
    digitsPerImage,
    pairSize,
    isLefty,

    isOpenMemoShortcutModal,

    setDeckNum,
    setDeckSize,
    setDigitsPerImage,
    setPairSize,
    setIsLefty,

    sagaStartMemorizationPhase,

    toggleShortcutModal,
}) => {
    return (
        <div>
            <Link to={`/${urlRoot}/memoTraining/index.html`}>種目選択に戻る</Link>
            <Br/>
            <MemoShortcutModal isOpenMemoShortcutModal={isOpenMemoShortcutModal} toggleShortcutModal={toggleShortcutModal}/>
            <Button value="操作説明" onClick={ () => { toggleShortcutModal(true); } }/>
            <Br/>
            挑戦する束数: <Select options={deckNumOptions} defaultValue={deckNum || '1' } onChange={(e) => setDeckNum(parseInt(e.target.value))} />
            <Br/>
            1束あたりの桁数: <Select options={deckSizeOptions} defaultValue={deckSize || '80'} onChange={(e) => setDeckSize(parseInt(e.target.value))}/>
            <Br/>
            1イメージの桁数: <Select options={digitsPerImageOptions} defaultValue={digitsPerImage || '2'} onChange={(e) => setDigitsPerImage(parseInt(e.target.value))}/>
            <Br/>
            同時に表示するイメージ数: <Select options={pairSizeList} defaultValue={pairSize || '1'} onChange={(e) => setPairSize(parseInt(e.target.value))} />
            <Br/>

            <ModeDecisionButtons deckNum={deckNum} deckSize={deckSize} pairSize={pairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase}/>
        </div>
    );
};

MemoTrainingNumbersSetting.propTypes = {
    deckNum: PropTypes.number,
    deckSize: PropTypes.number,
    digitsPerImage: PropTypes.number,
    pairSize: PropTypes.number,
    isLefty: PropTypes.bool,
    isOpenMemoShortcutModal: PropTypes.bool.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setDeckSize: PropTypes.func.isRequired,
    setDigitsPerImage: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,
    setIsLefty: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,

    toggleShortcutModal: PropTypes.func.isRequired,
};

export default MemoTrainingNumbersSetting;
