import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../atoms/Button';

const BldTimerTemplate = (
    cube,
    connectCube,
    ...rest
) => (
    <div>
        <Header title="BLD Timer"/>

        <main>
            <Button onClick={() => connectCube() }/>
        </main>
    </div>
);

export default BldTimerTemplate;
