import
React,
{ useEffect, } from 'react';
import {
    Link,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import DateTimePicker from 'react-datetime-picker';
import Cookies from 'js-cookie';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Select from '../../molecules/Select';
import ModeDecisionButtons from '../../molecules/ModeDecisionButtons';
import MemoShortcutModal from '../../molecules/MemoShortcutModal';
const memoTrainingUtils = require('../../../memoTrainingUtils');
const config = require('../../../config');
const moment = require('moment');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const deckNumOptions = [ ...Array(10).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const deckSizeOptions = [ ...Array(52).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const pairSizeList = [ ...Array(4).keys(), ].map(ind => [ String(ind + 1), String(ind + 1) + '枚', ]);
const isLeftyOptions = [
    [ 'true', '→', ],
    [ 'false', '←', ],
];
const poorDeckNumOptions = [ ...Array(26+1).keys(), ].map(ind => [ String(ind), String(ind), ]);
const poorKeyOptions = [
    [ 'memorization', '記憶が遅い', ],
    [ 'transformation', '変換が遅い', ],
    [ 'acc', '正解率が低い', ],
    [ 'maxLosingMemorySec', '忘れやすい', ],
    [ 'rare', '出現していない', ],
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

    poorDeckNum,
    poorKey,
    startDate,
    endDate,

    setDeckNum,
    setDeckSize,
    setPairSize,

    setIsLefty,
    setHandSuits,

    sagaStartMemorizationPhase,

    toggleShortcutModal,

    setPoorDeckNum,
    setPoorKey,
    setStartDate,
    setEndDate,
}) => {
    useEffect(() => {
        // pairSize
        const localPairSize = parseInt(Cookies.get(memoTrainingUtils.cookieKey.state.pairSize['cards']));
        if (1 <= localPairSize && localPairSize <= 4) {
            setPairSize(localPairSize);
        }

        // isLefty
        const localIsLefty = (typeof Cookies.get(memoTrainingUtils.cookieKey.state.isLefty) === 'undefined') ? true : (Cookies.get(memoTrainingUtils.cookieKey.state.isLefty) === 'true');
        setIsLefty(localIsLefty);

        // handSuits
        const tmpHandSuits = Cookies.get(memoTrainingUtils.cookieKey.state.handSuits);
        const localHandSuits = typeof tmpHandSuits === 'undefined' ? [] : JSON.parse(tmpHandSuits);
        if (Array.isArray(localHandSuits) && localHandSuits.length === 4 && Object.values(memoTrainingUtils.Suit).every(suit => localHandSuits.includes(suit))) {
            setHandSuits(localHandSuits.join(','));
        }
    }, []);

    return (
        <div>
            <div>
                <ul>
                    <li><Link to={`/${urlRoot}/memoTraining/index.html`}>種目選択に戻る</Link></li>
                    <li><Link to={{
                        pathname: `/${urlRoot}/memoTraining/result.html`,
                        search: '?event=cards&mode=memorization',
                    } }>記憶練習の結果</Link></li>
                    <li><Link to={{
                        pathname: `/${urlRoot}/memoTraining/result.html`,
                        search: '?event=cards&mode=transformation',
                    } }>変換練習の結果</Link></li>
                </ul>
            </div>

            <div>
                <MemoShortcutModal isOpenMemoShortcutModal={isOpenMemoShortcutModal} toggleShortcutModal={toggleShortcutModal}/>
                <Button value="操作説明" onClick={ () => { toggleShortcutModal(true); } }/>
            </div>

            <div>
            挑戦する束数: <Select value={String(deckNum)} options={deckNumOptions} onChange={(e) => setDeckNum(parseInt(e.target.value))} />
                <Br/>
            1束あたりの枚数: <Select options={deckSizeOptions} defaultValue={deckSize || '52'} onChange={(e) => setDeckSize(parseInt(e.target.value))}/>
                <Br/>
            同時に表示する枚数: <Select value={String(pairSize)} options={pairSizeList} onChange={(e) => setPairSize(parseInt(e.target.value))} />
                <Br/>
            回答用カードの順番: <Select value={handSuits.join(',')} options={suitOptions} onChange={(e) => setHandSuits(e.target.value)} />
                <Br/>
            方向: <Select value={String(isLefty)} options={isLeftyOptions} onChange={(e) => setIsLefty(e.target.value === 'true')} />
                <Br/>

                <DateTimePicker
                    format={'yyyy/MM/dd'}
                    returnValue={'start'}
                    disableClock={true}
                    value={new Date(startDate)}
                    onChange={ (value) => {
                        setStartDate(value ? moment(value).format('YYYY/MM/DD') : null);
                    }}
                />
から
                <DateTimePicker
                    format={'yyyy/MM/dd'}
                    returnValue={'end'}
                    disableClock={true}
                    value={new Date(endDate)}
                    onChange={ (value) => {
                        setEndDate(value ? moment(value).format('YYYY/MM/DD') : null);
                    }}
                />
            までの
                <Select value={poorKey} options={poorKeyOptions} onChange={(e) => setPoorKey(e.target.value)} />
                <Select value={String(poorDeckNum)} options={poorDeckNumOptions} onChange={(e) => setPoorDeckNum(parseInt(e.target.value))} />
        枚ずつに絞って練習する
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
    deckNum: PropTypes.number.isRequired,
    deckSize: PropTypes.number,
    pairSize: PropTypes.number.isRequired,

    isLefty: PropTypes.bool.isRequired,
    handSuits: PropTypes.array,

    isOpenMemoShortcutModal: PropTypes.bool.isRequired,

    poorDeckNum: PropTypes.number.isRequired,
    poorKey: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setDeckSize: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,
    setIsLefty: PropTypes.func.isRequired,
    setHandSuits: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,

    toggleShortcutModal: PropTypes.func.isRequired,

    setPoorDeckNum: PropTypes.func.isRequired,
    setPoorKey: PropTypes.func.isRequired,
    setStartDate: PropTypes.func.isRequired,
    setEndDate: PropTypes.func.isRequired,
};

export default MemoTrainingCardsSetting;
