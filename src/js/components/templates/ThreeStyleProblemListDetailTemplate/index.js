import React from 'react';
import PropTypes from 'prop-types';
import Heading2 from '../../atoms/Heading2';
import Header from '../../organisms/Header';
import CheckboxTdFactory from '../../molecules/CheckboxTd';
import SortableTbl from 'react-sort-search-table';
import ThreeStyleProblemListDetailForm from '../../organisms/ThreeStyleProblemListDetailForm';
import ThreeStyleTable from '../../organisms/ThreeStyleTable';

const Msg = (props) => (
    <ul>
        <li>3-style手順を一覧で確認できます</li>
        <ul>
            <li>未登録の手順は登録できます</li>
        </ul>
    </ul>
);

const ThreeStyleProblemListDetailTemplate = (
    {
        part,
        letters,
        radioMatch,
        radioOrder,
        checkSelectAll,
        threeStyleQuizProblemListDetail,
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

        selectAlgorithm,
    }
) => (
    <div>
        <Header title="3-style 一覧" />

        <main>
            <Heading2>{part.japanese}</Heading2>
            <Heading2>[FIXME: ここにリスト名を入れるよ]</Heading2>

            <Msg />

            {
            // <ThreeStyleProblemListDetailForm
            //     letters={letters}
            //     radioMatch={radioMatch}
            //     radioOrder={radioOrder}
            //     selectedProblemList={selectedProblemList}
            //     inputLetters={inputLetters}
            //     changeRadioOrder={changeRadioOrder}
            //     changeRadioMatch={changeRadioMatch}
            //     sagaSearchAlgorithms={sagaSearchAlgorithms}
            //     onChangeProblemListSelect={onChangeProblemListSelect}
            //     onClickAddButton={onClickAddButton}
            // />
            }

             選択した手順を[]に[追加]
            <br/>
    選択した手順をリストから[削除]
            <br/>

            {
                (() => {
                    const myData = threeStyleQuizProblemListDetail.map(record => {
                        return {
                            isSelected: record.isSelected, // 描画はしないが、checkboxの表示のために必要
                            pInd: record.ind + 1, // 1-origin (positive ind)
                            letters: `「${record.letters}」`,
                            stickers: record.stickers,
                            moves: record.moves,
                            acc: record.acc,
                            avgSec: record.avgSec,
                            tps: record.tps,
                            operation: '[削除]',
                        };
                    });

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
                        'pInd',
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
                        customTd={[
                            { custd: CheckboxTdFactory(selectAlgorithm), keyItem: 'checkbox', },
                        ]}
                        dKey={col}
                        search={true}
                        defaultCSS={true}
                        defaultRowsPerPage={1000}
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
