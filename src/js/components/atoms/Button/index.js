import React from 'react';
import { Button, } from 'reactstrap';

const MyButton = ({
    type,
    value,
    ...rest
}) => (
    <Button {...rest}>{value}</Button>
);

export default MyButton;
