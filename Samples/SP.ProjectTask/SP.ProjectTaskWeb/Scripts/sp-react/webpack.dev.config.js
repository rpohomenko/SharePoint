const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require('path');
module.exports = {
    entry: {
        main: [path.resolve(__dirname, 'src/index.jsx')],
        react: ['react', 'react-dom', 'office-ui-fabric-react'],
    },
    output: {
        filename: '[name].js',
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        }]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, './src/index.html')
        })
    ],
    watch: true,
    devtool: 'source-map',
    //devtool: 'cheap-source-map',
    devServer: {
        historyApiFallback: true,
        port: 3000,
        hot: true
    }
};