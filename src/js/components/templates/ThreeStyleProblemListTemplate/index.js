import
React,
{ useEffect, } from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Heading2 from '../../atoms/Heading2';
import Textbox from '../../atoms/Textbox';
import Header from '../../organisms/Header';
import SortableTbl from 'react-sort-search-table';
const constant = require('../../../constant');

const ThreeStyleProblemListTemplate = (
    {
        url,
        part,
        userName,
        titles,
        problemLists,

        inputTitles,
        sagaLoadThreeStyleQuizProblemList,
        sagaCreateProblemLists,
    }
) => {
    useEffect(() => {
        // コンポーネントが描画された時 & urlが変更された時にイベント発火
        const newUrl = new URL(location.href);
        if (!url || url.toString() !== newUrl.toString()) {
            sagaLoadThreeStyleQuizProblemList(newUrl);
        }
    });

    return (
        <div>
            <Header title="問題リスト一覧" />

            <main>
                <Heading2>{part ? part.japanese : ''}</Heading2>
                <br/>
                <br/>
                <Textbox placeholder="リスト名" value={titles} onChange={(e) => inputTitles(e.target.value)}/><Button value="作成" onClick={(e) => sagaCreateProblemLists() }/><br/>

        [] 全て選択 選択したリストを<Button value="削除"/><br/>

                {
                    (() => {
                        const myData = problemLists.map(problemList => {
                            return {
                                checkbox: '[]',
                                title: problemList.title,
                                numberOfAlgs: problemList.numberOfAlgs,
                                createdAt: problemList.createdAt.format('YYYY/MM/DD HH:mm'),
                                detail: '[詳細]',
                                quiz: '[クイズ]',
                            };
                        });

                        const tHead = [
                            '',
                            'リスト名',
                            '手順数',
                            '作成日時',
                            '',
                            '',
                        ];

                        const col = [
                            'checkbox',
                            'title',
                            'numberOfAlgs',
                            'createdAt',
                            'detail',
                            'quiz',
                        ];

                        return (<SortableTbl tblData={myData}
                            tHead={tHead}
                            // customTd={[
                            //     { custd: DecideTrialButtonTdFactory(sagaDecideTrial), keyItem: 'decideTrial', },
                            // ]}
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

ThreeStyleProblemListTemplate.propTypes = {
    url: PropTypes.object,
    part: PropTypes.oneOf(Object.values(constant.partType)),
    userName: PropTypes.string.isRequired,
    titles: PropTypes.string,
    problemLists: PropTypes.array,

    inputTitles: PropTypes.func.isRequired,
    sagaLoadThreeStyleQuizProblemList: PropTypes.func.isRequired,
    sagaCreateProblemLists: PropTypes.func.isRequired,
};

export default ThreeStyleProblemListTemplate;
