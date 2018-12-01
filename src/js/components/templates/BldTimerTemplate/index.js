import React from 'react';
import {
    Link,
} from 'react-router-dom';
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
const config = require('../../../config');
const moment = require('moment');
const path = require('path');

const urlRoot = path.basename(config.urlRoot);

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
        prevScramble,
        nextScramble,
    }
) => (
    <div>
        <Header title="BLD Smart Timer"/>

        <main className="bldTimerTemplateMain" tabIndex="0" onKeyDown={(e) => { if (!isOpen) { keyDown(e); } if (!isOpen && e.keyCode === 32) { e.preventDefault(); }}} onKeyUp={(e) => { if (!isOpen) { keyUp(e); } if (!isOpen && e.keyCode === 32) { e.preventDefault(); }}} >
            <Txt>既知のバグや仕様については<Link to={`/${urlRoot}/faq.html`}>FAQ</Link>をご覧ください。</Txt>
            <Txt>もし必要なら、<Link to={`/${urlRoot}/threeStyle/scrambler.html`}>登録済の3-styleだけが出現するスクランブルを生成する</Link>機能も併わせてご利用ください。</Txt>
            <ButtonToolbar>
                <Button color="primary" tabIndex="-1" onClick={(e) => { requestConnectCube(); e.target.blur(); }} value="GiiKER接続"/>
            </ButtonToolbar>
            <Br/>

            <ScramblePanel className="scramblePanel" moveHistoryStr={moveHistoryStr} scrambles={scrambles} mutableScramble={mutableScramble} markAsSolved={markAsSolved} inputScramblesStr={inputScramblesStr} isOpen={isOpen} toggleModal={toggleModal} updateInputScramblesStr={updateInputScramblesStr} addScrambles={addScrambles} prevScramble={prevScramble} nextScramble={nextScramble}/>
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
