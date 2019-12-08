import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../atoms/Card';
import CardBody from '../../atoms/CardBody';
import CardText from '../../atoms/CardText';

const SectionResultPanel = ({
    sectionResult,
    ...rest
}) => {
    const recallSec = (sectionResult.recallMiliSec / 1000.0).toFixed(2);
    const execSec = (sectionResult.execMiliSec / 1000.0).toFixed(2);
    const totalSec = (sectionResult.totalMiliSec / 1000.0).toFixed(2);
    const timeStr = `${recallSec} + ${execSec} = ${totalSec}`;

    return (
    <Card body inverse color="info" {...rest}>
        <CardBody>
            <CardText>{sectionResult.movesStr}</CardText>
            <CardText>{timeStr}</CardText>
            <CardText>tps: {sectionResult.tps.toFixed(2)}</CardText>
        </CardBody>
    </Card>
    );
};

SectionResultPanel.propTypes = {
    sectionResult: PropTypes.object,
};

export default SectionResultPanel;
