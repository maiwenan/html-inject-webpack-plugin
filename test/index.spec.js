var path = require('path');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var expect = chai.expect;
var HtmlInjectPlugin = require('../src');


describe('html-inject-webpack-plugin test.', function () {
	it('test getTemplate function.', function (done) {
		var plugin = new HtmlInjectPlugin({});
		var tpls = [path.resolve(__dirname, '../example/views/home.html'), 
			path.resolve(__dirname, '../example/views/home.html')];
		var promise = plugin.getTemplate(tpls);

		expect(promise).to.eventually.be.fulfilled;
		promise.then(function (templates) {
			expect(templates.length).to.equal(2);
			done();
		});
	});

	it('test getAllTemplate function.', function () {
		var plugin = new HtmlInjectPlugin({});
		var promise = plugin.getAllTemplate({
			header: path.resolve(__dirname, '../example/views/commons/header.html'),
			footer: path.resolve(__dirname, '../example/views/commons/footer.html'),
			bodys: [{
				flagname: 'tabbar',
				template: path.resolve(__dirname, '../example/views/commons/tabbar.html')
			}]
		});

		expect(promise).to.eventually.be.fulfilled;
		expect(promise).to.eventually.have.property('header');
		expect(promise).to.eventually.have.property('bodys');
		expect(promise).to.eventually.have.property('footer');
	});

	it('test inject function.', function (done) {
		var plugin = new HtmlInjectPlugin({});
		var promise = plugin.inject({
			header: path.resolve(__dirname, '../example/views/commons/header.html'),
			footer: path.resolve(__dirname, '../example/views/commons/footer.html'),
			bodys: [{
				flagname: 'tabbar',
				template: path.resolve(__dirname, '../example/views/commons/tabbar.html')
			}]
		}, {
			plugin: {
				options: {
					filename: 'home.html'
				}
			},
			html: 'hello world!!<!-- inject:tabbar --><!-- endinject -->sfsafasfa' + 
				'<!-- inject:tabbar -->222<!-- endinject -->'
		});

		expect(promise).to.eventually.be.fulfilled;
		promise.then(function (html) {
			expect(html.indexOf('header') !== -1).to.equal(true);
			expect(html.indexOf('footer') !== -1).to.equal(true);
			expect(html.indexOf('tabbar') !== -1).to.equal(true);
			done();
		});
	});

	it('test write2disk function.', function () {
		var plugin = new HtmlInjectPlugin({});
		var htmlpath = path.resolve(__dirname, '../example/views/home.html');
		var dest = __dirname;
		var promise = plugin.write2disk(dest, htmlpath, 'hello world!!!.');

		expect(promise).to.eventually.be.fulfilled;
	});
});