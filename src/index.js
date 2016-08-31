var fs = require('fs');
var path = require('path');
var mkdirpPromise = require('mkdirp-promise');
var escapeStringRegexp = require('escape-string-regexp');

var injectFlagMap = {
	html: {
		starttag: function (name) {
			name = name || 'html';
			return '<!-- inject:' + name + ' -->';
		},
		endtag: '<!-- endinject -->'
	}
};


function HtmlInjectPlugin(options) {
	this.options = options || {};
}

HtmlInjectPlugin.prototype.apply = function(compiler) {
	var self = this;

	compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-before-html-processing', function(htmlPluginData, callback) {
      var options = self.getFinalOptions(htmlPluginData);

      self.inject(options, htmlPluginData).then(function (html) {
      	htmlPluginData.html = html;
      	callback(null, htmlPluginData);
      }, function () {
      	callback(null, htmlPluginData);
      });
    });

    compilation.plugin('html-webpack-plugin-after-html-processing', function(htmlPluginData, callback) {
      var options = self.getFinalOptions(htmlPluginData);
      var config = htmlPluginData.plugin.options;
      var htmlpath = config.template.split('!')[1];
      
      if (options.dest) {
      	self.write2disk(options.dest, htmlpath, htmlPluginData.html).then(function () {
	      	callback(null, htmlPluginData);
      	}, function () {
	      	callback(null, htmlPluginData);
      	});
      } else {
	      callback(null, htmlPluginData);
      }
    });
  });
};

HtmlInjectPlugin.prototype.getFinalOptions = function (htmlPluginData) {
	var htmlPluginOptions = htmlPluginData.plugin.options;
  var injectConfig = htmlPluginOptions.injectConfig || {};
  var options = Object.assign({}, this.options, injectConfig);
  
  return options;
};

HtmlInjectPlugin.prototype.getTemplate = function (tplpath) {
	var filepaths = typeof tplpath === 'string' ? [tplpath] : tplpath;
	var promises = filepaths.map(function (filepath) {
		return new Promise(function (resolve, reject) {
			fs.readFile(filepath, 'utf8', function (err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	});

	return Promise.all(promises);
};

HtmlInjectPlugin.prototype.getAllTemplate = function (options) {
	var self = this;
	var tplMap = {
		bodys: {}
	};
	var promises = [];

	if (options.header) {
		promises.push(self.getTemplate(options.header).then(function (tpls) {
			tplMap.header = tpls;
			return tpls;
		}));
	}
	if (options.footer) {
		promises.push(self.getTemplate(options.footer).then(function (tpls) {
			tplMap.footer = tpls;
			return tpls;
		}));
	}
	if (options.bodys) {
		options.bodys.forEach(function (item) {
			promises.push(self.getTemplate(item.template).then(function (tpls) {
				if (tplMap.bodys[item.flagname]) {
					tplMap.bodys[item.flagname] = tplMap.bodys[item.flagname].concat(tpls);
				} else {
					tplMap.bodys[item.flagname] = tpls;
				}

				return tpls;
			}));
		});
	}

	return Promise.all(promises).then(function () {
		return tplMap;
	});
};

HtmlInjectPlugin.prototype.inject = function (options, htmlPluginData) {
	var html = htmlPluginData.html;
	var config = htmlPluginData.plugin.options;
  var ext = config.filename.split('.')[1];
  var tags = injectFlagMap[ext];

  function inject(html, name, tpls) {
  	name = escapeStringRegexp(name);
  	
		var reStr = tags.starttag(name) + '(.*\n*.*)' + tags.endtag;
		var re = new RegExp(reStr, 'ig');
		var newHtml = html.replace(re, function () {
			return tags.starttag(name) + '\n' + tpls.join('') + '\n' + tags.endtag;
		});

		return newHtml;
  }

	return this.getAllTemplate(options).then(function (tplMap) {
		if (tplMap.header) {
			html = tplMap.header.join('') + html;
		}
		if (tplMap.footer) {
			html += tplMap.footer.join('');
		}
		if (tplMap.bodys) {
			for (var name in tplMap.bodys) {
				html = inject(html, name, tplMap.bodys[name]);
			}
		}

		return html;
	}, function () {
		return html;
	});
};

HtmlInjectPlugin.prototype.write2disk = function (dest, htmlpath, htmlData) {
	var cwd = process.cwd();
	var destpath = path.join(dest, htmlpath.replace(cwd, ''));
	var destdir = path.dirname(destpath);

	return new Promise(function (resolve, reject) {
		mkdirpPromise(destdir).then(function () {
			fs.writeFile(destpath, htmlData, function (err, data) {
				if (!err) {
					resolve(err);
				} else {
					reject(data);
				}
			});
		});
	});
};

module.exports = HtmlInjectPlugin;