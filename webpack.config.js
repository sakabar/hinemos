const path = require('path');
const ExtendedDefinePlugin = require('extended-define-webpack-plugin');
// var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
// var StatsPlugin = require('stats-webpack-plugin');

module.exports = {
    cache: true,
    context: path.join(__dirname, '/src/js'),
    entry: {
        auth: './auth.js',
        errorPage: './errorPage.js',
        editThreeStyleQuizList: './editThreeStyleQuizList.js',
        importThreeStyle: './importThreeStyle.js',
        index: './index.js',
        letterPairTable: './letterPairTable.js',
        letterPairQuiz: './letterPairQuiz.js',
        listThreeStyle: './listThreeStyle.js',
        m2Method: './m2Method.js',
        mypage: './mypage.js',
        numbering3: './numbering3.js',
        oldPochmannMethod: './oldPochmannMethod.js',
        registerFaceColor: './registerFaceColor.js',
        registerLetterPair: './registerLetterPair.js',
        registerThreeStyle: './registerThreeStyle.js',
        signup: './signup.js',
        signin: './signin.js',
        signout: './signout.js',
        threeStyleTable: './threeStyleTable.js',
        threeStyleQuiz: './threeStyleQuiz.js',
        threeStyleQuizStats: './threeStyleQuizStats.js',
        threeStyleScrambler: './threeStyleScrambler.js',
        transformFromAnalysis: './transformFromAnalysis.js',
        tutorialAnalysisForBeginner: './tutorialAnalysisForBeginner.js',
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: './[name].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [ '@babel/preset-react', ],
                },
            },
            {
                test: /\.css$/,
                loaders: ['style-loader',
                    { loader: 'css-loader', options: { importLoaders: 1, }, }, ],
            },
            {
                test: /\.(jpg|png)$/,
                loaders: 'url-loader',
            },
        ],
        noParse: [ path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.min.js'), ],
    },
    resolve: {
        alias: {
            'handsontable': path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.min.js'),
            'handsontable.css': path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.min.css'),
        },
    },
    plugins: [
        new ExtendedDefinePlugin({
            DEPLOY_ENV: process.env.DEPLOY_ENV ? JSON.stringify(process.env.DEPLOY_ENV) : 'stg',
        }),
        // 不安定なのでコメントアウトして使わないようにした
        // new HardSourceWebpackPlugin(),

        // バンドルの大きさを調べたい時だけアンコメントする。Macに入れてあるwebpack-bundle-analyzerと連携
        // new StatsPlugin('stats.json', {
        //     chunkModules: true,
        // }),
    ],
    node: {
        fs: 'empty',
    },
};
