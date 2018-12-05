const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = (env, argv) => {
	return merge(common(env,argv), {
		mode: 'development',
   		devServer: {
    		port: '3000',
    		historyApiFallback: true,
  		},
  		devtool: "cheap-module-source-map"
	});
};