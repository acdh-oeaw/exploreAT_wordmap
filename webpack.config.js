const path = require('path')

const HtmlWebPackPlugin = require("html-webpack-plugin");

const paths = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
  data: path.join(__dirname, 'data')
}

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'app.bundle.js',
    path: paths.dist,
    publicPath: 'dist',
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
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
    ],
  },
  devServer: {
    contentBase: paths.dist,
    port: '4800',
    stats: 'errors-only',
  },
  devtool: "cheap-module-source-map",
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./src/index.html"
    }),
  ],
}
