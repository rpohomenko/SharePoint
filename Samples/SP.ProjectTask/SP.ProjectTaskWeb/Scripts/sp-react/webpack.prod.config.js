const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const CleanWebpackPlugin = require("clean-webpack-plugin");
//const TerserPlugin = require('terser-webpack-plugin');
const webpack = require("webpack");
const path = require('path');
module.exports = {
    entry: {
        main: [path.resolve(__dirname, 'src/index.jsx')]
    },
    output: {
        filename: 'js/[name].bundle.js',
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
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true
                        }
                    }
                ],
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss']
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new MiniCssExtractPlugin({

            filename: "css/main.css",
            chunkFilename: "css/main.[id].css"
        }),
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, './src/index.html'),
            filename: "test.html"
        })
    ],
    devtool: 'source-map',
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
        minimize: false
    }
};