import React from 'react';
import {
    Link,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import DateTimePicker from 'react-datetime-picker';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Select from '../../molecules/Select';
import ModeDecisionButtons from '../../molecules/ModeDecisionButtons';
import MemoShortcutModal from '../../molecules/MemoShortcutModal';
const config = require('../../../config');
const moment = require('moment');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const deckNumOptions = [ ...Array(50).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const pairSizeList = [ ...Array(4).keys(), ].map(ind => [ String(ind + 1), `${ind + 1}単語`, ]);

const poorDeckNumOptions = [ ...Array(16).keys(), ].map(ind => [ String(ind), String(ind), ]);
const poorKeyOptions = [
    [ 'memorization', '記憶が遅い', ],
    [ 'transformation', '変換が遅い', ],
    [ 'acc', '正解率が低い', ],
    // FIXME 未実装
    // [ 'rare', '出現していない', ],
];

const MemoTrainingMbldSetting = ({
    deckNum,
    pairSize,
    isOpenMemoShortcutModal,

    poorDeckNum,
    poorKey,
    startDate,
    endDate,

    setDeckNum,
    setPairSize,

    sagaStartMemorizationPhase,

    toggleShortcutModal,

    setPoorDeckNum,
    setPoorKey,
    setStartDate,
    setEndDate,
}) => {
    return (
        <div>
            <div>
                <ul>
                    <li><Link to={`/${urlRoot}/memoTraining/index.html`}>種目選択に戻る</Link></li>
                    <li><Link to={{
                        pathname: `/${urlRoot}/memoTraining/result.html`,
                        search: '?event=mbld',
                    } }>結果確認</Link></li>
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
                <Select options={poorKeyOptions} defaultValue={poorKey || 'memorization' } onChange={(e) => setPoorKey(e.target.value)} />
                <Select options={poorDeckNumOptions} defaultValue={poorDeckNum || '0' } onChange={(e) => setPoorDeckNum(parseInt(e.target.value))} />
           単語ずつに絞って練習する
                <Br/>
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

    poorDeckNum: PropTypes.number.isRequired,
    poorKey: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,

    setDeckNum: PropTypes.func.isRequired,
    setPairSize: PropTypes.func.isRequired,

    sagaStartMemorizationPhase: PropTypes.func.isRequired,

    toggleShortcutModal: PropTypes.func.isRequired,

    setPoorDeckNum: PropTypes.func.isRequired,
    setPoorKey: PropTypes.func.isRequired,
    setStartDate: PropTypes.func.isRequired,
    setEndDate: PropTypes.func.isRequired,
};

export default MemoTrainingMbldSetting;
