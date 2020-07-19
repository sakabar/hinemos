import React from 'react';
import Textbox from '../../atoms/Textbox';
import PropTypes from 'prop-types';
const constant = require('../../../constant');

const Facelet = ({
    part,
    sticker,
    numbering,
    updateNumbering,
    disabled,
}) => {
    const value = numbering[part.name][sticker] || '';
    const onChange = (e) => updateNumbering(part.name, sticker, e.target.value);
    return (<Textbox value={value} onChange={onChange} size={1} disabled={disabled}/>);
};

Facelet.propTypes = {
    part: PropTypes.oneOf([ ...Object.values(constant.partType), constant.dummyPartType, ]),
    sticker: PropTypes.string.isRequired,
    numbering: PropTypes.object.isRequired,
    updateNumbering: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default Facelet;
