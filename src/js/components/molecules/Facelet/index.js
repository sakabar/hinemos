import React from 'react';
import Textbox from '../../atoms/Textbox';
import PropTypes from 'prop-types';
const constant = require('../../../constant');

const Facelet = ({
    part,
    sticker,
    numbering,
    updateNumbering,
}) => {
    const value = numbering[part.name][sticker] ? numbering[part.name][sticker].letter : '';
    const disabled = numbering[part.name][sticker] ? numbering[part.name][sticker].disabled : false;
    const onChange = (e) => updateNumbering(part.name, sticker, e.target.value);
    return (<Textbox value={value} onChange={onChange} size={1} disabled={disabled}/>);
};

Facelet.propTypes = {
    part: PropTypes.oneOf([ ...Object.values(constant.partType), constant.dummyPartType, ]),
    sticker: PropTypes.string.isRequired,
    numbering: PropTypes.object.isRequired,
    updateNumbering: PropTypes.func.isRequired,
};

export default Facelet;
