const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack =  require("webpack");
const path = require('path');
module.exports = {
    entry: path.resolve(__dirname, 'src/index.jsx'),
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'main.bundle.js'
    },  
    module: {
        rules: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            // {
            //     test: /\.js$/,
            //     use: ["source-map-loader"],
            //     enforce: "pre"
            // }     
        ]
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
        contentBase: 'dist/',
        hot: true
      }
};