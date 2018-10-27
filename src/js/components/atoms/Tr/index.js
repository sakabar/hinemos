import React from 'react';

const Tr = ({ children, ...rest }) => (
    <tr {...rest}>{children}</tr>
);

export default Tr;
