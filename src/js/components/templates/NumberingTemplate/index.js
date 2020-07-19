import React from 'react';
// import {
//     Link,
// } from 'react-router-dom';
import Header from '../../organisms/Header';
import Face5 from '../../molecules/Face5';
// const config = require('../../../config');
// const path = require('path');

// const urlRoot = path.basename(config.urlRoot);

const MemoTrainingTemplate = () => (
    <div>
        <Header title="ナンバリング (4BLD, 5BLD)" />

        <main>
            <Face5 front="X" up="X" down="X" right="X" left="X" isHidden={true}/>
            <span>&nbsp;</span>
            <Face5 front="U" up="B" down="F" right="R" left="L" /><br/>
            <Face5 front="L" up="U" down="D" right="F" left="B" />
            <span>&nbsp;</span>
            <Face5 front="F" up="U" down="D" right="R" left="L" />
            <span>&nbsp;</span>
            <Face5 front="R" up="U" down="D" right="B" left="F" />
            <span>&nbsp;</span>
            <Face5 front="B" up="U" down="D" right="L" left="R" /><br/>
            <Face5 front="X" up="X" down="X" right="X" left="X" isHidden={true}/>
            <span>&nbsp;</span>
            <Face5 front="D" up="F" down="B" right="R" left="L" /><br/>
        </main>
    </div>
);

export default MemoTrainingTemplate;
