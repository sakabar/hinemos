import React from 'react';
import PropTypes from 'prop-types';
import Txt from '../../atoms/Txt';

const ScramblePanel = ({
    mutableScramble,
    className,
    ...rest,
}) => (
    <div className={className}>
        <Txt>
            {
                ( () => {
                    if (mutableScramble === '') {
                        return 'Click space to start solving!';
                    }

                    if (!mutableScramble) {
                        return 'Scramble: ';
                    }

                    return `Scramble: ${mutableScramble}`;
                })()
            }
        </Txt>
    </div>
);

ScramblePanel.propTypes = {
    scramble: PropTypes.string,
};

export default ScramblePanel;
