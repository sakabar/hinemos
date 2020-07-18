import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../../atoms/Checkbox';

const CheckboxTdFactory = (selectRow) => {
    const CheckboxTd = ({
        tdData,
        rowData,
        field,
    }) => (
        <td>
            <Checkbox text='' checked={rowData.isSelected} disabled={!rowData.isSelectable} onChange={(e) => { selectRow(rowData.pInd, e.target.checked); }}/>
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
