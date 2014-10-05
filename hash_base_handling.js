var fs = require("fs");

//exports
module.exports.inspectFile = inspectFile;
module.exports.updateCodesBase = updateCodesBase;
module.exports.readPredefinedData = readPredefinedData;


function inspectFile(determineType, filename, interpretData, deliverData) {

	fs.readFile("known_hash_codes", function (error, data) {
		if (error) {
			console.log(error.message);
			fs.writeFile("known_hash_codes", "");
			return;		
		}
 		var fileContent  = data.toString().split("\n");
		var hashCodesBase = [];
		fileContent.forEach(function (line) {
			if (line.replace(/[\s\t\n]/g, "") == "")
				return;
			try {
				var object = JSON.parse(line);
				hashCodesBase.push(object);
			} catch (error) {
				console.log("found some error " + error.message);
			}
		});
		determineType(hashCodesBase, filename, interpretData, deliverData);
	});
}


function updateCodesBase(data) {
	console.log("updating code base");
	var data = data.map(function (value) { return JSON.stringify(value)}).join("\n");
	fs.writeFileSync("known_hash_codes", data);
}


function readPredefinedData(path, callback) {
	fs.readFile("known_hash_codes", function(error, data) {
		var fileContent = data.toString().split("\n");
		var hashCodesBase = [];
		fileContent.forEach(function(line) {
			if (line.replace(/[\s\t\n]/g, "") == "")
				return;
			try {
				var object = JSON.parse(line);
				hashCodesBase.push(object);
			} catch (error) {
				console.log("found some error " + error.message);
			}
		});
		callback(path, hashCodesBase);
	});
}


function processKnownHashCodes(path) {
	readPredefinedData(path, function (path, hashCodesBase) {
		hashCodesBase.forEach(function (entry) {
			var type = entry.type;
			var keys = [];
			var relevant = [];
			entry.hash.forEach(function (value) {
				keys.push(value.key);
				var len = value.key.replace(/\s+$/, "").length + 1;
				if (relevant.some(function (number) { return number == len}) == false)
					relevant.push(len);
			});
			relevant.sort();
		});
	});
}
