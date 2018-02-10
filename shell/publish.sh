#!/bin/bash

npm run eslint && npm run webpack && {
    rm -rf public
    mkdir -p public

    cp src/html/*.html public
    cp dist/*.js public
    cp src/css/*.css public
    cp img/*.* public

    mkdir -p public/threeStyle
    cp src/html/threeStyle/*.html public/threeStyle
    cp dist/errorPage.bundle.js public/threeStyle

    cp node_modules/normalize.css/normalize.css public
}
