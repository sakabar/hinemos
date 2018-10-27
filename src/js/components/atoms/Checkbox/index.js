import React from 'react';

const Checkbox = ({ type, text, ...rest }) => (
    <label>
        <input type="checkbox" {...rest} />{text}
    </label>
);

export default Checkbox;
