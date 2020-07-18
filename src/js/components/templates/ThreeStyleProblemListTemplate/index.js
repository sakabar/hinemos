import
React,
{ useEffect, } from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
// import Checkbox from '../../atoms/Checkbox';
import Heading2 from '../../atoms/Heading2';
import Textbox from '../../atoms/Textbox';
import LinkTdFactory from '../../molecules/LinkTd';
import Header from '../../organisms/Header';
import CheckboxTdFactory from '../../molecules/CheckboxTd';
import SortableTbl from 'react-sort-search-table';
const path = require('path');
const config = require('../../../config');
const constant = require('../../../constant');

const urlRoot = path.basename(config.urlRoot);

// テキストボックスの値をJSの機能で変えた時にイベントを発火させるには、ひと手間必要
// https://github.com/facebook/react/issues/10135
// TODO: 同じコードがbldTimerにも書いてあるので共通化する
const setNativeValue = (element, value) => {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }
};

// SortableTblの値をvalueに変えてリロードする
// value = nullの時は今の値を変えずにリロードする
const reFilterTable = (value) => {
    const searchBox = document.querySelector('.sortable-table .search-box .search');

    const newValue = (value === null) ? searchBox.value : value;

    // いったん空にする (この時点ではonChange()は発火しない)
    searchBox.value = '';

    // newValueをInputするイベントを渡し、onChange()を発火
    setNativeValue(searchBox, newValue);
    const event = new Event('input', { bubbles: true, });
    searchBox.dispatchEvent(event);
};

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
        sagaSortTable,
        selectRow,
        sagaDeleteProblemLists,
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

    useEffect(() => {
        // Stateを変更して再描画があった時に、SortableTblのフィルタリングが解除されないようにした
        // 何もしないと、フィルタが反映されずに全件表示されてしまう
        reFilterTable(null);

        // sortableTblをクリックした時の見た目上のソートは、ReducerのStateには反映されていない
        // なので、見た目と状態が一致するように、再描画時にソートを適用する
        // sagaSortTableの処理の中で無限ループ回避をしているはず
        if (problemLists.length > 0) {
            sagaSortTable(null, null);
        }
    });

    return (
        <div>
            <Header title="問題リスト一覧" />

            <main>
                <Heading2>{part.japanese}</Heading2>
                <br/>
                <br/>
                <Textbox placeholder="リスト名" value={titles} onChange={(e) => inputTitles(e.target.value)}/><Button value="作成" onClick={(e) => sagaCreateProblemLists() }/><br/>

        [ ] 全て選択 選択したリストを<Button value="削除" onClick={(e) => sagaDeleteProblemLists() }/><br/>

                {
                    (() => {
                        const myData = problemLists.map(problemList => {
                            return {
                                isSelectable: problemList.isSelectable,
                                isSelected: problemList.isSelected,
                                pInd: problemList.pInd,

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
                            '連番',
                            'リスト名',
                            '手順数',
                            '作成日時',
                            '',
                            '',
                        ];

                        const col = [
                            'checkbox',
                            'pInd',
                            'title',
                            'numberOfAlgs',
                            'createdAt',
                            'detail',
                            'quiz',
                        ];

                        return (<SortableTbl tblData={myData}
                            tHead={tHead}
                            customTd={[
                                { custd: CheckboxTdFactory(selectRow), keyItem: 'checkbox', },
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
    sagaSortTable: PropTypes.func.isRequired,
    selectRow: PropTypes.func.isRequired,
    sagaDeleteProblemLists: PropTypes.func.isRequired,
};

export default ThreeStyleProblemListTemplate;
