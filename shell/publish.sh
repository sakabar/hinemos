#!/bin/bash

npm run webpack && {
    rm -rf public
    mkdir -p public
    cp src/html/*.html public
    cp dist/*.js public
    cp src/css/*.css public
}
