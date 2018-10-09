const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
   devServer: {
    contentBase: './dist',
    port: '4800',
    stats: 'errors-only',
    hot: true
  },
  devtool: "cheap-module-source-map",
});