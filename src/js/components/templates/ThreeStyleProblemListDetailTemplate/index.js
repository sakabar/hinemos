import
React,
{ useEffect, } from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Checkbox from '../../atoms/Checkbox';
import Heading2 from '../../atoms/Heading2';
import Select from '../../molecules/Select';
import Header from '../../organisms/Header';
import CheckboxTdFactory from '../../molecules/CheckboxTd';
import SortableTbl from 'react-sort-search-table';
const constant = require('../../../constant');

const Msg = (props) => (
    <ul>
        <li>3-style手順を一覧で確認できます</li>
        <ul>
            <li>未登録の手順は登録できます</li>
            <li>今見ているリストそのものへの登録を不能にする</li>
            <li>同じ手順が1つのリスト内に複数登録されないようにする (upsert的な感じ)</li>
        </ul>
    </ul>
);

const ThreeStyleProblemListDetailTemplate = (
    {
        url,
        part,
        userName,
        problemListId,
        isCheckedSelectAll,
        threeStyleQuizProblemLists,
        selectedThreeStyleQuizListId,
        threeStyleQuizProblemListDetail,

        selectAlgorithm,
        sagaLoadThreeStyleQuizProblemListDetail,
        selectProblemList,
        sagaAddToProblemList,
        toggleSelectAll,
    }
) => {
    useEffect(() => {
        // コンポーネントが描画された時 & urlが変更された時にイベント発火
        const newUrl = new URL(location.href);
        if (!url || url.toString() !== newUrl.toString()) {
            sagaLoadThreeStyleQuizProblemListDetail(newUrl);
        }
    });

    const showLength = 10;

    const threeStyleQuizProblemListOptions = [
        [ null, ' '.repeat(showLength), ],
    ];
    threeStyleQuizProblemLists
        .map(threeStyleQuizProblemList => {
            const title = threeStyleQuizProblemList.title;
            const omittedTitle = (title.length <= showLength) ? title : `${threeStyleQuizProblemList.title.slice(0, showLength - 3)}...`;

            const instance = [
                threeStyleQuizProblemList.problemListId,
                omittedTitle,
            ];

            threeStyleQuizProblemListOptions.push(instance);
        });

    return (
        <div>
            <Header title="3-style 一覧" />

            <main>
                <Heading2>{part ? part.japanese : ''}</Heading2>
                <Heading2>[FIXME: ここにリスト名を入れるよ]</Heading2>

                <Msg />

        選択した手順を
                <Select options={threeStyleQuizProblemListOptions} defaultValue={null} onChange={(e) => { if (e.target.value) { selectProblemList(e.target.value); } }}/>
            に<Button value='追加' onClick={(e) => { sagaAddToProblemList(); }}/>
                <br/>
             選択した手順をリストから[削除]
                <br/>
                <Checkbox text="全て選択" checked={isCheckedSelectAll} onChange={(e) => { toggleSelectAll(); }}/>
                <br/>

                {
                    (() => {
                        const myData = threeStyleQuizProblemListDetail.map(record => {
                            return {
                                isSelected: record.isSelected, // 描画はしないが、checkboxの表示のために必要
                                pInd: record.ind + 1, // 1-origin (positive ind)
                                letters: record.dispLetters,
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
};

ThreeStyleProblemListDetailTemplate.propTypes = {
    url: PropTypes.object,
    part: PropTypes.oneOf(Object.values(constant.partType)),
    userName: PropTypes.string.isRequired,
    problemListId: PropTypes.number,
    isCheckedSelectAll: PropTypes.bool.isRequired,
    threeStyleQuizProblemLists: PropTypes.array,
    selectedThreeStyleQuizListId: PropTypes.number,
    threeStyleQuizProblemListDetail: PropTypes.array,

    selectAlgorithm: PropTypes.func.isRequired,
    sagaLoadThreeStyleQuizProblemListDetail: PropTypes.func.isRequired,
    selectProblemList: PropTypes.func.isRequired,
    sagaAddToProblemList: PropTypes.func.isRequired,
    toggleSelectAll: PropTypes.func.isRequired,
};

export default ThreeStyleProblemListDetailTemplate;
