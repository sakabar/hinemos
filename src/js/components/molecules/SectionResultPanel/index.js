import React from 'react';
import PropTypes from 'prop-types';

const SectionResultPanel = ({
    sectionResult,
}) => (
    <div>
        <ul>
            <li>{sectionResult.movesStr}</li>
            <li>{(sectionResult.recallMiliSec / 1000.0).toFixed(2)} + {(sectionResult.execMiliSec / 1000.0).toFixed(2)} = {(sectionResult.totalMiliSec / 1000.0).toFixed(2)}</li>
        <li>tps: {sectionResult.tps.toFixed(2)}</li>
        </ul>
    </div>
);

SectionResultPanel.propTypes = {
    sectionResult: PropTypes.object,
};

export default SectionResultPanel;
