import React from 'react';
import {Row} from 'reactstrap';

const MyRow = ({
    ...rest
}) => (
    <Row {...rest}/>
);

export default MyRow;
