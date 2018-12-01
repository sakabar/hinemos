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
const moment = require('moment');

const ScramblePanel = ({
    className,
    moveHistoryStr,
    scrambles,
    mutableScramble,
    markAsSolved,
    inputScramblesStr,
    isOpen,
    toggleModal,
    updateInputScramblesStr,
    addScrambles,
    prevScramble,
    nextScramble,
    ...rest,
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
                return `https://cube.crider.co.uk/visualcube.php?fmt=svg&size=100&pzl=3&alg=y2z2${alg}`;
            })()}
        />
        <Br />
        <Txt>{scrambleTxt}</Txt>
        <ButtonToolbar>
            <Button color="primary" onClick={toggleModal} value="スクランブル追加"/>
            <Button onClick={prevScramble} value="prev"/>
            <Button onClick={nextScramble} value="next"/>
        </ButtonToolbar>
        <ButtonToolbar>
            <Button color="primary" tabIndex="-1" onClick={(e) => { markAsSolved(parseInt(moment().format('x'))); e.target.blur(); }} value="Mark as solved"/>
        </ButtonToolbar>

        <Modal isOpen={isOpen}>
            <ModalHeader>
                <Txt>スクランブルを入力してください(複数行可)</Txt>
            </ModalHeader>
            <ModalBody>
            <Textarea
                value={inputScramblesStr}
                onChange={ (e) => {
                    updateInputScramblesStr(e.target.value);
                }}/>
            </ModalBody>
            <ModalFooter>
                <Button onClick={ () => { toggleModal(); }} value="キャンセル"/>
                <Button color="primary" onClick={() => { addScrambles(); toggleModal(); }} value="決定"/>
            </ModalFooter>
        </Modal>
    </div>
    );
}

ScramblePanel.propTypes = {
    scramble: PropTypes.string,
};

export default ScramblePanel;
