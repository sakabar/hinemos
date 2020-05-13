import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Radio from '../../atoms/Radio';
import Textbox from '../../atoms/Textbox';

const ThreeStyleProblemListDetailForm = (
    {
        letters,
        radioMatch,
        radioOrder,
        selectedProblemList,
        inputLetters,
        changeRadioOrder,
        changeRadioMatch,
        sagaSearchAlgorithms,
        onChangeProblemListSelect,
        onClickAddButton,
    }
) => (

    <form className="listThreeStyleForm">
        <Textbox className="listThreeStyleForm__lettersText" maxLength="2" size="10" placeholder="ひらがな" value={letters} onChange={(e) => inputLetters(e.target.value)} />
        <br />

        <Radio name="listThreeStyleForm__radio" value="前方一致" checked={ radioMatch === '前方一致' } text="前方一致" onChange={() => changeRadioMatch('前方一致')} />
        <Radio name="listThreeStyleForm__radio" value="後方一致" checked={ radioMatch === '後方一致' } text="後方一致" onChange={() => changeRadioMatch('後方一致')} />
        <br />

        <Radio name="listThreeStyleForm__radio--order" value="ひらがな順" checked={ radioOrder === 'ひらがな順' } text="ひらがな順" onChange={() => changeRadioOrder('ひらがな順')} />
        <Radio name="listThreeStyleForm__radio--order" value="覚えていない順" checked={ radioOrder === '覚えていない順' } text="正解率が低い順" onChange={() => changeRadioOrder('覚えていない順')} />
        <Radio name="listThreeStyleForm__radio--order" value="遅い順" checked={ radioOrder === '遅い順' } text="遅い順" onChange={() => changeRadioOrder('遅い順')} />
        <br />

        <Button className="listThreeStyleForm__submitBtn" value="検索" onClick={() => sagaSearchAlgorithms()}/>
    </form>
);

ThreeStyleProblemListDetailForm.propTypes = {
    letters: PropTypes.string,
    radioMatch: PropTypes.string,
    radioOrder: PropTypes.string,
    algorithms: PropTypes.array,
    selectedProblemList: PropTypes.string,
    selectedAlgs: PropTypes.array,
    inputLetters: PropTypes.func,
    changeRadioOrder: PropTypes.func,
    changeRadioMatch: PropTypes.func,
    sagaSearchAlgorithms: PropTypes.func,
    onChangeProblemListSelect: PropTypes.func,
    onClickAddButton: PropTypes.func,
    onClickAlg: PropTypes.func,
};

export default ThreeStyleProblemListDetailForm;
