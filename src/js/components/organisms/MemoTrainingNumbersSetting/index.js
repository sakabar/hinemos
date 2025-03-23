import
React,
{ useEffect, } from 'react';
import {
    Link,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import DateTimePicker from 'react-datetime-picker';
import Cookies from 'js-cookie';
import {
    escape as _escape,
} from 'lodash-es';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Checkbox from '../../atoms/Checkbox';
import Select from '../../molecules/Select';
import ModeDecisionButtons from '../../molecules/ModeDecisionButtons';
import MemoShortcutModal from '../../molecules/MemoShortcutModal';
import Textbox from '../../atoms/Textbox';
const config = require('../../../config');
const memoTrainingUtils = require('../../../memoTrainingUtils');

const moment = require('moment');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const deckNumOptions = [ ...Array(10).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const deckSizeOptions = [ ...Array(200).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const digitsPerImageOptions = [ ...Array(2).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const pairSizeList = [ ...Array(4).keys(), ].map(ind => [ String(ind + 1), String(ind + 1) + 'イメージ', ]);

const poorDeckNumOptions = [ ...Array(40+1).keys(), ].map(ind => [ String(ind), String(ind), ]);
const poorKeyOptions = [
    [ 'memorization', '記憶が遅い', ],
    [ 'transformation', '変換が遅い', ],
    [ 'acc', '正解率が低い', ],
    [ 'maxLosingMemorySec', '忘れやすい', ],
    [ 'rare', '出現していない', ],
];

const MemoTrainingNumbersSetting = ({
    deckSize,
    deckNum,
    digitsPerImage,
    pairSize,
    numbersDelimiter,

    isLefty,
    isUniqInDeck,

    isOpenMemoShortcutModal,

    poorDeckNum,
    poorKey,
    startDate,
    endDate,

    setDeckNum,
    setDeckSize,
    setDigitsPerImage,
    setPairSize,

    setIsLefty,
    setIsUniqInDeck,

    sagaStartMemorizationPhase,

    toggleShortcutModal,

    setPoorDeckNum,
    setPoorKey,
    setStartDate,
    setEndDate,

    inputNumbersDelimiter,
}) => {
    useEffect(() => {
        // pairSize
        const localPairSize = parseInt(Cookies.get(memoTrainingUtils.cookieKey.state.pairSize['numbers']));
        if (1 <= localPairSize && localPairSize <= 4) {
            setPairSize(localPairSize);
        }

        // digitsPerImage
        const localDigitsPerImage = parseInt(Cookies.get(memoTrainingUtils.cookieKey.state.digitsPerImage['numbers']));
        if (1 <= localDigitsPerImage && localDigitsPerImage <= 2) {
            setDigitsPerImage(localDigitsPerImage);
        }

        // numbersDelimiter
        const localNumbersDelimiter = typeof Cookies.get(memoTrainingUtils.cookieKey.state.numbersDelimiter) === 'undefined' ? '' : _escape(Cookies.get(memoTrainingUtils.cookieKey.state.numbersDelimiter));
        if (localNumbersDelimiter) {
            inputNumbersDelimiter(localNumbersDelimiter);
        }
    }, []);

    return (
        <div>
            <div>
                <ul>
                    <li><Link to={`/${urlRoot}/memoTraining/index.html`}>種目選択に戻る</Link></li>
                    <li><Link to={{
                        pathname: `/${urlRoot}/memoTraining/result.html`,
                        search: '?event=numbers&mode=memorization',
                    } }>記憶練習の結果</Link></li>
                    <li><Link to={{
                        pathname: `/${urlRoot}/memoTraining/result.html`,
                        search: '?event=numbers&mode=transformation',
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
            1束あたりの桁数: <Select options={deckSizeOptions} defaultValue={deckSize || '80'} onChange={(e) => setDeckSize(parseInt(e.target.value))}/>
                <Br/>
            1イメージの桁数: <Select value={typeof digitsPerImage !== 'undefined' ? String(digitsPerImage) : '2'} options={digitsPerImageOptions} onChange={(e) => setDigitsPerImage(parseInt(e.target.value))}/>
                <Br/>
            同時に表示するイメージ数: <Select value={String(pairSize)} options={pairSizeList} onChange={(e) => setPairSize(parseInt(e.target.value))} />
                <Br/>
            区切り文字: <Textbox value={numbersDelimiter} onChange={(e) => { inputNumbersDelimiter(e.target.value); }} style={{ width: '3em', }}/>{numbersDelimiter === '' ? '(無し)' : numbersDelimiter.replace(/\s/g, '[SPACE]')}
                <Br/>
                <Checkbox text="束内で重複して出現させない" checked={isUniqInDeck} onChange={(e) => setIsUniqInDeck(e.target.checked)}/><Br/>

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
     イメージずつに絞って練習する
                <Br/>
            </div>
            <div>
                <ModeDecisionButtons deckNum={deckNum} deckSize={deckSize} pairSize={pairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase}/>
            </div>
        </div>
    );
};

MemoTrainingNumbersSetting.propTypes = {
    deckNum: PropTypes.number.isRequired,
    deckSize: PropTypes.number,
    digitsPerImage: PropTypes.number,
    pairSize: PropTypes.number.isRequired,
    numbersDelimiter: PropTypes.string.isRequired,

    isLefty: PropTypes.bool,
    isUniqInDeck: PropTypes.bool.isRequired,
    isOpenMemoShortcutModal: PropTypes.bool.isRequired,

    poorDeckNum: PropTypes.number.isRequired,
    poorKey: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setDeckSize: PropTypes.func.isRequired,
    setDigitsPerImage: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,
    setIsLefty: PropTypes.func.isRequired,
    setIsUniqInDeck: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,

    toggleShortcutModal: PropTypes.func.isRequired,

    setPoorDeckNum: PropTypes.func.isRequired,
    setPoorKey: PropTypes.func.isRequired,
    setStartDate: PropTypes.func.isRequired,
    setEndDate: PropTypes.func.isRequired,

    inputNumbersDelimiter: PropTypes.func.isRequired,
};

export default MemoTrainingNumbersSetting;
