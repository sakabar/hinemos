import
React,
{ useEffect, } from 'react';
import PropTypes from 'prop-types';
import Heading2 from '../../atoms/Heading2';
import Header from '../../organisms/Header';
import CheckboxTdFactory from '../../molecules/CheckboxTd';
import SortableTbl from 'react-sort-search-table';
const constant = require('../../../constant');

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
        url,
        part,
        userName,
        problemListId,
        isCheckedSelectAll,
        threeStyleQuizProblemListDetail,

        selectAlgorithm,
        sagaLoadThreeStyleQuizProblemListDetail,
    }
) => {
    useEffect(() => {
        // コンポーネントが描画された時 & urlが変更された時にイベント発火
        const newUrl = new URL(location.href);
        sagaLoadThreeStyleQuizProblemListDetail(newUrl);
    }, [ url ? url.toString() : null, ]);

    return (
        <div>
            <Header title="3-style 一覧" />

            <main>
                <Heading2>{part ? part.japanese : ''}</Heading2>
                <Heading2>[FIXME: ここにリスト名を入れるよ]</Heading2>

                <Msg />

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
};

ThreeStyleProblemListDetailTemplate.propTypes = {
    url: PropTypes.object,
    part: PropTypes.oneOf(Object.values(constant.partType)),
    userName: PropTypes.string.isRequired,
    problemListId: PropTypes.number,
    isCheckedSelectAll: PropTypes.bool.isRequired,
    threeStyleQuizProblemListDetail: PropTypes.array,

    selectAlgorithm: PropTypes.func.isRequired,
    sagaLoadThreeStyleQuizProblemListDetail: PropTypes.func.isRequired,
};

export default ThreeStyleProblemListDetailTemplate;
