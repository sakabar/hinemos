import React from 'react';
import PropTypes from 'prop-types';

const Heading2 = (props) => (
    <h2>{props.text}</h2>
);

Heading2.propTypes = {
    text: PropTypes.string,
};

export default Heading2;
