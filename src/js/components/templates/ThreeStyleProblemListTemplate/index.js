import
React,
{ useEffect, } from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Heading2 from '../../atoms/Heading2';
import Textbox from '../../atoms/Textbox';
import LinkTdFactory from '../../molecules/LinkTd';
import Header from '../../organisms/Header';
import SortableTbl from 'react-sort-search-table';
const path = require('path');
const config = require('../../../config');
const constant = require('../../../constant');

const urlRoot = path.basename(config.urlRoot);

const ThreeStyleProblemListTemplate = (
    {
        url,
        loadWillSkipped,
        part,
        userName,
        titles,
        problemLists,

        setLoadWillSkipped,
        inputTitles,
        sagaLoadThreeStyleQuizProblemList,
        sagaCreateProblemLists,
    }
) => {
    // 第二引数として[]を渡しているので、コンポーネントのマウント/アンマウント時に発火
    useEffect(() => {
        if (!loadWillSkipped) {
            const newUrl = new URL(location.href);
            sagaLoadThreeStyleQuizProblemList(newUrl);
        }

        const cleanup = () => {
            setLoadWillSkipped(false);
        };

        return cleanup;
    }, []);

    return (
        <div>
            <Header title="問題リスト一覧" />

            <main>
                <Heading2>{part.japanese}</Heading2>
                <br/>
                <br/>
                <Textbox placeholder="リスト名" value={titles} onChange={(e) => inputTitles(e.target.value)}/><Button value="作成" onClick={(e) => sagaCreateProblemLists() }/><br/>

        [ ] 全て選択 選択したリストを[削除]<br/>

                {
                    (() => {
                        const myData = problemLists.map(problemList => {
                            return {
                                checkbox: '[]',
                                problemListId: problemList.problemListId,
                                title: problemList.title,
                                numberOfAlgs: problemList.numberOfAlgs,
                                createdAt: problemList.createdAt.format('YYYY/MM/DD HH:mm'),
                                // detail: '[詳細]',
                                // quiz: '[クイズ]',
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
                            customTd={[
                                { custd: LinkTdFactory((tdData, rowData, field) => `/${urlRoot}/threeStyle/problemListDetail.html?part=${part.name}&problemListId=${rowData.problemListId}`, '詳細'), keyItem: 'detail', },
                                { custd: LinkTdFactory((tdData, rowData, field) => `${config.urlRoot}/threeStyle/quiz.html?part=${part.name}&problemListType=problemList&sort=acc&problemListId=${rowData.problemListId}`, 'クイズ', false), keyItem: 'quiz', },
                                // { custd: LinkTdFactory((tdData, rowData, field) => `/${urlRoot}/threeStyle/quiz.html?part=${part.name}&problemListType=manual&sort=acc&problemListId=${rowData.problemListId}`, 'クイズ'), keyItem: 'quiz', },
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

ThreeStyleProblemListTemplate.propTypes = {
    url: PropTypes.object,
    loadWillSkipped: PropTypes.bool,
    part: PropTypes.oneOf([ ...Object.values(constant.partType), constant.dummyPartType, ]),
    userName: PropTypes.string.isRequired,
    titles: PropTypes.string,
    problemLists: PropTypes.array,

    setLoadWillSkipped: PropTypes.func.isRequired,
    inputTitles: PropTypes.func.isRequired,
    sagaLoadThreeStyleQuizProblemList: PropTypes.func.isRequired,
    sagaCreateProblemLists: PropTypes.func.isRequired,
};

export default ThreeStyleProblemListTemplate;
