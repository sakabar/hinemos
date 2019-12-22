import React from 'react';
import {
    Link,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Select from '../../molecules/Select';
import ModeDecisionButtons from '../../molecules/modeDecisionButtons';
const config = require('../../../config');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

const deckNumOptions = [ ...Array(5).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const pairSizeList = [ ...Array(2).keys(), ].map(ind => [ String(ind + 1), `${ind + 1}単語`, ]);

const MemoTrainingMbldSetting = ({
    deckNum,
    pairSize,

    setDeckNum,
    setPairSize,

    sagaStartMemorizationPhase,
}) => {
    return (
        <div>
            <Link to={`/${urlRoot}/memoTraining/index.html`}>種目選択に戻る</Link>
            <Br/>
            キューブ個数: <Select options={deckNumOptions} onChange={(e) => setDeckNum(parseInt(e.target.value))} />
            <Br/>
            同時に表示する単語数: <Select options={pairSizeList} onChange={(e) => setPairSize(parseInt(e.target.value))} />
            <Br/>

            <ModeDecisionButtons deckNum={deckNum} deckSize={1} pairSize={pairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase} />
        </div>
    );
};

MemoTrainingMbldSetting.propTypes = {
    deckNum: PropTypes.number,
    pairSize: PropTypes.number,

    setDeckNum: PropTypes.func,
    setPairSize: PropTypes.func,

    sagaStartMemorizationPhase: PropTypes.func,
};

export default MemoTrainingMbldSetting;
