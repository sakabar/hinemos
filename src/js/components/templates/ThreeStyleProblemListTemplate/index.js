import React from 'react';
// import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Heading2 from '../../atoms/Heading2';
import Textbox from '../../atoms/Textbox';
import Header from '../../organisms/Header';
import SortableTbl from 'react-sort-search-table';
const moment = require('moment');

// const Paragraph = (props) => (
//     <div>
//         <h2>{props.title}</h2>
//         <p>{props.desc}</p>
//     </div>
// );

// Paragraph.propTypes = {
//     title: PropTypes.string,
//     desc: PropTypes.string,
// };

const ThreeStyleProblemListTemplate = () => (
    <div>
        <Header title="問題リスト一覧" />
        <Heading2>ウィングエッジ(ここFIXME)</Heading2>

        <main>
        どんな情報が必要なんだろう
            <br/>
            <Textbox placeholder="リスト名" /><Button value="作成"/><br/>

        [] 全て選択 選択したリストを<Button value="削除"/><br/>

            {
                (() => {
                    const myData = [
                        {
                            checkbox: '[]',
                            title: 'サ行苦手',
                            algNum: 10,
                            createdAt: moment('2020/05/13 10:00', 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm'),
                            detail: '[詳細]',
                            quiz: '[クイズ]',
                        },
                        {
                            checkbox: '[]',
                            title: 'sys_all',
                            algNum: 378,
                            createdAt: moment('2020/05/13 10:01', 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm'),
                            detail: '[詳細]',
                            quiz: '[クイズ]',
                        },
                        {
                            checkbox: '[]',
                            title: 'sys_kh_001_あい',
                            algNum: 1,
                            createdAt: moment('2020/05/13 10:01', 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm'),
                            detail: '[詳細]',
                            quiz: '[クイズ]',
                        },
                        {
                            checkbox: '[]',
                            title: 'sys_kh_002_うき',
                            algNum: 2,
                            createdAt: moment('2020/05/13 10:01', 'YYYY/MM/DD HH:mm').format('YYYY/MM/DD HH:mm'),
                            detail: '[詳細]',
                            quiz: '[クイズ]',
                        },
                    ];

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
                        'algNum',
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
