import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';
import Checkbox from '../../atoms/Checkbox';
import ThreeStyleAlgorithmTr from '../../molecules/ThreeStyleAlgorithmTr';

const ThreeStyleTable = (
    {
        algorithms,
        checkSelectAll,
        changeSelectAll,
        onChangeProblemListSelect,
        onClickAddButton,
        selectAlg,
    }
) => (
    <div>
        <p>
            チェックした項目を
            <select onChange={onChangeProblemListSelect}>
                <option value="とりあえず問題リスト">とりあえず問題リスト</option>
                <option value="サ行苦手">サ行苦手</option>
            </select>
            へ<Button value='追加' onClick={onClickAddButton}/>
        </p>

        <Checkbox value="全て選択" text="全て選択" checked={checkSelectAll} onChange={() => changeSelectAll(!checkSelectAll)} />
        <br />

        <table className="listThreeStyleForm__table" border="1">
            <thead className="listThreeStyleForm__table__thead">
                <tr>
                    <th></th>
                    <th>連番</th>
                    <th>ナンバリング</th>
                    <th>ステッカー</th>
                    <th>手順</th>
                    <th>正解率</th>
                    <th>平均タイム</th>
                    <th>操作</th>
                </tr>
            </thead>

            <tbody className="listThreeStyleForm__table__tbody">
            {
                algorithms.map((alg) => {
                    return (
                        <ThreeStyleAlgorithmTr
                            key={alg.ind}
                            isChecked={alg.isChecked}
                            ind={alg.ind}
                            letters={alg.letters}
                            stickers={alg.stickers}
                            moves={alg.moves}
                            acc={alg.acc}
                            sec={alg.sec}
                            selectAlg={selectAlg}
                        />
                    );
                })
            }
            </tbody>
        </table>
    </div>
);

ThreeStyleTable.propTypes = {
    checkSelectAll: PropTypes.bool,
    changeSelectAll: PropTypes.func,
    onChangeProblemListSelect: PropTypes.func,
    onClickAddButton: PropTypes.func,
};

export default ThreeStyleTable;
