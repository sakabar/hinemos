import React from 'react';
import PropTypes from 'prop-types';
import Heading2 from '../../atoms/Heading2';
import Header from '../../organisms/Header';
import ThreeStyleListForm from '../../organisms/ThreeStyleListForm';
import ThreeStyleTable from '../../organisms/ThreeStyleTable';

const Msg = (props) => (
    <ul>
        <li>3-style手順を一覧で確認できます</li>
        <ul>
            <li>未登録の手順は登録できます</li>
        </ul>
        <li>テキストボックスが空の状態で検索すると、全ての組み合わせを列挙します</li>
    </ul>
);

const ThreeStyleListTemplate = (
    {
        part,
        letters,
        radioMatch,
        radioOrder,
        checkSelectAll,
        algorithms,
        selectedProblemList,
        selectedAlgs,
        inputLetters,
        changeRadioOrder,
        changeRadioMatch,
        changeSelectAll,
        searchAlgorithms,
        onChangeProblemListSelect,
        onClickAddButton,
        selectAlg,
    }
) => (
    <div>
        <Header title="3-style 一覧" />

        <main>
            <Heading2 text={part} />

            <Msg />

            <ThreeStyleListForm
                letters={letters}
                radioMatch={radioMatch}
                radioOrder={radioOrder}
                selectedProblemList={selectedProblemList}
                inputLetters={inputLetters}
                changeRadioOrder={changeRadioOrder}
                changeRadioMatch={changeRadioMatch}
                searchAlgorithms={searchAlgorithms}
                onChangeProblemListSelect={onChangeProblemListSelect}
                onClickAddButton={onClickAddButton}
            />

            <ThreeStyleTable
                algorithms={algorithms}
                checkSelectAll={checkSelectAll}
                selectedAlgs={selectedAlgs}
                changeSelectAll={changeSelectAll}
                selectAlg={selectAlg}
            />
        </main>
    </div>
);

ThreeStyleListTemplate.propTypes = {
    part: PropTypes.string,
    letters: PropTypes.string,
    radioMatch: PropTypes.string,
    radioOrder: PropTypes.string,
    checkSelectAll: PropTypes.bool,
    algorithms: PropTypes.array,
    selectedProblemList: PropTypes.string,
    selectedAlgs: PropTypes.array,
    inputLetters: PropTypes.func,
    changeRadioOrder: PropTypes.func,
    changeRadioMatch: PropTypes.func,
    changeSelectAll: PropTypes.func,
    searchAlgorithms: PropTypes.func,
    onChangeProblemListSelect: PropTypes.func,
    onClickAddButton: PropTypes.func,
    selectAlg: PropTypes.func,
};

export default ThreeStyleListTemplate;
