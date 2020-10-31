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
const deckSizeOptions = [ ...Array(52).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const pairSizeList = [ ...Array(4).keys(), ].map(ind => [ String(ind + 1), String(ind + 1) + '枚', ]);
const isLeftyOptions = [
    [ 'true', '→', ],
    [ 'false', '←', ],
];

const MemoTrainingCardsSetting = ({
    deckSize,
    deckNum,
    pairSize,
    isLefty,

    isOpenMemoShortcutModal,

    setDeckNum,
    setDeckSize,
    setPairSize,
    setIsLefty,

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
            1束あたりの枚数: <Select options={deckSizeOptions} defaultValue={deckSize || '52'} onChange={(e) => setDeckSize(parseInt(e.target.value))}/>
                <Br/>
            同時に表示する枚数: <Select options={pairSizeList} defaultValue={pairSize || '1'} onChange={(e) => setPairSize(parseInt(e.target.value))} />
                <Br/>
            方向: <Select options={isLeftyOptions} defaultValue={typeof isLefty === 'undefined' ? 'true' : String(isLefty)} onChange={(e) => setIsLefty(e.target.value === 'true')} />
            </div>

            <div>
                <ModeDecisionButtons deckNum={deckNum} deckSize={deckSize} pairSize={pairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase}/>
            </div>

            <div>
                {
                    (() => {
                        // 設定画面で充分に下スクロールできるように空白を設けた
                        // FIXME レイアウトのためのbrはバッドノウハウ
                        return [ ...Array(20).keys(), ].map(i => {
                            return (<Br key={i} />);
                        });
                    })()
                }
            </div>
        </div>
    );
};

MemoTrainingCardsSetting.propTypes = {
    deckNum: PropTypes.number,
    deckSize: PropTypes.number,
    pairSize: PropTypes.number,
    isLefty: PropTypes.bool,
    isOpenMemoShortcutModal: PropTypes.bool.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setDeckSize: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,
    setIsLefty: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,

    toggleShortcutModal: PropTypes.func.isRequired,
};

export default MemoTrainingCardsSetting;
