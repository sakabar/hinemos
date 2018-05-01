#!/bin/bash

# git pullするたびにconfig_stg.jsの中身がダミーになってしまうので、
# デプロイ時には自動的にstgの設定をコピーしておく
readonly STG_SETTING_JS=$HOME/work/hinemos_conf/js/config_stg.js
cp -f $STG_SETTING_JS src/js/

# npm run eslint && npm run test && npm run webpack && {
# npm run eslint && npm run webpack && {
 npm run webpack && {
    rm -rf public
    mkdir -p public

    cp src/html/*.html public
    cp dist/*.js public
    cp src/css/*.css public
    cp img/*.* public

    mkdir -p public/threeStyle
    cp src/html/threeStyle/*.html public/threeStyle
    cp src/css/threeStyle/*.css public/threeStyle

    cp dist/errorPage.bundle.js public/threeStyle

    cp node_modules/normalize.css/normalize.css public
}
