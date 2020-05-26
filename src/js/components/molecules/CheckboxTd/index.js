import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../../atoms/Checkbox';

const CheckboxTdFactory = (selectAlgorithm) => {
    const CheckboxTd = ({
        tdData,
        rowData,
        field,
    }) => (
        <td>
            <Checkbox text='' checked={rowData.isSelected} onChange={(e) => { selectAlgorithm(rowData.pInd - 1, e.target.checked); }}/>
        </td>
    );

    CheckboxTd.propTypes = {
        tdData: PropTypes.object,
        rowData: PropTypes.object,
        field: PropTypes.string,
    };

    return CheckboxTd;
};

export default CheckboxTdFactory;
