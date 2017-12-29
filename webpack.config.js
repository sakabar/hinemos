const path = require('path');
// import StyleLintPlugin from 'stylelint-webpack-plugin';

module.exports = {
    context: path.join(__dirname, '/src/js'),
    entry: {
        signup: './signup.js',
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
            }]},
    node: {
        fs: 'empty'
    }
};

