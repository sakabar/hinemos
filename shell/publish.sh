#!/bin/bash

# DEPLOY_ENVが明示されていない場合は""とする
# set -u より前に書く必要がある
if [[ "${DEPLOY_ENV}" = "" ]]; then
    DEPLOY_ENV=""
fi

set -ue

# git pullするたびにconfig_stg.jsの中身がダミーになってしまうので、
# デプロイ時には自動的にstgの設定をコピーしておく
readonly STG_SETTING_JS=$HOME/work/hinemos_conf/js/config_stg.js
readonly IMG_DIR=$HOME/work/hinemos_logos
readonly PUBLISHED_DIR=public
cp -f $STG_SETTING_JS src/js/

npm run eslint && npm run test && npm run webpack && {
# npm run eslint && npm run webpack && {
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

    # これだけ、pathを書き換える必要があるので特別
    url_root=$(cat ~/work/hinemos_conf/js/config_stg.js | grep 'urlRoot' | grep -o "'.*'" | tr -d "'")
    url_root_basename=$(basename $url_root)
    if [[ "${DEPLOY_ENV}" == 'prod' ]]; then
        # 何もしない
        cat src/html/index.html > ${PUBLISHED_DIR}/index.html
    else
        # ルートディレクトリを書き換える
        cat src/html/index.html | sed -e "s|/hinemos/|/${url_root_basename}/|g" > ${PUBLISHED_DIR}/index.html
    fi
}
