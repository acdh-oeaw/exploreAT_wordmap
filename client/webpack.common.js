const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

const outputDirectory = 'dist'


module.exports = (env,args)=>{
  return {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, outputDirectory),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          query: {
            presets:['react']
          }
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      },
      { test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        use: 'url-loader',
        test: /\.(png|jpg|svg)$/
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin([outputDirectory]),
    new HtmlWebPackPlugin({
      template: "./public/index.html"
    }),
  ]
  }
};