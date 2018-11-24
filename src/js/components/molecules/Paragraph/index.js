import React from 'react';
import PropTypes from 'prop-types';
import Heading2 from '../../atoms/Heading2';
import Txt from '../../atoms/Txt';

const Paragraph = ({ title, desc, }) => (
    <div>
        <Heading2>{title}</Heading2>
        <Txt>{desc}</Txt>
    </div>
);

Paragraph.propTypes = {
    title: PropTypes.string,
    desc: PropTypes.string,
};

export default Paragraph;
