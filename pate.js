var fs = require('fs');
var libxmljs = require('libxmljs');

/**
 * Parse XPath template
 *
 * @param  {String}   templateFile Template filename
 * @param  {String}   xml          XML Data
 * @param  {String}   xpath        XPath
 * @param  {Function} callback
 */
exports.parse = function parse(tpl, xml, xpath, callback) {
	var xmlDoc;

	try {
		xmlDoc = libxmljs.parseXmlString(xml);
		element = xmlDoc.root().get(xpath);
	} catch (e) {
		return callback(e);
	}

	var new_tpl = tpl.toString();

	// Eval source: http://jsfiddle.net/hU7e2/1/
	new_tpl = new_tpl.replace(/\{\{(.*?)\}\}/g, matchFn); // XPath match

	callback(null, new_tpl);
};

/**
 * Match function
 * 
 * @param  {String} match
 * @param  {String} token
 */
function matchFn(match, token) {
	var splited = token.trim().split('/');
	var retVal = element.get(splited[0]);

	if (splited.length < 2) {
		retVal = retVal.text();
	} else {
		splited[1] = splited[1].substr(1);
		retVal = retVal.attr(splited[1]).value();
	}

	return retVal;
}

/**
 * Register engine for ExpressJS
 *
 * @param  {String}   filename Template filename
 * @param  {Object}   options  Options: XML & XPath
 * @param  {Function} callback
 */
exports.__express = function(filename, options, callback) {
	if (!options.xml)
		return callback({ message: 'Error: Missing XML string' });
	if (!options.xpath)
		return callback({ message: 'Error: Missing XPath string' });

	fs.readFile(filename, function(err, tpl) {
		if (err)
			return callback(err);

		parse(tpl, options.xml, options.xpath, function(err, data) {
			if (err)
				return callback(err);

			callback(null, data);
		});
	});
};