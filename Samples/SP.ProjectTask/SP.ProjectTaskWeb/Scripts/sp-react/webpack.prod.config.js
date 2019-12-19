const webpack = require("webpack");
const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const CleanWebpackPlugin = require("clean-webpack-plugin");
//const TerserPlugin = require('terser-webpack-plugin');
const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin');
const { styles } = require('@ckeditor/ckeditor5-dev-utils');

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
                    'sass-loader',
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                exclude: /\/ckeditor5-/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        publicPath: '../fonts',
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }]
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, "node_modules/@ckeditor"),
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        cacheDirectory: true
                    }
                }]
            },
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                use: ['raw-loader']
            },
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
                use: [{
                        loader: 'style-loader',
                        options: {
                            injectType: 'singletonStyleTag'
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: styles.getPostCssConfig({
                            themeImporter: {
                                themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
                            },
                            minify: false
                        })
                    },
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss', '.css']
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
        }),
        new CKEditorWebpackPlugin({
            // See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
            language: 'en',
            additionalLanguages: 'all'
        })
    ],
    devtool: 'source-map',
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom|office-ui-fabric-react|@ckeditor|ckeditor5-react|ckeditor5-build-classic|reactstrap|moment)[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                }
            }
        },
        minimize: false
    }
};