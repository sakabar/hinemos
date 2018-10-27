import React from 'react';
import PropTypes from 'prop-types';

const Heading1 = (props) => (
    <h1>{props.text}</h1>
);

Heading1.propTypes = {
    text: PropTypes.string,
};

export default Heading1;
