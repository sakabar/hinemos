import React from 'react';
import PropTypes from 'prop-types';
import Img from '../../atoms/Img';
import Span from '../../atoms/Span';
import cardImgDict from '../../../cardImgDict.js';
import cardImg from '../../../../../resource/cards/card.png';

const PlayingCard = ({
    tag,
}) => (
    <Span>
        <Img src={cardImgDict[tag]} style={{ width: '15%', height: '15%', marginTop: '-5%', }} alt={tag} />
        <Img src={cardImg} style={{ width: '15%', height: '15%', zIndex: 2, marginLeft: '-15%', marginTop: '-5%', }} />
    </Span>
);

PlayingCard.propTypes = {
    tag: PropTypes.string.isRequired,
};

export default PlayingCard;
