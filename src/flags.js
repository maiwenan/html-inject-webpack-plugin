var injectFlagMap = {
	html: {
		starttag: function (name) {
			name = name || 'html';
			return '<!-- inject:' + name + ' -->';
		},
		endtag: '<!-- endinject -->'
	}
};

module.exports = function (ext)  {
	return injectFlagMap[ext] || injectFlagMap.html;
};