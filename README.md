# Html-Inject-Webpack-Plugin [![npm version](https://badge.fury.io/js/html-inject-webpack-plugin.svg)](https://badge.fury.io/js/html-inject-webpack-plugin) [![Build Status](https://travis-ci.org/maiwenan/html-inject-webpack-plugin.svg?branch=master)](https://travis-ci.org/maiwenan/html-inject-webpack-plugin) [![Coverage Status](https://coveralls.io/repos/github/maiwenan/html-inject-webpack-plugin/badge.svg)](https://coveralls.io/github/maiwenan/html-inject-webpack-plugin)

这是一个为页面插入自定义内容或者其他页面内容，并且可以把插入后的页面写到硬盘里的 [`webpakc`](https://github.com/webpack/webpack) 插件。她依赖 [`html-webpack-plugin`](https://github.com/ampedandwired/html-webpack-plugin) 插件。

## 下载

使用 `npm` 下载：

```
npm install html-inject-webpack-plugin --save-dev
```

## 配置参数

可以传递一下的参数到 `htmlInjectWebpackPlugin` 插件：

* `header` (`string` | `array`) : 在目标文件的头部插入 `header` 指定的文件内容，她的值可以是文件路径字符串或者是文件路径组成的数组（目前只支持绝对路径）。

* `footer` (`string` | `array`) : 在目标文件尾部插入 `footer` 指定的文件内容，她的值可以是文件路径字符串或者是文件路径组成的数组（目前只支持绝对路径）。

* `bodys` (`array`) : 在目标文件的带有自定义标记的地方插入指定的文件内容，组成该数组的一个对象就代表要插入内容的摸个标记符，她具有一下属性：
	
    * `flagname` (`string`) : 标记符的名称，如完整的注释标记 `<!-- inject:flagname --><!-- endinject -->` 中的 `flagname` 就是标记符名称，需要完整的注释标记才能正确插入内容。

    * `template` (`string` | `array`) : 被插入页面的路径地址，可以是字符串或者是文件路径组成的数组（目前只支持绝对路径）。

* `dest` (`string`) : 目标文件经过处理后被写到硬盘的路径，如果没设置该参数，则不生成文件。


## 基本使用

用法可以查看 `example` 里面的这个例子：

```
// webpack.config.js
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlInjectPlugin from 'html-inject-webpack-plugin';

const webpackConfig = {
  entry: 'index.js',
  output: {
    path: 'dist',
    filename: 'index_bundle.js'
  },
  plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './tpl/index.html'
		}),
		new HtmlInjectPlugin({
			bodys: [{
				flagname: 'tabbar',
				template: path.resolve(__dirname, './tpl/tabbar.html')
			}]
		})
  ]
};
```

```
<!-- ./tpl/index.html -->
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>html-inject-webpack-plugin</title>
	</head>
	<body>
		<div>header</div>
		<!-- inject:tabbar -->
		<!-- endinject -->
	</body>
</html>
```
```
<!-- ./tpl/tabbar.html -->
<ul>
	<li>menu1</li>
	<li>menu2</li>
	<li>menu3</li>
</ul>
```

插入文件内容后的 `index.html` ：

```
// index.html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>html-inject-webpack-plugin</title>
	</head>
	<body>
		<div>header</div>
		<!-- inject:tabbar -->
		<ul>
			<li>menu1</li>
			<li>menu2</li>
			<li>menu3</li>
		</ul>
		<!-- endinject -->
	</body>
</html>
```