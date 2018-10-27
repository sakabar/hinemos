import React from 'react';

const Td = ({ children, ...rest }) => (
    <td {...rest}>{children}</td>
);

export default Td;
