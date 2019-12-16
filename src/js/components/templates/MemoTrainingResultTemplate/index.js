import React from 'react';
// import {
//     Link,
// } from 'react-router-dom';
// import Br from '../../atoms/Br';
// import Button from '../../atoms/Button';
import Header from '../../organisms/Header';
import Select from '../../molecules/Select';
// const config = require('../../../config');
// const path = require('path');

// const urlRoot = path.basename(config.urlRoot);

const eventOptions = [
    [ 'mbld', 'MBLD', ],
    [ 'cards', 'カード', ],
];

const trialTypes = [
    ['memorization', '記憶', ],
    ['transformation', '変換', ],
];

const MemoTrainingResultTemplate = () => (
    <div>
        <Header title="MemoTraining Result" />

        <main>
            <Select options={eventOptions} />
            <Select options={trialTypes} />

        </main>

    </div>
);

export default MemoTrainingResultTemplate;
