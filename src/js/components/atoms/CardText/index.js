import React from 'react';
import {CardText} from 'reactstrap';

const MyCardText = ({
    ...rest,
}) => (
    <CardText {...rest}/>
);

export default MyCardText;
