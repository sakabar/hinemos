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

const deckNumOptions = [ ...Array(50).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const pairSizeList = [ ...Array(4).keys(), ].map(ind => [ String(ind + 1), `${ind + 1}単語`, ]);

const MemoTrainingMbldSetting = ({
    deckNum,
    pairSize,
    isOpenMemoShortcutModal,

    setDeckNum,
    setPairSize,

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
            キューブ個数: <Select options={deckNumOptions} defaultValue={deckNum || '1'} onChange={(e) => setDeckNum(parseInt(e.target.value))} />
                <Br/>
            同時に表示する単語数: <Select options={pairSizeList} defaultValue={pairSize || '1'} onChange={(e) => setPairSize(parseInt(e.target.value))} />
            </div>

            <div>
                <ModeDecisionButtons deckNum={deckNum} deckSize={1} pairSize={pairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase} />
            </div>
        </div>
    );
};

MemoTrainingMbldSetting.propTypes = {
    deckNum: PropTypes.number,
    pairSize: PropTypes.number,
    isOpenMemoShortcutModal: PropTypes.bool.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,

    toggleShortcutModal: PropTypes.func.isRequired,
};

export default MemoTrainingMbldSetting;
