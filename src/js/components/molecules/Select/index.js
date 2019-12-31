import React from 'react';

const Select = ({
    options,
    onChange,
    ...rest
}) => (
    <select onChange={onChange} {...rest}>
        {
            options.map((vt, i) => {
                return (
                    <option key={i} value={vt[0]}>{vt[1]}</option>
                );
            })
        }
    </select>
);

export default Select;
