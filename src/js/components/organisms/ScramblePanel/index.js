import React from 'react';
import {
    ButtonToolbar,
} from 'reactstrap';
import PropTypes from 'prop-types';
import Br from '../../atoms/Br';
import Button from '../../atoms/Button';
import Img from '../../atoms/Img';
import Txt from '../../atoms/Txt';
import Modal from '../../atoms/Modal';
import ModalBody from '../../atoms/ModalBody';
import ModalFooter from '../../atoms/ModalFooter';
import ModalHeader from '../../atoms/ModalHeader';
import Textarea from '../../atoms/Textarea';
import Textbox from '../../atoms/Textbox';
const moment = require('moment');

const ScramblePanel = ({
    className,
    moveHistoryStr,
    firstRotationStr,
    scrambles,
    mutableScramble,
    markAsSolved,
    inputScramblesStr,
    isOpenScrambleModal,
    isOpenFirstRotationModal,
    toggleScrambleModal,
    toggleFirstRotationModal,
    updateInputScramblesStr,
    addScrambles,
    prevScramble,
    nextScramble,
    updateFirstRotationStr,
    ...rest
}) => {
    const scrambleTxt = ( () => {
        if (scrambles.length === 0) {
            return 'スクランブルを追加してください';
        }
        if (mutableScramble === '') {
            return 'スペースを長押ししてスタート！';
        }

        if (!mutableScramble) {
            return 'Scramble: ';
        }

        return `Scramble: ${mutableScramble}`;
    })();

    return (
    <div className={className}>
        <Img src={
            (() => {
                const alg = moveHistoryStr.split('\n').map(line => line.split(' ')[0]).filter(s => s !== '' && s !== '@').join('');
                return `http://cube.crider.co.uk/visualcube.php?fmt=svg&size=100&pzl=3&alg=y2z2${alg}`;
            })()}
        />
        <Br />
        <Txt>{scrambleTxt}</Txt>
        <ButtonToolbar>
            <Button color="primary" onClick={toggleScrambleModal} value="add scramble[s]"/>
            <Button onClick={prevScramble} value="prev"/>
            <Button onClick={nextScramble} value="next"/>
        </ButtonToolbar>
        <ButtonToolbar>
            <Button color="primary" tabIndex="-1" onClick={(e) => { markAsSolved(parseInt(moment().format('x'))); e.target.blur(); }} value="mark as solved"/>
            <Button color="primary" onClick={toggleFirstRotationModal} value="持ち替え登録"/>
        </ButtonToolbar>

        <Modal isOpen={isOpenScrambleModal}>
            <ModalHeader>
                <Txt>スクランブルを入力してください(複数行可)</Txt>
            </ModalHeader>
            <ModalBody>
            <Textarea
                style={{ width: '100%', }}
                value={inputScramblesStr}
                onChange={ (e) => {
                    updateInputScramblesStr(e.target.value);
                }}/>
            </ModalBody>
            <ModalFooter>
                <Button onClick={ () => { toggleScrambleModal(); }} value="キャンセル"/>
                <Button color="primary" onClick={() => { addScrambles(); toggleScrambleModal(); }} value="決定"/>
            </ModalFooter>
        </Modal>

        <Modal isOpen={isOpenFirstRotationModal}>
            <ModalHeader>
                <Txt>スクランブル後に持ち替える場合は登録してください (自動保存)</Txt>
            </ModalHeader>
            <ModalBody>
            <Textbox
                style={{ width: '100%', }}
                value={firstRotationStr}
                onChange={ (e) => {
                    updateFirstRotationStr(e.target.value);
                }}/>
            </ModalBody>
            <ModalFooter>
                <Button onClick={ () => { toggleFirstRotationModal(); }} value="閉じる"/>
            </ModalFooter>
        </Modal>
    </div>
    );
}

ScramblePanel.propTypes = {
    scramble: PropTypes.string,
};

export default ScramblePanel;
