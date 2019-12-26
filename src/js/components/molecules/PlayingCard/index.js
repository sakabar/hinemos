import React from 'react';
import PropTypes from 'prop-types';
import Img from '../../atoms/Img';
import Span from '../../atoms/Span';
import cardImgDict from '../../../cardImgDict.js';
import cardImg from '../../../../../resource/cards/card.png';

//
// rowInd, colIndを渡して、複数枚縦横に並べた時にマージンを調整
const PlayingCard = ({
    tag,
    rowInd,
    colInd,
    onClick,
}) => (
    (() => {
        const aColInd = colInd || 0;
        const aRowInd = rowInd || 0;
        return (
            <Span>
                <Img src={cardImgDict[tag]} style={{ width: '25%', height: '25%', zIndex: `${2 * aColInd}`, margin: 0, marginLeft: `${aColInd === 0 ? 0 : -25 + 4}%`, marginTop: `${aRowInd === 0 ? 0 : -25 + 5}%`, }} alt={tag} />
                <Img src={cardImg} onClick={onClick} style={{ width: '25%', height: '25%', zIndex: `${2 * aColInd + 1}`, margin: 0, marginLeft: '-25%', marginTop: `${aRowInd === 0 ? 0 : -25 + 5}%`, }} />
            </Span>
        );
    })()
);

PlayingCard.propTypes = {
    tag: PropTypes.string.isRequired,
    colInd: PropTypes.number,
};

export default PlayingCard;
