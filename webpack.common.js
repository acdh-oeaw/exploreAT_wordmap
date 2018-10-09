const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = (env, argv) => {
  console.log(env.API_URL);
  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: [/node_modules/],
          use: [{
            loader: 'babel-loader'
          }],
        },
        {
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
        },
      ],
    },

    plugins: [
      new HtmlWebPackPlugin({
        hash: true,
        title: 'RDF Explorer',
        myPageHeader: 'RDF Explorer',
        template: "./src/index.html"
      }),
      new webpack.DefinePlugin({ 
        'API_URL': `'${env.API_URL}'`
      })
    ]
  }
};
