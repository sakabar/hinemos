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
                <Img src={cardImgDict[tag]} style={{ width: '150px', zIndex: `${2 * aColInd}`, margin: 0, marginLeft: `${aColInd === 0 ? 0 : (-150 + 150 * 0.40)}px`, }} alt={tag} />
                <Img src={cardImg} onClick={onClick} style={{ width: '150px', zIndex: `${2 * aColInd + 1}`, margin: 0, marginLeft: '-150px', }} />
            </Span>
        );
    })()
);

PlayingCard.propTypes = {
    tag: PropTypes.string.isRequired,
    colInd: PropTypes.number,
};

export default PlayingCard;
