import React from 'react';
import Facelet from '../Facelet';
import PropTypes from 'prop-types';
import _ from 'lodash';
const constant = require('../../../constant');
const utils = require('../../../utils');

// onChange(constant.partType.corner, '')

const Face5 = ({
    front,
    up,
    down,
    right,
    left,
    isHidden,
    // onChange,
}) => {
    const style = (() => {
        // true/false以外の値が入っている可能性があるので、if(isHidden)ではなく === を使った判定にしている
        if (isHidden === true) {
            return {
                display: 'inline-block',
                visibility: 'hidden',
            };
        } else {
            return {
                display: 'inline-block',
            };
        }
    })();

    // 略記して見やすくするため
    const pt = constant.partType;
    const dummyPt = constant.dummyPartType;

    const parts = [
        [ pt.corner, pt.edgeWing, pt.edgeMiddle, pt.edgeWing, pt.corner, ],
        [ pt.edgeWing, pt.centerX, pt.centerT, pt.centerX, pt.edgeWing, ],
        [ pt.edgeMiddle, pt.centerT, dummyPt, pt.centerT, pt.edgeMiddle, ],
        [ pt.edgeWing, pt.centerX, pt.centerT, pt.centerX, pt.edgeWing, ],
        [ pt.corner, pt.edgeWing, pt.edgeMiddle, pt.edgeWing, pt.corner, ],
    ];

    const stickers = [
        [
            utils.sortSticker(`${front}${up}${left}`),
            utils.makeWingSticker(front, up, left),
            `${front}${up}`,
            utils.makeWingSticker(front, up, right),
            utils.sortSticker(`${front}${up}${right}`),
        ],
        [
            utils.makeWingSticker(front, left, up),
            utils.makeXcenterSticker(front, left, up),
            utils.makeTcenterSticker(front, up),
            utils.makeXcenterSticker(front, right, up),
            utils.makeWingSticker(front, right, up),
        ],
        [
            `${front}${left}`,
            utils.makeTcenterSticker(front, left),
            front,
            utils.makeTcenterSticker(front, right),
            `${front}${right}`,
        ],
        [
            utils.makeWingSticker(front, left, down),
            utils.makeXcenterSticker(front, left, down),
            utils.makeTcenterSticker(front, down),
            utils.makeXcenterSticker(front, right, down),
            utils.makeWingSticker(front, right, down),
        ],
        [
            utils.sortSticker(`${front}${down}${left}`),
            utils.makeWingSticker(front, down, left),
            `${front}${down}`,
            utils.makeWingSticker(front, down, right),
            utils.sortSticker(`${front}${down}${right}`),
        ],
    ];

    const zpOuter = _.zip(parts, stickers);
    const nodesOuter = zpOuter.map((tupleOuter, i) => {
        const partTypeBlock = tupleOuter[0];
        const stickerBlock = tupleOuter[1];

        const zpInner = _.zip(partTypeBlock, stickerBlock);
        const nodesInner = zpInner.map((tupleInner, k) => {
            const part = tupleInner[0];
            const sticker = tupleInner[1];
            return (<Facelet part={part} sticker={sticker} value={sticker} onChange={null} key={`${i}_${k}`}/>);
        });

        return [ ...nodesInner, <br key={`br_${i}`} />, ];
    });

    const facelets = _.flatten(nodesOuter);

    return (
        <div style={style}>
            {facelets}
        </div>
    );
};

Face5.propTypes = {
    front: PropTypes.string,
    up: PropTypes.string,
    down: PropTypes.string,
    right: PropTypes.string,
    left: PropTypes.string,
    isHidden: PropTypes.bool,
};

export default Face5;
