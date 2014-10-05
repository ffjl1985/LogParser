var crypto = require("crypto");

var hostRegex = /^([\d\w\-]+\.)+([\d\w\-]+)/g;
var ipv4Regex = /([0-9]{1,3}\.){3}[0-9]{1,3}/g;
var ipv6Regex = /([A-Fa-f0-9]{1,4}:{1,2}){2,8}([A-Fa-f0-9]{1,4})?/g;
var standardDateRegex = /\[[0-3][0-9]\/[ABDFIJMNOS][a-z]{2}\/[0-9]{4}\:[0-2][0-9]\:[0-5][0-9]\:[0-5][0-9]/g;
var erroDateRegex = /\[[MTTWFSS][a-z]{2}\s[ABDFIJMNOS][a-z]{2}\s\s?[0-9][0-9]?\s([0-9][0-9]\:?){3}\s([0-9]{4})\]/g;
var requestRegex = /\"(.+?)\"/g;
var pathRegexUnix = /\/(([\w\d\-\_]([\w\d\-\_\.]+)?\/?)+)/g;
var pathRegexWindows = /\\(([\w\d\-\_]([\w\d\-\_]+)?\\?)+)/g;
var dateRegex = /^[ABDFIJMNOS][a-z]{2}\s[0-3][0-9]\s[0-2][0-9]\:[0-5][0-9]\:[0-5][0-9]/g



//exports
module.exports.getPattern = getPattern;

function getPattern(line) {
	var obj = {};
	
	//remove common fields
	line = removeStandardFields(line);
		
	//remove alphanumeric characters
	obj.key  = removeAlphanumeric(line);
	//console.log(obj.key);
	obj.hash_code = getHashCode(obj.key);
	return obj;
}

function removeAlphanumeric(line) {
	return line.replace(/[a-z0-9A-Z\,]/g, "");
}


function getHashCode(string) {
	return crypto.createHash("md5").update(string).digest("hex");
}


function removeStandardFields(line) {
	line = line.replace(hostRegex, "....")
	line = line.replace(standardDateRegex, "[//:::")
	line = line.replace(dateRegex, "//:::");
	line = line.replace(erroDateRegex, "[//:::]")
	line = line.replace(ipv4Regex, "....")
	line = line.replace(ipv6Regex, "....")
	line = line.replace(pathRegexUnix, "/")
	line = line.replace(pathRegexWindows, "/")
	line = line.replace(requestRegex, "\"\"");
	return line;
}


