import React from 'react';
import PropTypes from 'prop-types';

const Radio = ({ type, text, ...rest }) => (
    <label>
        <input type="radio" {...rest} />{text}
    </label>
);

Radio.propTypes = {
    text: PropTypes.string,
};

export default Radio;
