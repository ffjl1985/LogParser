var XRegExp = require('xregexp').XRegExp;
var util = require("util");

//primitives
var domainNameRegex = "([\\\d\\w\\-\\_]+\\.)+([\\\d\\w\\-\\_]+)?";
var ipv4Regex = "([0-9]{1,3}\\.){3}[0-9]{1,3}";
var ipv6Regex = "([A-Fa-f0-9]{1,4}:{1,2}){2,8}([A-Fa-f0-9]{1,4})?";

var dash = "\\-";
var name = "[A-Za-z0-9\\-\\_\\@\\\\\]+";
var request = '\\".*\\"';
var number = "[0-9]+";
var word = "[A-Za-z]+";
var processPid = "[a-zA-Z0-9\\\\\/\\(\\)\\_\\-]+\\[[0-9]+\\]";
var processName = "[A-Za-z0-9\\.\\_\\-]+";
var productName = "[A-Za-z0-9\\:\\.\\(\\)\\s]+";
var wordWithSpaces = "[A-Za-z0-9\\s\\-\\_\\.]+";
var timestamp = "(\\s[\\+\\-][0-9]{4})?"
var timestampConcat = "[0-9]{6}";
var time = "[0-9]{1,2}\\:[0-9]{1,2}\\:[0-9]{1,2}";

// 2014/08/12 09:16:51
var someDate = "[0-9]{4}\\/[0-9]{2}\\/[0-9]{2}\\s[0-9]{2}:[0-9]{2}:[0-9]{2}"

// 07/Mar/2004:16:05:49 -0800
var standardDate = "[0-3][0-9]\\/[ABDFIJMNOS][a-z]{2,3}\\/[0-9]{4}\\:[0-2][0-9]\\:[0-5][0-9]\\:[0-5][0-9](\\s[-+][0-9]{4})?"

// Sun Mar 7 16:02:00 2004
var errorDate = "[MTTWFSS][a-z]{2}\\s[ABDFIJMNOS][a-z]{2,3}\\s\\s?[0-9][0-9]?\\s([0-9][0-9]\\:?){3}\\s([0-9]{4})";

// Aug 18 16:19:27
var linuxDate = "[ABDFIJMNOS][a-z]{2,3}\\s{1,2}[0-9]{1,2}\\s[0-9]{2}\\:[0-9]{2}\\:[0-9]{2}";

// 2005-07-01-14.08.15.304000-420
var db2DiagDate = "[0-9]{4}\\-[0-9]{2}\\-[0-9]{2}\\-[0-9]{2}\\.[0-9]{2}\\.[0-9]{2}.[0-9]+[+-][0-9]+";

// Sep 26, 2005 7:27:24 PM MDT
var webLogicdate = "[ABDFIJMNOS][a-z]{2,3}\\s{1,2}[0-9]{1,2}\\,\\s[0-9]{4}\\s[0-9]{1,2}\\:[0-9]{2}\\:[0-9]{2}\\s[A-Z]+\\s[A-Z]+";

//2005-07-01 13:04:55.187000000
var websphereDate = "[0-9]{4}\\-[0-9]{2}\\-[0-9]{2}\\s[0-9]{2}\\:[0-9]{2}\\:[0-9]{2}\\.[0-9]+"

// 2005-08-19 09:02:43
var eximDate = "[0-9]{4}\\-[0-9]{2}\\-[0-9]{2}\\s[0-9]{2}\\:[0-9]{2}\\:[0-9]{2}";

 // 03/20/01
var iisDate = "[0-9]{2}\\/[0-9]{2}\\/[0-9]{2}";




//general types
var nameOrDash = util.format("((%s) | (%s))", dash, name);

var requestOrDash = util.format("((%s)|(%s))", request, "\\-");

var numberOrDash = util.format("(%s)|(%s)", number, "\\-");

var hostRegex = util.format("((%s) | (%s) | (%s))", domainNameRegex, ipv4Regex, ipv6Regex);

var dateRegex_string = util.format("(^%s) | (^%s) | (^%s) | (^%s) | (^%s) | (^%s) | (^%s) | (^%s) | (^%s) | (^%s) | (^%s)", standardDate, errorDate + timestamp, linuxDate + timestamp, db2DiagDate + timestamp, webLogicdate + timestamp, websphereDate + timestamp, webLogicdate + timestamp, websphereDate + timestamp, eximDate + timestamp, iisDate + timestamp, someDate + timestamp);

var dateRegex = XRegExp(dateRegex_string, 'x');
var standardDateRegex = XRegExp(standardDate, 'x');



//string regex for main types
var access_log_string =  util.format(
					  "(?<remote_host>        %s )     \\s \
					   (?<visitor_identity>   %s )     \\s \
					   (?<username>           %s )     \\s \
					   \\[ (?<date>           %s ) \\] \\s \
					   (?<request>                         \
					   			((\"                       \
					   			 (?<request_method> [A-Z]+) \\s      \
					   			 (?<request_source> [^\\s].+   ) \\s \
					   			 (?<request_protocol> [A-Z]+) \\\/   \
					   			 (?<request_protocol_version> [0-9\\.]+)      \
					   			 \"                         \
								) | (%s))                   \
					   ) \\s                                \
					   ((?<status_code>        %s )     \\s)? \
					   ((?<total_number_bytes> %s )     \\s?)? \
					   ", ".*", nameOrDash, nameOrDash,standardDate, request, numberOrDash, numberOrDash);

var access_combined_string = access_log_string + util.format(
					  " ((?<referer>            ((%s)|(\\-)) )     \\s)? \
					    (?<request_header>     ((%s)|(\\-))  )     \\s?", request, request);

var combined_wcookie_string = access_combined_string + util.format(
					  "(?<cookie>             ((%s)|(\\-))  )     \\s?", request);


var error_log_string = util.format(
					  "(\\<%s\\> %s \\[%s\\] \\: \\s)?                 \
					   (\\[? (?<date>                %s)  \\]?  \\s)?    \
					   (\\[ (?<error_severity>      %s)  \\]  \\s)?    \
					   (\\[client\\s (?<client_ip>  %s)  \\]  \\s)?    \
					   (?<mesage> .*) \\s?", number, word, number, dateRegex_string, name, hostRegex);

var linux_secure_string = util.format(
					   "(?<date>               %s )     \\s   \
					   ((?<hostname>           %s )     \\s)? \
					   ((?<process>            %s ) \\: \\s)? \
					   (?<error_message> .*)", linuxDate + timestamp, name, processPid);

var db2_diag_string = util.format(
				      "(?<date> %s ) \\s{1,2} \
				       ((?<record_id> %s) \\s{1,2})? \
				       (LEVEL\\s{0,2}:\\s (?<diagnostic_level> %s) \\s{1,2})? \
				       (PID\\s{0,2}:\\s (?<process_id> %s) \\s{1,2})? \
				       (TID\\s{0,2}:\\s (?<thread_id> %s) \\s{1,2})? \
				       (PROC\\s{0,2}:\\s (?<process_name> %s) \\s{1,2})? \
				       (INSTANCE\\s{0,2}:\\s (?<instance_name> %s) \\s{1,2})? \
				       (NODE\\s{0,2}:\\s (?<database_partition> %s) \\s{1,2})? \
				       (DB\\s{0,2}:\\s (?<database_name> %s) \\s{1,2})? \
				       (APPHDL\\s{0,2}:\\s (?<application_handle> %s) \\s{1,2})? \
				       (APPID\\s{0,2}:\\s (?<application_id> %s) \\s{1,2})? \
				       (AUTHID\\s{0,2}:\\s (?<authorization_identifier> %s) \\s{1,2})? \
				       (EDUID\\s{0,2}:\\s (?<unit_engine_identifier> %s) \\s{1,2})? \
				       (EDUNAME\\s{0,2}:\\s (?<unit_engine_name> %s) \\s{1,2})? \
				       ((?<product_name> [A-Za-z0-9:.()\\s]+) \\s{1,2})? \
				       ((?<info_returned> .*) \\s?)?", db2DiagDate + timestamp, name, name, number, number, processName, name, number, name, name, processName, name, name, name, productName);
 


var postfixsyslog_string = util.format(
					  "(?<date>               %s)      \\s   \
					   ((?<server_name>       %s)      \\s)? \
					   ((?<process>           %s)  \\: \\s)? \
					   ((?<event_description> .*)      \\s?)?", linuxDate + timestamp, name, processPid );


var linux_message_sys_log_string =  util.format(
				      "(\\<(?<pri>        %s ) \\>  \\s)?  \
					   (?<date>           %s )      \\s    \
					   ((?<host_name>     %s )      \\s)?  \
					   ((?<process_name>  %s ) \\:  \\s)?  \
					   (?<content_field> .*  )      \\s?", number, linuxDate + timestamp, name, processPid);


var sendmail_syslog_string = util.format(
			          "(?<date>              %s      )         \\s   \
				       ((?<host_name>        %s      )         \\s)? \
				       (sendmail\\[ (?<pid>  %s      ) \\] \\: \\s)? \
				       ((?<qid>              %s      ) \\:     \\s)? \
				       ((?<equates> .*) \\s?)?",linuxDate + timestamp, domainNameRegex, number, name)
        
                                                

var weblogic_stdout_string = util.format(
		             "\\#\\#\\#\\#\\< (?<date> %s) \\> \\s \
		              (?<atributes> .*)", webLogicdate + timestamp);



var websphere_activity_string = util.format(
		    "\\-+ \\s+  ((ComponentId\\:\\s    ((?<component_id>    %s) \\s                    )?)?  \
			           (ProcessId\\:\\s      ((?<process_id>      %s) \\s                    )?)?  \
			           (ThreadId\\:\\s       ((?<thread_id>       %s) \\s                    )?)?  \
			           (ThreadName\\:\\s     ((?<thread_name>     %s) \\s                    )?)?  \
			           (Alarm\\s\\:\\s       ((?<alarm>           %s) \\s                    )?)?  \
			           (SourceId\\:\\s       ((?<source_id>       %s) \\s                    )?)?  \
			           (ClassName\\:\\s      ((?<class_name>      %s) \\s                    )?)?  \
			           (MethodName\\:\\s     ((?<method_name>     %s) \\s                    )?)?  \
			           (Manufacturer\\:\\s   ((?<manufacturer>    %s) \\s                    )?)?  \
			           (Product\\:\\s        ((?<product_name>    %s) \\s                    )?)?  \
			           (Version\\:\\s        ((?<version> [a-zA-Z0-9\\[\\]\_\\-\\s\\.]*) \\s )?)?  \
			           (ServerName\\:\\s     ((?<server_name>     %s) \\s                    )?)?  \
			           (TimeStamp\\:\\s      ((?<date>      %s) \\s                    )?)?  \
			           (UnitOfWork\\:\\s     ((?<unit_of_work>    %s) \\s                    )?)?  \
			           (Severity\\:\\s       ((?<severity>        %s) \\s                    )?)?  \
			           (Category\\:\\s       ((?<category>        %s) \\s                    )?)?  \
			           (PrimaryMessage\\:\\s ((?<primary_message> %s) \\s                    )?)?  \
			           (CHFW0020I\\:\\s      ((?<chf>             .*) \\s                    )?)?  \
			           (ExtendedMessage\\:\\s((?<extended_message>%s) \\s                    )?)?)?  \
			           \\-+ \\s?", wordWithSpaces, number, name,  wordWithSpaces, number, wordWithSpaces, name, name, name, name, name, websphereDate + timestamp, name, number, name, name, name); 

var exim_main_string = util.format(
					 "(?<date> %s) \\s \
				      (?<message_id> %s) \\s \
				      (?<additional_info> .*) \\s?", eximDate + timestamp, name);


var exim_reject = util.format(
					 "(?<date> %s) \\s \
					  (?<message_id> %s) \\s \
					  (?<error_message> .*)", eximDate + timestamp, name);



var mysqld_string = util.format(
					 "((?<date> %s) \\s)?   \
					  (?<id> %s)        \\s   \
					  (?<command_arguments> ((?<command>  %s) \\s (?<argument> %s) \\,? \\s?)+) \
					  (?<rest> .*)", timestampConcat, number, name, name); 
var ttc_string = util.format(
	"(?<mseconds_elapsed> %s)      \\s \
	 \\[ (?<thread_name>  %s)  \\] \\s \
	 ((?<event_priority>  %s)      \\s)? \
	 ((?<category>         %s)      \\s )?\
	 ((?<nested_diagnostic_context> [A-Za-z0-9\\.]+ ) \\s \\- \\s)? \
	 (?<message> .*) \\s?", number, name, number,  name, name, name);


function getAllMatches(regex, string, callback) {
	var matches = [];
	do {
		var tmp = regex.exec(string);
		if (tmp) {
			matches.push(tmp[0]);
		}
	} while (tmp)
    callback(matches);
}



var w3c_extended_string = util.format(
	"(?<date> ((%s) | \\-)) \\, \\s \
	(?<time> ((%s) | \\-)) \\, \\s \
	(?<client_ip> ((%s) | \\-)) \\, \\s \
	(?<username> ((%s) | \\-)) \\, \\s \
	((?<srvice_name> ((%s) | \\-)) \\, \\s)? \
	((?<server_name> ((%s) | \\-)) \\, \\s)? \
	(?<server_ip> ((%s) | \\-)) \\, \\s \
	(?<server_port> ((%s) | \\-)) \\, \\s \
	(?<method> (([a-zA-Z0-9\\.\\/]+) | \\-)) \\, \\s \
	(?<uri_stem> ((%s) | \\-)) \\, \\s \
	(?<uri_query> ((%s) | \\-)) \\, \\s \
	(?<http_status> ((%s) | \\-)) \\, \\s \
	((?<win32_status> ((%s) | \\-)) \\, \\s)? \
	((?<bytes_sent> ((%s) | \\-)) \\, \\s)? \
	((?<bytes_received> ((%s) | \\-)) \\, \\s)? \
	((?<time_taken> ((%s) | \\-)) \\, \\s)? \
	((?<protocol_version> ((%s) | \\-)) \\, \\s)? \
	((?<host> ((%s) | \\-)) \\, \\s)? \
	(?<user_agent> ((%s) | \\-)) \\, \\s \
	((?<cookie> ((%s) | \\-)) \\, \\s)? \
	((?<referer> ((%s) | \\-)) \\, \\s)? \
	(?<protocol_substatus> ((%s) | \\-)) \\, \\s", iisDate, time, hostRegex, name, name, name, hostRegex, number, domainNameRegex, ".*", number, number, number, number, number, name, name, name, ".*", ".*", number );

// 192.168.114.201, -, 03/20/01, 7:55:20, W3SVC2, SERVER, 172.21.13.45, 4502, 163, 3223, 200, 0, GET, /DeptLogo.gif, -,
var iis_string = util.format(
	"(?<client_ip> ((%s)|\\-)) \\, \\s \
	 (?<username>  ((%s)|\\-)) \\, \\s \
	 (?<date>      ((%s)|\\-)) \\, \\s \
	 (?<date>      ((%s)|\\-)) \\, \\s \
	 (?<service_instance> ((%s)|\\-)) \\, \\s \
	 (?<server_name>     ((%s)|\\-)) \\, \\s \
	 (?<server_ip>       ((%s)|\\-)) \\, \\s \
	 (?<time_taken>      ((%s)|\\-)) \\, \\s \
	 (?<client_bytes_sent> ((%s)|\\-)) \\, \\s \
	 (?<server_bytes_sent> ((%s)|\\-)) \\, \\s \
	 (?<service_status_code>       ((%s)|\\-)) \\, \\s \
	 (?<windows_status_code>       ((%s)|\\-)) \\, \\s \
	 (?<request_type>              ((%s)|\\-)) \\, \\s \
	 (?<target_of_operation>       (([a-zA-Z0-9\\.\\/]+)|\\-)) \\, \\s \
	 (?<parameters>                .*)        \\,? \\s?", hostRegex, name, iisDate, time, name, name, hostRegex, number, number, number, number, number, name, name)

// regex for main types
var access_log = XRegExp(access_log_string, 'x');

var combined_log = XRegExp(access_combined_string, 'x');

var combined_wcookie_log = XRegExp(combined_wcookie_string, 'x');

var error_log = XRegExp(error_log_string, 'x');

var linux_secure = XRegExp(linux_secure_string, 'x');

var db2_diag = XRegExp(db2_diag_string, 'x');

var postfixsyslog = XRegExp(postfixsyslog_string, 'x');

var linux_message_sys_log = XRegExp(linux_message_sys_log_string, 'x');

var sendmail_syslog = XRegExp(sendmail_syslog_string, 'x');

var weblogic_stdout = XRegExp(weblogic_stdout_string, 'x');

var websphere_activity = XRegExp(websphere_activity_string, 'x');

var exim_main = XRegExp(exim_main_string, 'x');

var exim_reject = XRegExp(exim_reject, 'x');

var mysqld = XRegExp(mysqld_string, 'x');

var ttc = XRegExp(ttc_string, 'x');

var linux_bootlog = XRegExp("(?<action> .*) \\[ \\s (?<status> [a-zA-Z0-9]+) \\s \\] .*?", 'x');

var iis = XRegExp(iis_string, 'x');

var w3c_extended = XRegExp(w3c_extended_string, 'x');


var linux_audit = function (string) {
	var regex = /[^\s\=]+=[^\s\=]+/g;
	var extractRegex = XRegExp("(?<key> .*) \\= (?<value> .*)", 'x');
	var json = {};
	getAllMatches(regex, string, function (matches) {
		matches.forEach(function (value) {
			var object = XRegExp.exec(value, extractRegex);
			if (object.key && object.value) {
				json[object.key] = object.value;
			}
		})
	})
	return json;
}

// var access_combined_tests = ["64.242.88.10 - - [07/Mar/2004:16:05:49 -0800] \"GET /twiki/bin/edit/Main/Double_bounce_sender?topicparent=Main.ConfigurationVariables HTTP/1.1\" 401 12846 \"ana\" \"are\""];

// var tests = access_combined_tests;
// var regex = combined_log;	

// for (var i = 0; i < tests.length; i++) {
// 	var tmp = XRegExp.exec(tests[i], regex);
// 	console.log("neew one\n");
// 	console.log(tmp);
// 	console.log("\n\n");
// }			



// array of regular expressions
var patterns = [{
	type: "access_log",
	regex: access_log
}, {
	type: "combined_log",
	regex: combined_log
}, {
	type: "combined_wcookie_log",
	regex: combined_wcookie_log
}, {
	type: "error_log",
	regex: error_log
}, {
	type: "linux_secure",
	regex: linux_secure
}, {
	type: "db2_diag",
	regex: db2_diag
}, {
	type: "postfixsyslog",
	regex: postfixsyslog
}, {
	type: "linux_message_sys_log",
	regex: linux_message_sys_log
}, {
	type: "sendmail_syslog",
	regex: sendmail_syslog 
}, {
	type: "weblogic_stdout",
	regex: weblogic_stdout
}, {
	type: "websphere_activity",
	regex: websphere_activity
}, {
	type: "exim_main",
	regex: exim_main
}, {
	type: "exim_reject",
	regex: exim_reject
}, {
	type: "mysqld", 
	regex: mysqld
}, {
	type: "ttc",
	regex: ttc
}, {
	type: "linux_audit",
	regex: linux_audit
}, {
	type: "linux_bootlog", 
	regex: linux_bootlog
}, {
	type: "iis",
	regex: iis
}, {
	type: "w3c_exteded",
	regex: w3c_extended
}];


var associative_patterns = { 
	"access_log" : access_log,
	"combined_log" : combined_log,
	"combined_wcookie_log" : combined_wcookie_log,
	"error_log" : error_log,
	"linux_secure" : linux_secure,
	"db2_diag" : db2_diag,
	"postfixsyslog" : postfixsyslog,
	"linux_message_sys_log" : linux_message_sys_log,
	"sendmail_syslog" : sendmail_syslog,
	"weblogic_stdout" : weblogic_stdout,
	"websphere_activity" : websphere_activity,
	"exim_main" : exim_main,
	"exim_reject" : exim_reject,
	"mysqld" : mysqld,
	"ttc" : ttc,
	"linux_audit": linux_audit,
	"linux_bootlog": linux_bootlog,
	"iis": iis
}

//export
module.exports.patterns = patterns;
module.exports.associative_patterns = associative_patterns;
module.exports.dateRegex = dateRegex;



