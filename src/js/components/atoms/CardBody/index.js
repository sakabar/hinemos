import React from 'react';
import { CardBody, } from 'reactstrap';

const MyCardBody = ({
    ...rest
}) => (
    <CardBody {...rest}/>
);

export default MyCardBody;
