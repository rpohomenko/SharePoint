const webpack = require("webpack");
const path = require('path');
require("babel-polyfill");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        main: ["babel-polyfill", path.resolve(__dirname, 'src/index.jsx')],
        react: ['react', 'react-dom', 'office-ui-fabric-react']
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
            },
            {
                test: /\.css$/,
                include: /node_modules/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [{
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV === 'development',
                        },
                    },
                    'css-loader',
                    //'postcss-loader',
                    'sass-loader',
                ],
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss']
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: "main.css",
            chunkFilename: "main.[id].css"
        }),
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