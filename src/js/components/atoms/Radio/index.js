import React from 'react';

const Radio = ({ type, text, ...rest }) => (
    <label>
        <input type="radio" {...rest} />{text}
    </label>
);

export default Radio;
