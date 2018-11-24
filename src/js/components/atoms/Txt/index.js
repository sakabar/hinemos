import React from 'react';
import PropTypes from 'prop-types';

const Txt = ({ text, ...rest}) => (
    <p {...rest}>{text}</p>
);

Txt.propTypes = {
    text: PropTypes.string,
};

export default Txt;
