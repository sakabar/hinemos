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
const memoTrainingUtils = require('../../../memoTrainingUtils');
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

// https://qiita.com/kanpou0108/items/b6c7a38a755dd60fd77f
const permutation = (xs, k = xs.length, pres = []) =>
    (k === 0) ? [ pres, ]
        : xs.flatMap((e, i) => [ ...permutation(xs.filter((_, j) => j !== i), k - 1, [ ...pres, e, ]), ]);

const suitPerms = permutation([
    memoTrainingUtils.Suit.club,
    memoTrainingUtils.Suit.diamond,
    memoTrainingUtils.Suit.heart,
    memoTrainingUtils.Suit.spade,
]);

const suitOptions = suitPerms.map((suits, ind) => {
    const val = suits.join(',');

    const disp = String(ind + 1) + '. ' + suits.map(suit => {
        return memoTrainingUtils.suitMarkDict[suit];
    }).join(',');

    return [ val, disp, ];
});

const MemoTrainingCardsSetting = ({
    deckSize,
    deckNum,
    pairSize,
    isLefty,
    handSuits,

    isOpenMemoShortcutModal,

    setDeckNum,
    setDeckSize,
    setPairSize,
    setIsLefty,
    setHandSuits,

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
        スート: <Select options={suitOptions} defaultValue={typeof handSuits === 'undefined' ? 'H,S,D,C' : handSuits } onChange={(e) => setHandSuits(e.target.value)} />
                <Br/>
            方向: <Select options={isLeftyOptions} defaultValue={typeof isLefty === 'undefined' ? 'true' : String(isLefty)} onChange={(e) => setIsLefty(e.target.value === 'true')} />
                <Br/>
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
    handSuits: PropTypes.array,

    isOpenMemoShortcutModal: PropTypes.bool.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setDeckSize: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,
    setIsLefty: PropTypes.func.isRequired,
    setHandSuits: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,

    toggleShortcutModal: PropTypes.func.isRequired,
};

export default MemoTrainingCardsSetting;
