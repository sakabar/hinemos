import
React,
{ useEffect, } from 'react';
// import {
//     Link,
// } from 'react-router-dom';
import PropTypes from 'prop-types';
import Header from '../../organisms/Header';
import Face5 from '../../molecules/Face5';
// const config = require('../../../config');
// const path = require('path');

// const urlRoot = path.basename(config.urlRoot);

const NumberingTemplate = (
    {
        loadWillSkipped,
        userName,
        numbering,

        updateNumbering,
        sagaLoadNumbering,
        setLoadWillSkipped,
    }
) => {
    // 第二引数として[]を渡しているので、コンポーネントのマウント/アンマウント時に発火
    useEffect(() => {
        if (!loadWillSkipped) {
            sagaLoadNumbering();
        }

        const cleanup = () => {
            setLoadWillSkipped(false);
        };

        return cleanup;
    }, []);

    return (
        <div>
            <Header title="ナンバリング (4BLD, 5BLD)" />

            <main>
                <Face5 front="X" up="X" down="X" right="X" left="X" isHidden={true} numbering={numbering} updateNumbering={updateNumbering}/>
                <span>&nbsp;</span>
                <Face5 front="U" up="B" down="F" right="R" left="L" numbering={numbering} updateNumbering={updateNumbering} /><br/>
                <Face5 front="L" up="U" down="D" right="F" left="B" numbering={numbering} updateNumbering={updateNumbering}/>
                <span>&nbsp;</span>
                <Face5 front="F" up="U" down="D" right="R" left="L" numbering={numbering} updateNumbering={updateNumbering}/>
                <span>&nbsp;</span>
                <Face5 front="R" up="U" down="D" right="B" left="F" numbering={numbering} updateNumbering={updateNumbering}/>
                <span>&nbsp;</span>
                <Face5 front="B" up="U" down="D" right="L" left="R" numbering={numbering} updateNumbering={updateNumbering}/><br/>
                <Face5 front="X" up="X" down="X" right="X" left="X" isHidden={true} numbering={numbering} updateNumbering={updateNumbering}/>
                <span>&nbsp;</span>
                <Face5 front="D" up="F" down="B" right="R" left="L" numbering={numbering} updateNumbering={updateNumbering}/><br/>
            </main>
        </div>
    );
};

NumberingTemplate.propTypes = {
    loadWillSkipped: PropTypes.bool.isRequired,
    userName: PropTypes.string.isRequired,
    numbering: PropTypes.object.isRequired,

    updateNumbering: PropTypes.func.isRequired,
    sagaLoadNumbering: PropTypes.func.isRequired,
    setLoadWillSkipped: PropTypes.func.isRequired,
};
export default NumberingTemplate;
