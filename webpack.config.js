const path = require('path');
const ExtendedDefinePlugin = require('extended-define-webpack-plugin')

module.exports = {
    context: path.join(__dirname, '/src/js'),
    entry: {
        auth: './auth.js',
        errorPage: './errorPage.js',
        editThreeStyleQuizList: './editThreeStyleQuizList.js',
        index: './index.js',
        letterPairTable: './letterPairTable.js',
        letterPairQuiz: './letterPairQuiz.js',
        m2Method: './m2Method.js',
        mypage: './mypage.js',
        numbering3: './numbering3.js',
        registerFaceColor: './registerFaceColor.js',
        registerLetterPair: './registerLetterPair.js',
        registerThreeStyle: './registerThreeStyle.js',
        showThreeStyleCorner: './showThreeStyleCorner.js',
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
        filename: './[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loaders: ['style-loader',
                          {loader: 'css-loader', options: {importLoaders: 1}}],
            },
        ],
        noParse: [path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.js')]
    },
    resolve: {
        alias: {
            'handsontable': path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.js'),
            'handsontable.css': path.join(__dirname, 'node_modules/handsontable/dist/handsontable.full.css')
        }
    },
    plugins: [
        new ExtendedDefinePlugin({
            DEPLOY_ENV: process.env.DEPLOY_ENV ? JSON.stringify(process.env.DEPLOY_ENV) : 'stg',
        })
    ],
    node: {
        fs: 'empty'
    }
};

