var rl = require("readline");
var fs = require("fs");
var patterns = require("./patterns.js");
var leven = require("./levensthein.js");
var hash_base = require("./hash_base_handling.js");
var pp = require("./parsing_patterns.js");


//exports
module.exports.determineLogFileTypeInteractive = determineLogFileTypeInteractive;
module.exports.determineFileType = determineFileType;


function determineFileType(filename, callback, deliverData) {
	hash_base.inspectFile(determineLogFileType, filename, callback, deliverData);
}

function determineLogFileType(data, filename, interprateData, deliverData) {
	if (filename instanceof Array) {
		if (filename.length == 0) {
			console.log("no input. nothing to do."); // error
			var error_object = {};
			error_object["status"] = "error";
			error_object["msg"] = "no input. nothing to do";
			deliverData(error_object);
		}
		totalines = 0;
		matchedlines = 0;
		var matchedTypes = [];
		var fileContent = [];
		var noMatch = [];

		filename.forEach(function(line) {
			fileContent.push(line);
			totalines++;

			//if 10 lines matched succesfully, type can be determined
			if (matchedlines < 10) {
				var pattern = patterns.getPattern(line);
				var pattern_found = false;
				data.forEach(function(entry) {
					entry.hash.forEach(function(hash_entry) {
						if (hash_entry.hash_code == pattern.hash_code) {
							pattern_found = true;
							var known_type = false;
							matchedTypes.forEach(function(value) {
								if (value.type == entry.type) {
									value.number++;
									known_type = true;
								}
							});

							if (known_type == false) {
								// console.log("found new type " + line);
								var newtype = {};
								newtype.type = entry.type;
								newtype.number = 1;
								matchedTypes.push(newtype);
							}
						}
					});
				});
				if (pattern_found)
					matchedlines++;
				else {
					console.log("pattern not found in database: " + line);
					var test_line = line.replace(/[\s\t\n]/, "");
					if (test_line == "") {
						console.log("empty line. will be ignored");
					} else {
						var tmp = {};
						tmp.pattern = pattern;
						tmp.line = line;
						noMatch.push(tmp);

					}
				}
			}

			if (totalines == 100) {
				// console.log("total number of linex inspected: " + totalines);
				// console.log("total number of matched lines " + matchedlines);
				// console.log("new chunk delivered");
				if (noMatch.length > 0) {
					matchRelevant(data, matchedTypes, noMatch, fileContent, interprateData, deliverData);
				} else {
					interprateData(matchedTypes, fileContent, deliverData);
				}
				totalines = 0;
				matchedlines = 0;
				matchedTypes = [];
				fileContent = [];
				noMatch = [];
				badLines = [];
			}
		});
		if (fileContent.length > 0) {
			// console.log("total number of linex inspected: " + totalines);
			// console.log("total number of matched lines " + matchedlines);
			// console.log("new chunk delivered");
			if (noMatch.length > 0) {
				matchRelevant(data, matchedTypes, noMatch, fileContent, interprateData, deliverData);
			} else {
				interprateData(matchedTypes, fileContent, deliverData);
			}
			totalines = 0;
			matchedlines = 0;
			matchedTypes = [];
			fileContent = [];
			noMatch = [];
			badLines = [];
		}
	
	} else {
		var new_file = rl.createInterface({
			input: fs.createReadStream(filename),
			output: process.stdout,
			terminal: false
		});

		new_file.totalines = 0;
		new_file.matchedlines = 0;
		var matchedTypes = [];
		var fileContent = [];
		var noMatch = [];
		var badLines = [];

		new_file.on("line", function(line) {
			fileContent.push(line);
			new_file.totalines++;

			//if 10 lines matched succesfully, type can be determined
			if (new_file.matchedlines < 10) {
				var pattern = patterns.getPattern(line);
				var pattern_found = false;
				data.forEach(function(entry) {
					entry.hash.forEach(function(hash_entry) {
						if (hash_entry.hash_code == pattern.hash_code) {
							pattern_found = true;
							var known_type = false;
							matchedTypes.forEach(function(value) {
								if (value.type == entry.type) {
									value.number++;
									known_type = true;
								}
							});

							if (known_type == false) {
								// console.log("found new type " + line);
								var newtype = {};
								newtype.type = entry.type;
								newtype.number = 1;
								matchedTypes.push(newtype);
							}
						}
					});
				});
				if (pattern_found)
					new_file.matchedlines++;
				else {
					console.log("pattern not found in database: " + line);
					var test_line = line.replace(/[\s\t\n]/, "");
					if (test_line == "") {
						console.log("empty line. will be ignored");
					} else {
						var tmp = {};
						tmp.pattern = pattern;
						tmp.line = line;
						noMatch.push(tmp);
					}
				}
			}

			if (new_file.totalines == 100) {
				// console.log("total number of linex inspected: " + new_file.totalines);
				// console.log("total number of matched lines " + new_file.matchedlines);
				// console.log("new chunk delivered");
				if (noMatch.length > 0) {
					matchRelevant(data, matchedTypes, noMatch, fileContent, interprateData, deliverData);
				} else {
					interprateData(matchedTypes, fileContent, deliverData);
				}
				new_file.totalines = 0;
				new_file.matchedlines = 0;
				matchedTypes = [];
				fileContent = [];
				noMatch = [];
				badLines = [];
			}
		});

		new_file.on("close", function(line) {
			// console.log("total number of linex inspected: " + new_file.totalines);
			// console.log("total number of matched lines " + new_file.matchedlines);
			// console.log("new chunk delivered");
			if (noMatch.length > 0) {
				// console.log("inspecting lines with no match");
				matchRelevant(data, matchedTypes, noMatch, fileContent, interprateData, deliverData);
			} else
				interprateData(matchedTypes, fileContent, deliverData);
			new_file.totalines = 0;
			new_file.matchedlines = 0;
			matchedTypes = [];
			fileContent = [];
			noMatch = [];
			badLines = [];
		});
	}
}

function determineLogFileTypeInteractive() {
	var inputline = rl.createInterface({
    	input: process.stdin,
    	output: process.stdout,
    	terminal: false
	});

	inputline.on("line", function (line) {
		hash_base.inspectFile(determineLogFileType, line, function (matchedTypes) {
			// console.log("delivering results...");
			if (matchedTypes.new_patterns == undefined)
				console.log(matchedTypes);
			else  {
				// console.log(matchedTypes.new_patterns + " lines matched partially");
				console.log(matchedTypes);
			}

		});
	});
	inputline.on("close", function () {
		console.log("------------");
	});
}

function computeLevenAproximation(data, fileContent, callback) {
	var matchedTypes = [];
	fileContent.forEach(function(line) {
		var pattern = patterns.getPattern(line);
		data.forEach(function(entry) {
			var bestScore = Infinity;
			entry.hash.forEach(function(knownPattern) {
				var levenDistance = leven.getEditDistance(knownPattern.key, pattern.key);
				if (levenDistance < bestScore)
					bestScore = levenDistance;
			});
			var obj = {};
			obj.type = entry.type;
			obj.score = bestScore;
			
			var found = false;
			for (var i = 0; i < matchedTypes.length; i++) {
				if (matchedTypes[i].type == obj.type) {
					found = true;
					if (matchedTypes[i].score > obj.score)
						matchedTypes[i].score = obj.score;
					break;
				}
			}
			
			if (found == false) {
				matchedTypes.push(obj);
			}
		});
	});

	matchedTypes = matchedTypes.sort(function (one, other) {
		// console.log("comparing " + one.score + " " + other.score);
		return one.score - other.score;
	});	
	callback(matchedTypes);
}

function matchRelevant(hashCodesBase, matchedLines, noMatch, fileContent, interprateData, deliverData) {
	matchedLines.new_patterns = 0;
	var string = "";
	var noMatchLines = [];

	noMatch.forEach(function (entry) {
		string += entry.pattern.key + "\n";
	});

	console.log("unfortunate patterns:\n" + string);
	console.log("trying to match something partially");

	noMatch.forEach(function(pattern_entry) {
		var type_found = false;
		hashCodesBase.forEach(function(entry) {
			var relevant = entry.relevant;
			for (var i = 0; i < relevant.length; i++) {
				var relevant_number = relevant[i];
				if (pattern_entry.pattern.key.length >= relevant_number) {
					var short_key = pattern_entry.pattern.key.slice(0, relevant_number - 1);
					var found = entry.hash.some(function(value) {
						return value.key == short_key;
					});
					if (found == true) {
						var added = false;
						type_found = true;
						matchedLines.forEach(function(log_type) {
							if (log_type.type == entry.type) {
								log_type.number++;
								matchedLines.new_patterns++;
								added = true;
							}
						});
						if (added == false) {
							var new_entry = {};
							new_entry.type = entry.type;
							new_entry.number = 1;
							matchedLines.push(new_entry);
						}
						break;
					}
				}
			}
		});
		if (type_found == false) {
			noMatchLines.push(pattern_entry.line);
		}
	});

	console.log(matchedLines.new_patterns + " partial patterns matched");

	if (noMatchLines.length > 0) {
		determineTypeByParsing(matchedLines, noMatchLines, fileContent, interprateData, deliverData);
	} else {
		interprateData(matchedLines, fileContent, deliverData);
	}
}

function determineTypeByParsing(matchedTypes, badLines, fileContent, interprateData, deliverData) {
	console.log("still nothing for you, trying to parse....");
	var bad_patterns = [];
	var matchedLines = 0;
	badLines.forEach(function (line) {
		var matched = false;
		pp.patterns.forEach(function(object) {
			var matched_line = false;
			if (object.regex instanceof Function) {
				var tmp = object.regex(line);
				var length = 0;
				
				for (value in tmp)
					length++;
				
				if (length > 0)
					matched_line = true;
			} else {
				matched_line = object.regex.test(line);
			}

			if (matched_line) {
				matched = true;
				var known_type = false;
				matchedTypes.forEach(function(value) {
					if (value.type == object.type) {
						value.number++;
						known_type = true;
					}
				});

				if (known_type == false) {
					// console.log("found new type " + line + " type " + object.type);
					var newtype = {};
					newtype.type = object.type;
					newtype.number = 1;
					matchedTypes.push(newtype);
				}
			}
		})

		if (matched)
			matchedLines++;
		else {
			console.log("pattern not found in database: " + line);
			var test_line = line.replace(/[\s\t\n]/, "");
			if (test_line == "") {
				console.log("empty line. will be ignored");
			} else {
				bad_patterns.push(line);
			}
		}
	});

	if (bad_patterns.length > 0) {
		console.log("no match lines : " + bad_patterns.length);
		console.log(JSON.stringify(bad_patterns));
	}
	
	// console.log(matchedTypes);
	interprateData(matchedTypes, fileContent, deliverData);
}

