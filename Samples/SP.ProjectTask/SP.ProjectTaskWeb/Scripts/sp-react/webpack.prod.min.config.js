const HtmlWebPackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require("webpack");
const path = require('path');
module.exports = {
    entry: {
        main: [path.resolve(__dirname, 'src/index.jsx')],
    },
    output: {
        filename: '[name].bundle.min.js',
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
        new webpack.ProgressPlugin(),
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
            filename: "index.min.html"
        })
    ],
    //devtool: 'source-map',
    devtool: false,
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom|office-ui-fabric-react)[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                include: /\.min\.js$/,
                cache: true,
                parallel: true,
                sourceMap: true,
                terserOptions: {
                    output: {
                        comments: false,
                        ie8: false
                    }
                }
            }),
        ],
    }
};