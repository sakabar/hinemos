const rp = require('request-promise');

const importNumbering = () => {
    // class="importNumbering__text" を持つタグを取ってくる
    const text = document.querySelector('.importNumbering__text');

    // ユーザが入力したユーザ名
    const userName = text.value;

    // APIにアクセスする時のオプション(エッジ)
    const numberingEdgeOptions = {
        url: `http://saxcy.info:8192/hinemos/numbering/edgeMiddle/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // APIにアクセスする時のオプション(コーナー)
    const numberingCornerOptions = {
        url: `http://saxcy.info:8192/hinemos/numbering/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // APIにアクセス(コーナー)
    rp(numberingCornerOptions)
        .then((result) => {
            // 成功した場合
            const cornerNumbering = result.success.result;

            // APIにアクセス(エッジ)
            rp(numberingEdgeOptions)
                .then((result) => {
                    const edgeNumbering = result.success.result;

                    alert(JSON.stringify(cornerNumbering));
                    alert(JSON.stringify(edgeNumbering));

                    // このような形式のJSONで返ってくるので、あとはなんなりと使ってください
                    // [
                    //     {
                    //         "userName": "tsakakib",
                    //         "sticker": "UBL",
                    //         "letter": "@",
                    //         "createdAt": "2018-03-18T11:05:13.000Z",
                    //         "updatedAt": "2018-03-18T11:05:13.000Z"
                    //     },
                    //     {
                    //         "userName": "tsakakib",
                    //         "sticker": "UBR",
                    //         "letter": "さ",
                    //         "createdAt": "2018-03-18T11:05:13.000Z",
                    //         "updatedAt": "2018-03-18T11:05:13.000Z"
                    //     },
                    //     {
                    //         "userName": "tsakakib",
                    //         "sticker": "UFR",
                    //         "letter": "あ",
                    //         "createdAt": "2018-03-18T11:05:13.000Z",
                    //         "updatedAt": "2018-03-18T11:05:13.000Z"
                    //     }
                    // ]
                })
                .catch(err => {
                    // 失敗した場合
                    alert(`エラーが発生しました: ${err}`);
                });
        })
        .catch(err => {
            // 失敗した場合
            alert(`エラーが発生しました: ${err}`);
        });
};

const init = () => {
    // class="importNumbering__button" を持つタグを取ってくる
    const button = document.querySelector('.importNumbering__button');

    // ボタンに動作を割り当てる
    button.addEventListener('click', importNumbering);
};

init();
