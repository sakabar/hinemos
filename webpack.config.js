const path = require('path');
const ExtendedDefinePlugin = require('extended-define-webpack-plugin')

module.exports = {
    context: path.join(__dirname, '/src/js'),
    entry: {
        auth: './auth.js',
        letterPair: './letterPair.js',
        mypage: './mypage.js',
        signup: './signup.js',
        signin: './signin.js',
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
            }]
    },
    plugins: [
        new ExtendedDefinePlugin({
            URL_ROOT: 'http://saxcy.info/hinemos',
            API_ROOT: 'http://saxcy.info:8000/hinemos',
        })
    ],
    node: {
        fs: 'empty'
    }
};

