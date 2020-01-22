import React from 'react';
import PropTypes from 'prop-types';
import Col from '../../atoms/Col';
import Container from '../../atoms/Container';
import Heading2 from '../../atoms/Heading2';
import Row from '../../atoms/Row';
import Txt from '../../atoms/Txt';
import SectionResultPanel from '../../molecules/SectionResultPanel';
const _ = require('lodash');

const SectionResultPanelsContainer = ({
    sectionResults,
    solveStartMiliUnixtime,
    memorizeDoneMiliUnixtime,
    solveDoneMiliUnixtime,
}) => {
    const recallSecSum = _.sum(sectionResults.map(s => s.recallMiliSec)) / 1000.0;
    const execSecSum = _.sum(sectionResults.map(s => s.execMiliSec)) / 1000.0;
    const totalSecSum = _.sum(sectionResults.map(s => s.totalMiliSec)) / 1000.0;
    const timerStopSec = (solveDoneMiliUnixtime - memorizeDoneMiliUnixtime) / 1000.0 - totalSecSum;

    const sumInfo = (solveDoneMiliUnixtime && sectionResults.length > 0) ? `想起合計: ${recallSecSum.toFixed(2)} / 実行合計: ${execSecSum.toFixed(2)} / タイマーストップ: ${timerStopSec.toFixed(2)}` : '想起合計:     / 実行合計:    / タイマーストップ:     ';

    return (
        <div>
            <Heading2>解析結果</Heading2>
            <Txt>{sumInfo}</Txt>
            <Container>
                <Row>
                    {
                        sectionResults.map((secRes, ind) =>
                            <Col key={ind} xs="3">
                                <SectionResultPanel sectionResult={secRes} className="h-100"/>
                            </Col>
                        )
                    }
                </Row>
            </Container>
        </div>
    );
};

SectionResultPanelsContainer.propTypes = {
    sectionResults: PropTypes.array,
};

export default SectionResultPanelsContainer;
