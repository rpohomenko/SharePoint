const webpack = require("webpack");
const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        main: [path.resolve(__dirname, 'src/index.jsx')],
        react: ['react', 'react-dom', 'office-ui-fabric-react', 'reactstrap']
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
        extensions: ['.js', '.jsx', '.scss', '.css']
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
    //devtool: 'source-map',
    devtool: 'eval-source-map',
    //devtool: "cheap-eval-source-map",
    devServer: {
        historyApiFallback: true,
        port: 3000,
        hot: true
    }
};