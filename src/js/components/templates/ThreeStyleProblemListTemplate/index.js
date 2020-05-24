import React from 'react';
// import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Heading2 from '../../atoms/Heading2';
import Textbox from '../../atoms/Textbox';
import Header from '../../organisms/Header';
import SortableTbl from 'react-sort-search-table';
const moment = require('moment');

const ThreeStyleProblemListTemplate = (
    {
        userName,
        part,
        buffer,
        titles,
        problemLists,

        inputTitles,
        sagaCreateProblemLists,
    }
) => (
    <div>
        <Header title="問題リスト一覧" />

        <main>
            <Heading2>{part.japanese}</Heading2>
            <br/>
            <br/>
            <Textbox placeholder="リスト名" value={titles} onChange={(e) => inputTitles(e.target.value)}/><Button value="作成" onClick={(e) => sagaCreateProblemLists(part, buffer, titles) }/><br/>

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
                    />
                    );
                })()
            }
        </main>
    </div>
);

export default ThreeStyleProblemListTemplate;
