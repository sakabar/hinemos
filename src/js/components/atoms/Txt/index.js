import React from 'react';
import PropTypes from 'prop-types';

const Txt = (props) => (
    <p>{props.text}</p>
);

Txt.propTypes = {
    text: PropTypes.string,
};

export default Txt;
