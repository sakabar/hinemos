import React from 'react';

const Checkbox = ({ type, ...rest }) => (
    <label>
        <input type="checkbox" {...rest} />
    </label>
);

export default Checkbox;
