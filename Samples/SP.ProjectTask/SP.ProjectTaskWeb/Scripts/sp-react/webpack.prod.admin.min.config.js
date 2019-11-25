const webpack = require("webpack");
const path = require('path');

const HtmlWebPackPlugin = require("html-webpack-plugin");
//const CleanWebpackPlugin = require("clean-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        main: [path.resolve(__dirname, 'src/Admin.jsx')]
    },
    output: {
        filename: 'js/[name].admin.bundle.min.js',
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
        new webpack.ProgressPlugin(),
        new MiniCssExtractPlugin({
            filename: "css/main.admin.min.css",
            chunkFilename: "css/main.[id].admin.min.css"
        }),
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, './src/Admin.html'),
            filename: "Admin.html"
        })
    ],
    //devtool: 'source-map',
    devtool: false,
    optimization: {
        splitChunks: {
            cacheGroups: {
                /*vendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom|office-ui-fabric-react|reactstrap)[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                }*/
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