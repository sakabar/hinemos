import React from 'react';
import PropTypes from 'prop-types';
import Heading2 from '../../atoms/Heading2';
import Header from '../../organisms/Header';
import SortableTbl from 'react-sort-search-table';
import ThreeStyleProblemListDetailForm from '../../organisms/ThreeStyleProblemListDetailForm';
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

const ThreeStyleProblemListDetailTemplate = (
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
        sagaSearchAlgorithms,
        onChangeProblemListSelect,
        onClickAddButton,
        selectAlg,
    }
) => (
    <div>
        <Header title="3-style 一覧" />

        <main>
            <Heading2>{part.japanese}</Heading2>
        <Heading2>[FIXME: ここにリスト名を入れるよ]</Heading2>

            <Msg />

            <ThreeStyleProblemListDetailForm
                letters={letters}
                radioMatch={radioMatch}
                radioOrder={radioOrder}
                selectedProblemList={selectedProblemList}
                inputLetters={inputLetters}
                changeRadioOrder={changeRadioOrder}
                changeRadioMatch={changeRadioMatch}
                sagaSearchAlgorithms={sagaSearchAlgorithms}
                onChangeProblemListSelect={onChangeProblemListSelect}
                onClickAddButton={onClickAddButton}
            />

            {
                (() => {
                    const myData = [
                        {
                            checkbox: '[]',
                            ind: 1,
                            letters: '「あい」',
                            stickers: 'DF RF RU',
                            moves: '[S: [A, B]]',
                            acc: '1/3',
                            avgSec: 2.3,
                            tps: 9.9,
                            del: '[削除]',
                        },
                        {
                            checkbox: '[]',
                            ind: 2,
                            letters: '「あう」',
                            stickers: 'DF RF RU',
                            moves: '[S: [A, B]]',
                            acc: '1/3',
                            avgSec: 2.2,
                            tps: 8,
                            del: '[削除]',
                        },
                        {
                            checkbox: '[]',
                            ind: 3,
                            letters: '「かい」',
                            stickers: 'DF RF RU',
                            moves: '[S: [A, B]]',
                            acc: '1/3',
                            avgSec: 1.9,
                            tps: 9.8,
                            del: '[削除]',
                        },

                    ];

                    const tHead = [
                        '',
                        '連番',
                        'ナンバリング',
                        'ステッカー',
                        '手順',
                        '正解率',
                        '平均タイム',
                        'tps',
                        '操作',
                    ];

                    const col = [
                        'checkbox',
                        'ind',
                        'letters',
                        'stickers',
                        'moves',
                        'acc',
                        'avgSec',
                        'tps',
                        'operation',
                    ];

                    return (<SortableTbl tblData={myData}
                        tHead={tHead}
                        // customTd={[
                        //     { custd: DecideTrialButtonTdFactory(sagaDecideTrial), keyItem: 'decideTrial', },
                        // ]}
                        dKey={col}
                        search={true}
                        defaultCSS={true}
                    />
                    );
                })()
            }
        </main>
    </div>
);

ThreeStyleProblemListDetailTemplate.propTypes = {
    // part: PropTypes.string,
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
    sagaSearchAlgorithms: PropTypes.func,
    onChangeProblemListSelect: PropTypes.func,
    onClickAddButton: PropTypes.func,
    selectAlg: PropTypes.func,
};

export default ThreeStyleProblemListDetailTemplate;
