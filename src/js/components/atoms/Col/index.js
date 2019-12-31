import React from 'react';
import { Col, } from 'reactstrap';

const MyCol = ({
    ...rest
}) => (
    <Col {...rest}/>
);

export default MyCol;
