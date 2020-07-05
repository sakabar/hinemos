import
React,
{ useEffect, } from 'react';
import {
    Link,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Checkbox from '../../atoms/Checkbox';
import Heading2 from '../../atoms/Heading2';
import Select from '../../molecules/Select';
import Header from '../../organisms/Header';
import CheckboxTdFactory from '../../molecules/CheckboxTd';
import SortableTbl from 'react-sort-search-table';
const path = require('path');
const constant = require('../../../constant');
const config = require('../../../config');

const urlRoot = path.basename(config.urlRoot);

const Msg = (props) => (
    <ul>
        <li>3-style手順を一覧で確認できます</li>
    </ul>
);

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

const ThreeStyleProblemListDetailTemplate = (
    {
        url,
        loadWillSkipped,
        part,
        userName,
        problemListId,
        isCheckedSelectAll,
        threeStyleQuizProblemLists,
        selectedThreeStyleQuizListId,
        threeStyleQuizProblemListDetail,
        threeStyleQuizProblemListDetailIndsStr,

        setLoadWillSkipped,
        selectAlgorithm,
        sagaLoadInitially,
        selectProblemList,
        sagaAddToProblemList,
        toggleSelectAll,
        sagaSortTable,
    }
) => {
    // 第二引数として[]を渡しているので、コンポーネントのマウント/アンマウント時に発火
    useEffect(() => {
        if (!loadWillSkipped) {
            const newUrl = new URL(location.href);
            sagaLoadInitially(newUrl);
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
        if (threeStyleQuizProblemListDetail.length > 0) {
            sagaSortTable(null, null);
        }
    });

    const showLength = 30;

    const threeStyleQuizProblemListOptions = [
        [ -1, '[選択してください]', ],
    ];
    threeStyleQuizProblemLists
        .filter(threeStyleQuizProblemList => threeStyleQuizProblemList.problemListId !== problemListId)
        .map(threeStyleQuizProblemList => {
            const title = threeStyleQuizProblemList.title;
            const omittedTitle = (title.length <= showLength) ? title : `${threeStyleQuizProblemList.title.slice(0, showLength - 3)}...`;

            const instance = [
                threeStyleQuizProblemList.problemListId,
                omittedTitle,
            ];

            threeStyleQuizProblemListOptions.push(instance);
        });

    const parentUrl = part ? `/${urlRoot}/threeStyle/problemList.html?part=${part.name}` : '';

    const showingProblemList = threeStyleQuizProblemLists
        .filter(threeStyleQuizProblemList => threeStyleQuizProblemList.problemListId === problemListId);

    const problemListTitle = (() => {
        if (threeStyleQuizProblemLists.length === 0) {
            return '';
        } else {
            if (problemListId) {
                return showingProblemList.length === 1 ? showingProblemList[0].title : '';
            } else {
                return 'system_all_全手順'; // FIXME これ、複数の場所に現れている
            }
        }
    })();

    return (
        <div>
            <Header title="3-style 一覧" />

            <main>
                <Heading2>{part ? part.japanese : ''}</Heading2>
                <Link to={parentUrl}>問題リスト一覧に戻る</Link>
                <Heading2>{problemListTitle}</Heading2>

                <Msg />

        選択した手順を
                <Select options={threeStyleQuizProblemListOptions} defaultValue={null} onChange={(e) => {
                    if (e.target.value === threeStyleQuizProblemListOptions[0][0]) {
                        selectProblemList(null);
                    } else {
                        selectProblemList(e.target.value);
                    }
                } }/>
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
                                isSelectable: record.isSelectable,
                                isSelected: record.isSelected, // 描画はしないが、checkboxの表示のために必要
                                pInd: record.pInd,
                                letters: record.dispLetters,
                                stickers: record.stickers,
                                moves: record.moves,
                                acc: record.acc === null ? null : record.acc.toFixed(2),
                                // avgSecが0の場合は出力しない
                                avgSec: record.avgSec ? parseFloat(record.avgSec.toFixed(2)) : null,
                                tps: record.tps === null ? null : parseFloat(record.tps.toFixed(2)),
                                createdAt: record.createdAt ? record.createdAt.format('YYYY/MM/DD HH:mm') : null,
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
                            '手順作成日時',
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
                            'createdAt',
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
    loadWillSkipped: PropTypes.bool,
    part: PropTypes.oneOf([ ...Object.values(constant.partType), constant.dummyPartType, ]),
    userName: PropTypes.string.isRequired,
    problemListId: PropTypes.number,
    isCheckedSelectAll: PropTypes.bool.isRequired,
    threeStyleQuizProblemLists: PropTypes.array,
    selectedThreeStyleQuizListId: PropTypes.number,
    threeStyleQuizProblemListDetail: PropTypes.array,
    threeStyleQuizProblemListDetailIndsStr: PropTypes.string,

    setLoadWillSkipped: PropTypes.func.isRequired,
    selectAlgorithm: PropTypes.func.isRequired,
    sagaLoadInitially: PropTypes.func.isRequired,
    selectProblemList: PropTypes.func.isRequired,
    sagaAddToProblemList: PropTypes.func.isRequired,
    toggleSelectAll: PropTypes.func.isRequired,
    sagaSortTable: PropTypes.func.isRequired,
};

export default ThreeStyleProblemListDetailTemplate;
