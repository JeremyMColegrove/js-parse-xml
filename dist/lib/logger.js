"use strict";
var LINE_ONLY = "%s\x1b[0m";
var YELLOW = "\x1b[33m%s\x1b[0m";
var RED = "\x1b[31m";
var MAGENTA = "\x1b[35m";
var BLACK = "\x1b[30m";
//Background colors
var BGRED = "\x1b[41m";
var BGYELLOW = "\x1b[43m";
var RESET = "\x1b[0m";
var Logger = /** @class */ (function () {
    function Logger() {
    }
    // print out warnings and errors
    Logger.prototype.warning = function (message) {
        console.warn(BGYELLOW, BLACK, "WARN", RESET, MAGENTA, "js-parse-xml", RESET, message);
    };
    Logger.prototype.error = function (message) {
        console.error(BGRED, BLACK, "ERROR", RESET, MAGENTA, "js-parse-xml", RESET, message);
    };
    return Logger;
}());
module.exports = Logger;
