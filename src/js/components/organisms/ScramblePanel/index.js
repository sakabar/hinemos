import React from 'react';
import PropTypes from 'prop-types';
import { ModalWrapper, show } from 'react-redux-bootstrap-modal';
import Button from '../../atoms/Button';
import Txt from '../../atoms/Txt';
import Modal from '../../atoms/Modal';
import ModalBody from '../../atoms/ModalBody';
import ModalFooter from '../../atoms/ModalFooter';
import ModalHeader from '../../atoms/ModalHeader';
import Textarea from '../../atoms/Textarea';

const ScramblePanel = ({
    mutableScramble,
    className,
    inputScramblesStr,
    isOpen,
    toggleModal,
    ...rest,
}) => {
    const scrambleTxt = ( () => {
        if (mutableScramble === '') {
            return 'Click space to start solving!';
        }

        if (!mutableScramble) {
            return 'Scramble: ';
        }

        return `Scramble: ${mutableScramble}`;
    })();

    return (
    <div className={className}>
        <Txt>{scrambleTxt}</Txt>
        <Button color="primary" onClick={toggleModal} value="input"/>
        <Modal isOpen={isOpen}>
            <ModalHeader>
                <Txt>スクランブルを入力してください(複数行可)</Txt>
            </ModalHeader>
            <ModalBody>
                <Textarea/>
            </ModalBody>
            <ModalFooter>
                <Button onClick={toggleModal} value="キャンセル"/>
                <Button color="primary" onClick={toggleModal} value="決定"/>
            </ModalFooter>
        </Modal>
    </div>
    );
}

ScramblePanel.propTypes = {
    scramble: PropTypes.string,
};

export default ScramblePanel;
