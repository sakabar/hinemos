import React from 'react';
import {
    Link,
} from 'react-router-dom';
import PropTypes from 'prop-types';

// rowDataを埋め込めるようにするために、toは
// (tdData, rowData, field) => `ID is ${rowData.id}`
// のような関数で渡す
const LinkTdFactory = (dstFormat, text, internal = true) => {
    const LinkTd = ({
        tdData,
        rowData,
        field,
    }) => {
        if (internal) {
            return (
                <td>
                    <Link to={dstFormat(tdData, rowData, field)}>{text}</Link>
                </td>
            );
        } else {
            return (
                <td>
                    <a href={dstFormat(tdData, rowData, field)} target='_blank' rel='noreferrer noopener'>{text}</a>

                </td>
            );
        }
    };

    LinkTd.propTypes = {
        tdData: PropTypes.object,
        rowData: PropTypes.object,
        field: PropTypes.string,
    };

    return LinkTd;
};

export default LinkTdFactory;
