import React from 'react';
import Span from '../../atoms/Span';
import Textbox from '../../atoms/Textbox';

const SolutionPair = ({
    deckInd,
    pairInd,
    pairSize,

    updateMbldSolution,
    ...rest
}) => (
    <div>
        <Span>{`${deckInd + 1}-${pairInd + 1}`}</Span><Textbox onChange={(e) => updateMbldSolution(deckInd, pairInd, pairSize, e.target.value)}/>
    </div>
);

export default SolutionPair;
