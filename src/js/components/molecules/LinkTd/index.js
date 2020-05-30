import React from 'react';
import {
    Link,
} from 'react-router-dom';
import PropTypes from 'prop-types';

// rowDataを埋め込めるようにするために、toは
// (tdData, rowData, field) => `ID is ${rowData.id}`
// のような関数で渡す
const LinkTdFactory = (dstFormat, text) => {
    const LinkTd = ({
        tdData,
        rowData,
        field,
    }) => (
        <td>
            <Link to={dstFormat(tdData, rowData, field)}>{text}</Link>
        </td>
    );

    LinkTd.propTypes = {
        tdData: PropTypes.object,
        rowData: PropTypes.object,
        field: PropTypes.string,
    };

    return LinkTd;
};

export default LinkTdFactory;
