#!/bin/bash

set -ue

# git pullするたびにconfig_stg.jsの中身がダミーになってしまうので、
# デプロイ時には自動的にstgの設定をコピーしておく
readonly STG_SETTING_JS=$HOME/work/hinemos_conf/js/config_stg.js
readonly IMG_DIR=$HOME/work/hinemos_logos
readonly PUBLISHED_DIR=public
cp -f $STG_SETTING_JS src/js/

npm run eslint && npm run test && npm run webpack && {
    rm -rf ${PUBLISHED_DIR}
    mkdir -p ${PUBLISHED_DIR}

    cp ${IMG_DIR}/tw_header_no_space.jpg ${PUBLISHED_DIR}/tw_header.jpg
    cp ${IMG_DIR}/icon_bw.png ${PUBLISHED_DIR}/icon_bw.png
    cp src/html/*.html ${PUBLISHED_DIR}
    cp dist/*.js ${PUBLISHED_DIR}
    cp src/css/*.css ${PUBLISHED_DIR}
    cp img/*.* ${PUBLISHED_DIR}

    mkdir -p ${PUBLISHED_DIR}/threeStyle
    cp src/html/threeStyle/*.html ${PUBLISHED_DIR}/threeStyle
    cp src/css/threeStyle/*.css ${PUBLISHED_DIR}/threeStyle

    cp dist/errorPage.bundle.js ${PUBLISHED_DIR}/threeStyle

    cp node_modules/normalize.css/normalize.css ${PUBLISHED_DIR}
}
