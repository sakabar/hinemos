import React from 'react';
import { Card, } from 'reactstrap';

const MyCard = ({
    ...rest
}) => (
    <Card {...rest}/>
);

export default MyCard;
