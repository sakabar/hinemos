import React from 'react';

const Radio = ({ type, ...rest }) => (
    <label>
        <input type="radio" {...rest} />
    </label>
);

export default Radio;
