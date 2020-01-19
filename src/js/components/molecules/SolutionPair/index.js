import React from 'react';
import PropTypes from 'prop-types';
import Span from '../../atoms/Span';
import Textbox from '../../atoms/Textbox';

const SolutionPair = ({
    deckInd,
    pairInd,

    sagaUpdateMbldSolution,
    ...rest
}) => (
    <div>
        <Span>{`${deckInd + 1}-${pairInd + 1}`}</Span><Textbox onChange={(e) => sagaUpdateMbldSolution(deckInd, pairInd, e.target.value)}/>
    </div>
);

SolutionPair.propTypes = {
    deckInd: PropTypes.number.isRequired,
    pairInd: PropTypes.number.isRequired,

    sagaUpdateMbldSolution: PropTypes.func.isRequired,
};

export default SolutionPair;
