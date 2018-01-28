const path = require('path');
const ExtendedDefinePlugin = require('extended-define-webpack-plugin')

module.exports = {
    context: path.join(__dirname, '/src/js'),
    entry: {
        auth: './auth.js',
        index: './index.js',
        letterPairTable: './letterPairTable.js',
        mypage: './mypage.js',
        numbering3: './numbering3.js',
        letterPairQuiz: './letterPairQuiz.js',
        signup: './signup.js',
        signin: './signin.js',
        signout: './signout.js',
        threeStyleCorner: './threeStyleCorner.js',
        threeStyleQuizCorner: './threeStyleQuizCorner.js',
        transformFromAnalysis: './transformFromAnalysis.js',
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
            URL_ROOT: 'http://saxcy.info/hinemos',
            API_ROOT: 'http://saxcy.info:8192/hinemos',
        })
    ],
    node: {
        fs: 'empty'
    }
};

