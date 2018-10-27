import React from 'react';
import Tr from '../../atoms/Tr';
import Td from '../../atoms/Td';
import Checkbox from '../../atoms/Checkbox';

const ThreeStyleAlgorithmTr = ({
    isChecked,
    ind,
    letters,
    stickers,
    moves,
    acc,
    sec,
    selectAlg,
    ...rest
}) => (
    <Tr {...rest}>
        <Td><Checkbox checked={isChecked} onChange={() => selectAlg(ind, !isChecked)}/></Td>
        <Td>{ind}</Td>
        <Td>{letters}</Td>
        <Td>{stickers}</Td>
        <Td>{moves}</Td>
        <Td>{acc}</Td>
        <Td>{sec}</Td>
        <Td>操作は悩み中</Td>
    </Tr>
);

export default ThreeStyleAlgorithmTr;
