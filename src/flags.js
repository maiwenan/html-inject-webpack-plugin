var injectFlagMap = {
	html: {
		starttag: function (name) {
			name = name || 'html';
			return '<!-- inject:' + name + ' -->';
		},
		endtag: '<!-- endinject -->'
	}
};

injectFlagMap['jsp'] = injectFlagMap['vm'] = injectFlagMap.html;

module.exports = injectFlagMap;