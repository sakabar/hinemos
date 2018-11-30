import React from 'react';
import PropTypes from 'prop-types';
import {
    ButtonToolbar,
} from 'reactstrap';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Img from '../../atoms/Img';
import Textarea from '../../atoms/Textarea';
import Textbox from '../../atoms/Textbox';
import Txt from '../../atoms/Txt';
import TimerCount from '../../molecules/TimerCount';
import Header from '../../organisms/Header';
import ScramblePanel from '../../organisms/ScramblePanel';
import SectionResultPanelsContainer from '../../organisms/SectionResultPanelsContainer';
const moment = require('moment');

// <Img src={
//     (() => {
//         const alg = moveHistoryStr.split('\n').map(line => line.split(' ')[0]).filter(s => s !== '' && s !== '@').join('');
//         return `https://cube.crider.co.uk/visualcube.php?fmt=svg&size=100&pzl=3&alg=y2z2${alg}`;
//     })()}
// />
// <Br />


const BldTimerTemplate = (
    {
        moveHistoryStr,
        scrambles,
        scramblesIndex,
        compared,
        mutableScramble,
        sectionResults,
        timerCount,
        timerState,
        lastModified,
        solveStartMiliUnixtime,
        memorizeDoneMiliUnixtime,
        solveDoneMiliUnixtime,

        markAsSolved,
        updateMoveHistory,
        // moveCube,
        requestConnectCube,
        analyzeMoveHistory,
        keyDown,
        keyUp,
    }
) => (
    <div>
        <Header title="BLD Timer"/>

        <main className="bldTimerTemplateMain" tabIndex="0" onKeyDown={(e) => { keyDown(e); e.preventDefault(); }} onKeyUp={(e) => { keyUp(e); e.preventDefault(); }} >

            <ScramblePanel className="scramblePanel" mutableScramble={mutableScramble}/>

            <ButtonToolbar>
                <Button color="primary" tabIndex="-1" onClick={(e) => { requestConnectCube(); e.target.blur(); }} value="接続"/>
                <Button color="primary" tabIndex="-1" onClick={(e) => { markAsSolved(parseInt(moment().format('x'))); e.target.blur(); }} value="Mark as solved"/>
            </ButtonToolbar>
            <Br />

            <TimerCount timerCount={timerCount} timerState={timerState} solveStartMiliUnixtime={solveStartMiliUnixtime} memorizeDoneMiliUnixtime={memorizeDoneMiliUnixtime} solveDoneMiliUnixtime={solveDoneMiliUnixtime} />
            <Br />

            <Textarea
                tabIndex="-1"
                style={{ display: 'none', }}
                onChange={ (e) => {
                    updateMoveHistory({
                        value: e.target.value,
                        miliUnixtime: parseInt(moment().format('x')),
                    })}}
                className="moveSeqTextbox"
                value={moveHistoryStr}
            />
            <Br />
            <Button color="primary" tabIndex="-1" onClick={(e) => { analyzeMoveHistory(); e.target.blur(); }} value="解析" />
            <Br />

            <SectionResultPanelsContainer sectionResults={sectionResults} solveStartMiliUnixtime={solveStartMiliUnixtime} memorizeDoneMiliUnixtime={memorizeDoneMiliUnixtime} solveDoneMiliUnixtime={solveDoneMiliUnixtime} />
        </main>
    </div>
);

export default BldTimerTemplate;
