import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';

const DecideTrialButtonFactory = (decideTrial) => {
    const DecideTrialButtonTd = ({
        tdData,
        rowData,
        field,
    }) => (
        <td>
            <Button value="詳細" onClick={(e) => { decideTrial(rowData.trialId); }} />
        </td>
    );

    DecideTrialButtonTd.propTypes = {
        tdData: PropTypes.object,
        rowData: PropTypes.object,
        field: PropTypes.string,
    };

    return DecideTrialButtonTd;
};

export default DecideTrialButtonFactory;
