import React from 'react';

const Button = ({ type, ...rest }) => (
    <input type="button" {...rest} />
);

export default Button;
