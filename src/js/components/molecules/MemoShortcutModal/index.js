import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Txt from '../../atoms/Txt';
import Modal from '../../atoms/Modal';
import ModalBody from '../../atoms/ModalBody';
import ModalFooter from '../../atoms/ModalFooter';
import ModalHeader from '../../atoms/ModalHeader';

const MemoShortcutModal = ({
    isOpenMemoShortcutModal,
    toggleShortcutModal,
}) => {
    return (
        <Modal isOpen={isOpenMemoShortcutModal}>
            <ModalHeader>
                <Txt>操作説明</Txt>
            </ModalHeader>
            <ModalBody>
                <Txt>記憶練習で使えるショートカットです</Txt>
                <ul>
                    <li>← : 1つ前に戻る</li>
                    <li>→ : 1つ先に進む</li>
                    <li>↑ : デッキの先頭に戻る</li>
                    <li>↓ : 次のデッキに進む</li>
                    <li>Enter : 記憶終了</li>
                </ul>
            </ModalBody>
            <ModalFooter>
                <Button value="閉じる" onClick={() => { toggleShortcutModal(false); }}/>
            </ModalFooter>
        </Modal>
    );
};

MemoShortcutModal.propTypes = {
    isOpenMemoShortcutModal: PropTypes.bool.isRequired,
    toggleShortcutModal: PropTypes.func.isRequired,
};

export default MemoShortcutModal;
