import React from 'react';
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

const ScramblePanel = ({
    className,
    moveHistoryStr,
    scrambles,
    mutableScramble,
    inputScramblesStr,
    isOpen,
    toggleModal,
    updateInputScramblesStr,
    addScrambles,
    ...rest,
}) => {
    const scrambleTxt = ( () => {
        if (scrambles.length === 0) {
            return 'スクランブルを追加してください';
        }
        if (mutableScramble === '') {
            return 'スペースをクリックしてスタート！';
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
        <Button color="primary" onClick={toggleModal} value="スクランブル追加"/>
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
