import React from 'react';
import { Container, } from 'reactstrap';

const MyContainer = ({
    ...rest
}) => (
    <Container {...rest}/>
);

export default MyContainer;
