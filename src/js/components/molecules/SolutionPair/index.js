import React from 'react';
import PropTypes from 'prop-types';
import Span from '../../atoms/Span';
import Textbox from '../../atoms/Textbox';

const SolutionPair = ({
    deckInd,
    pairInd,

    sagaUpdateMbldSolution,
    ...rest
}) => {
    const deckIndStr = `${deckInd + 1}`.padStart(2, '0');
    const pairIndStr = `${pairInd + 1}`.padStart(2, '0');

    return (
        <div>
            <Span style={ { fontFamily: [ 'Courier New', 'monospace', ], } } >{`${deckIndStr}-${pairIndStr} `}</Span><Textbox onChange={(e) => sagaUpdateMbldSolution(deckInd, pairInd, e.target.value)}/>
        </div>
    );
};

SolutionPair.propTypes = {
    deckInd: PropTypes.number.isRequired,
    pairInd: PropTypes.number.isRequired,

    sagaUpdateMbldSolution: PropTypes.func.isRequired,
};

export default SolutionPair;
