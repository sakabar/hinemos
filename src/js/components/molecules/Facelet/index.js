import React from 'react';
import Textbox from '../../atoms/Textbox';
import PropTypes from 'prop-types';
const constant = require('../../../constant');

const Facelet = ({
    part,
    sticker,
    value,
    onChange,
}) => (
    <Textbox value={value} onChange={onChange} size={3} />
);

Facelet.propTypes = {
    part: PropTypes.oneOf([ ...Object.values(constant.partType), constant.dummyPartType, ]),
    sticker: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
};

export default Facelet;
