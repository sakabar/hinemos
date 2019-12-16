import React from 'react';
import Span from '../../atoms/Span';
import Textbox from '../../atoms/Textbox';

const SolutionPair = ({
    deckInd,
    pairInd,
    solution,

    updateSolution,
    ...rest
}) => (
    <div>
        <Span>{`${deckInd + 1}-${pairInd + 1}`}</Span><Textbox onChange={(e) => updateSolution(deckInd, pairInd, e.target.value)}/>
    </div>
);

export default SolutionPair;
