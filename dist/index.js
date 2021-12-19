"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = exports.parseString = exports.parseFileSync = exports.parseStringSync = exports.Parser = void 0;
var fs = require("fs");
var Parser = require("./lib/parser");
exports.Parser = Parser;
function parseStringSync(xml, options) {
    var parser = new Parser(options);
    parser.feed(xml);
    return parser.finish();
}
exports.parseStringSync = parseStringSync;
function parseFileSync(filename, options) {
    var encoding = "utf-8";
    if (options && options.encoding)
        encoding = options.encoding;
    var xml = fs.readFileSync(filename, encoding);
    var parser = new Parser(options);
    parser.feed(xml);
    return parser.finish();
}
exports.parseFileSync = parseFileSync;
function parseString(xml, options) {
    return new Promise(function (resolve, reject) {
        resolve(parseStringSync(xml, options));
    });
}
exports.parseString = parseString;
function parseFile(filename, options) {
    return new Promise(function (resolve, reject) {
        if (options && options.stream) {
            var encoding = "utf-8";
            if (options.encoding)
                encoding = options.encoding;
            var parser_1 = new Parser(options);
            fs.createReadStream(filename, encoding)
                .on("data", function (chunk) {
                parser_1.feed(chunk.toString());
            })
                .on("end", function () {
                resolve(parser_1.finish());
            });
        }
        else {
            resolve(parseFileSync(filename, options));
        }
    });
}
exports.parseFile = parseFile;
