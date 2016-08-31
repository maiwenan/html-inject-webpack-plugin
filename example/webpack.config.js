var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlInjectPlugin = require('../src');

function getEntries(viewPath) {
	var dirs = fs.readdirSync(viewPath);
	var entryMap = {};
	
	dirs.forEach(function(dir) {

		// 忽略 viewPath 目录下的直接子文件，只算直接子文件夹
		if(dir.indexOf('.') === -1) {
			entryMap[dir] = [
				path.resolve(viewPath, dir + '/index')
	    ];
		}
	});

	return entryMap;
}

function getHtmlPlugins(viewPath) {
	var pages = fs.readdirSync(viewPath);
	var plugins = [];

	pages.forEach(function(page) {

		// 忽略 viewPath 目录下的直接子文件夹，只算直接子文件
		if(page.indexOf('.') !== -1) {
			plugins.push(new HtmlWebpackPlugin({
		    title: '商城页面',
		    inject: 'body',
		    filename: page,
		    template: path.resolve(viewPath, page),
		    // chunks: []
		    chunks: [page.split('.')[0]]
		  }));
		}
	});

	return plugins;
}

module.exports = {
	entry: getEntries(path.resolve(__dirname, './src/views')),
	output: {
    publicPath: 'http://192.168.1.119:3030/',
		filename: '[name].js'
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel'
			}, {
				test: /\.scss$/,
				loader: 'style!css!postcss!sass'
			},
			{
        test: /\.(eot|ttf|woff|svg|png|jpg|gif)(\?.*)?(#.*)?$/,
        loader: 'url?name=fonts/[name].[hash].[ext]'
      },
      {
      	test: /\.tpl$/,
      	loader: 'html?-attrs'
      }
		]
	},
	resolve: {
		extensions: ['', '.js', '.scss', '.css', '.tpl']
	},
	plugins: getHtmlPlugins(path.resolve(__dirname, './views')).concat([
		new HtmlInjectPlugin({
			header: path.resolve(__dirname, './views/commons/header.html'),
			footer: path.resolve(__dirname, './views/commons/footer.html'),
			bodys: [{
				flagname: 'tabbar',
				template: path.resolve(__dirname, './views/commons/tabbar.html')
			}]
		})
	]),
  postcss: [autoprefixer],
  devtool: 'eval'
};