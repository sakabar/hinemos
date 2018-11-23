import React from 'react';
import PropTypes from 'prop-types';
import Txt from '../../atoms/Txt';
import SectionResultPanel from '../../molecules/SectionResultPanel';

const SectionResultPanels = ({
    sectionResults,
}) => (
    <div>
        <Txt>とりあえず文字</Txt>

        {
            sectionResults.map((secRes, ind) =>
                <SectionResultPanel key={ind} sectionResult={secRes} />
            )
        }
    </div>
);

SectionResultPanels.propTypes = {
    sectionResults: PropTypes.array,
};

export default SectionResultPanels;
