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
const deckSizeOptions = [ ...Array(52).keys(), ].map(ind => [ String(ind + 1), String(ind + 1), ]);
const pairSizeList = [ ...Array(3).keys(), ].map(ind => [ String(ind + 1), String(ind + 1) + '枚', ]);

const MemoTrainingCardsSetting = ({
    deckSize,
    deckNum,
    pairSize,

    setDeckNum,
    setDeckSize,
    setPairSize,

    sagaStartMemorizationPhase,
}) => {
    return (
        <div>
            <Link to={`/${urlRoot}/memoTraining/index.html`}>種目選択に戻る</Link>
            <Br/>
            挑戦する束数: <Select options={deckNumOptions} onChange={(e) => setDeckNum(parseInt(e.target.value))} />
            <Br/>
            1束あたりの枚数: <Select options={deckSizeOptions} defaultValue={'52'} onChange={(e) => setDeckSize(parseInt(e.target.value))}/>
            <Br/>
            同時に表示する枚数: <Select options={pairSizeList} onChange={(e) => setPairSize(parseInt(e.target.value))} />
            <Br/>

            <ModeDecisionButtons deckNum={deckNum} deckSize={deckSize} pairSize={pairSize} sagaStartMemorizationPhase={sagaStartMemorizationPhase}/>
        </div>
    );
};

MemoTrainingCardsSetting.propTypes = {
    deckNum: PropTypes.number,
    deckSize: PropTypes.number,
    pairSize: PropTypes.number,

    setDeckNum: PropTypes.func,
    setDeckSize: PropTypes.func,
    setPairSize: PropTypes.func,

    sagaStartMemorizationPhase: PropTypes.func,
};

export default MemoTrainingCardsSetting;
