import React from 'react';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Textarea from '../../atoms/Textarea';
import Textbox from '../../atoms/Textbox';
import SectionResultPanels from '../../organisms/SectionResultPanels';
import Header from '../../organisms/Header';

const BldTimerTemplate = (
    {
        moveHistoryStr,
        sectionResults,
        timerCount,
        timerState,

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

        <main tabIndex="0" onKeyDown={(e) => keyDown(e)} onKeyUp={(e) => keyUp(e)} >

            <Button onClick={() => requestConnectCube()} value="接続"/>
            <Button onClick={() => markAsSolved()} value="Mark as solved"/>
            <Br />

            <Textarea readOnly={true}value={JSON.stringify({
                timerCount,
                timerState,
            })} />
            <Br />

            <Textarea
                onChange={ (e) => { updateMoveHistory(e.target.value) }}
                className="moveSeqTextbox"
                value={moveHistoryStr}
            />
            <Br />
            <Button onClick={() => analyzeMoveHistory()} value="解析" />

            <SectionResultPanels sectionResults={sectionResults} />
        </main>
    </div>
);

export default BldTimerTemplate;
