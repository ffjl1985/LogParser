var fs = require("fs");
var rl = require("readline");

var patterns = require("./patterns.js");
var hash_base = require("./hash_base_handling");

//exports
module.exports.determineCommonPatterns = determineCommonPatterns;

//read file line by line and determine hash code for each
//callback -> function to update known hash codes
function findNewPatterns(hashCodesBase, inputfilename, updateData) {
	var known_type = inputfilename.replace(/[\.A-Za-z\_\-\/]+\//, "");
	var outputfilename = "hash_codes/" + known_type + ".tmp";
	
	var readLine = rl.createInterface({
		input: fs.createReadStream(inputfilename),
		output: fs.createWriteStream(outputfilename),
		terminal: false
	});

	console.log("processing file " + inputfilename);
	readLine.totalNumber = 0;
	readLine.validLines = 0;
	readLine.patterns = 0;
	readLine.output.writeble = true;

	//get reference to old entry with current type
	var entry = {};
	var found = false;

	hashCodesBase.forEach(function (some_entry) {
		if(some_entry.type == known_type) {
			entry = some_entry;
			found = true;
		}
	});

	if (found == false) {
		entry.type = known_type;
		entry.hash = [];
		entry.relevant = [100];
		relevant_characters.forEach(function (value) {
			if (value.type == known_type) {
				entry.relevant = value.relevant;
			}
		});
		hashCodesBase[hashCodesBase.length] = entry;
	}
	

	readLine.on("line", function(line) {
		var original = line;
		try {
			if (line.replace(/\s\t\n/g, "") == "") {
				console.log("empty line nothing to do...");
			} else {
				var obj = patterns.getPattern(line);
				readLine.validLines++;

				var found = entry.hash.some(function(element) {
					return element.hash_code == obj.hash_code;
				});

				if (found == false) {
					entry.hash.push(obj);
					readLine.patterns++;
					console.log("new pattern found for " + known_type);
				} else {
					console.log("pattern found but it's old for me...");
				}
				readLine.output.write(obj.key + "\n");
			}
		} catch (error) {
			console.log(original + "--> ");
			console.log(error.message + "\n");
		}
		readLine.totalNumber++;
	})

	readLine.on("close", function() {
		console.log("\nsome statistics for: " + known_type);
		console.log(" " + readLine.totalNumber + " lines inspected.\n");
		console.log(" " + readLine.validLines + " lines matched some pattern.\n");
		console.log(" " + readLine.patterns + " new patterns found\n");
		updateData(hashCodesBase);
	});
}

//find patterns for all files found in path location
function determineCommonPatterns(path, hashCodesBase) {
	fs.readdir(path, function (error, files) {
		if (error) {
			console.log("found some error...");
			return;
		}
		
		files.forEach(function (file) {
			if (fs.lstatSync(path + file).isFile()) 
				findNewPatterns(hashCodesBase, path + file, hash_base.updateCodesBase);
		});
	});
}

//less than 
var relevant_characters =
	[{
		type: "access_log",
		relevant: [26, 25, 24, 22, 21]
	}, {
		type: "combined_log",
		relevant: [32, 31, 30, 29, 28, 27, 26]
	}, {
		type: "combined_wcookie_log",
		relevant: [36, 35, 34, 33, 32, 31, 30, 29]
	}, {
		type: "db2_diag",
		relevant: [48]
	}, {
		type: "error_log",
		relevant: [19, 17, 14, 11, 9]
	}, {
		type: "exim_main",
		relevant: [17, 16, 15, 14, 12]
	}, {
		type: "exim_reject",
		relevant: [14, 12]
	}, {
		type: "linux_message_sys_log",
		relevant: [14]
	}, {
		type: "linux_secure",
		relevant: [13, 11, 10]
	}, {
		type: "log4j",
		relevant: [17]
	}, {
		type: "mysql_error",
		relevant: [100]
	}, {
		type: "mysqld",
		relevant: [100]
	}, {
		type: "postfixsyslog",
		relevant: [15 , 14]
	}, {
		type: "sendmail_syslog",
		relevant: [20, 18]
	}, {
		type: "sugarcrm_log4php",
		relevant: [100]
	}, {
		type: "weblogic_stdout",
		relevant: [22]
	}, {
		type: "websphere_activity",
		relevant: [41]
	}, {
		type: "websphere_core",
		relevant: [48]
	}, {
		type: "websphere_trlog_syserr",
		relevant: [100]
	}, {
		type: "websphere_trlog_sysout",
		relevant: [100]
	}, {
		type: "windows_snare_syslog",
		relevant: [100]
	}]