import React from 'react';
import PropTypes from 'prop-types';
import {
    ButtonToolbar,
} from 'reactstrap';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Textarea from '../../atoms/Textarea';
import Textbox from '../../atoms/Textbox';
import Txt from '../../atoms/Txt';
import TimerCount from '../../molecules/TimerCount';
import Header from '../../organisms/Header';
import ScramblePanel from '../../organisms/ScramblePanel';
import SectionResultPanelsContainer from '../../organisms/SectionResultPanelsContainer';
const moment = require('moment');

const BldTimerTemplate = (
    {
        moveHistoryStr,
        scrambles,
        scramblesIndex,
        compared,
        mutableScramble,
        inputScramblesStr,
        isOpen,
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
        toggleModal,
        updateInputScramblesStr,
        addScrambles,
    }
) => (
    <div>
        <Header title="BLD Smart Timer"/>

        <main className="bldTimerTemplateMain" tabIndex="0" onKeyDown={(e) => { if (!isOpen) { keyDown(e); } if (!isOpen && e.keyCode === 32) { e.preventDefault(); }}} onKeyUp={(e) => { if (!isOpen) { keyUp(e); } if (!isOpen && e.keyCode === 32) { e.preventDefault(); }}} >

            <ScramblePanel className="scramblePanel" moveHistoryStr={moveHistoryStr} scrambles={scrambles} mutableScramble={mutableScramble} inputScramblesStr={inputScramblesStr} isOpen={isOpen} toggleModal={toggleModal} updateInputScramblesStr={updateInputScramblesStr} addScrambles={addScrambles}/>

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
            {/*
            <Button color="primary" tabIndex="-1" onClick={(e) => { analyzeMoveHistory(); e.target.blur(); }} value="解析" />
            <Br />
            */}

            <SectionResultPanelsContainer sectionResults={sectionResults} solveStartMiliUnixtime={solveStartMiliUnixtime} memorizeDoneMiliUnixtime={memorizeDoneMiliUnixtime} solveDoneMiliUnixtime={solveDoneMiliUnixtime} />
        </main>
    </div>
);

export default BldTimerTemplate;
