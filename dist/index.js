"use strict";
/**
 * @remark Hey there
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStringSync = exports.Parser = void 0;
var Parser = require("./lib/parser");
exports.Parser = Parser;
var defaultOptions = {
    encoding: 'utf8',
    stream: false,
    preserve_whitespace: false,
    convert_values: true,
    debug: true,
    benchmark: false
};
function parseStringSync(xml, options) {
    if (options === void 0) { options = defaultOptions; }
    options = Object.assign({}, defaultOptions, options);
    var parser = new Parser(options);
    parser.feed(xml);
    return parser.finish();
}
exports.parseStringSync = parseStringSync;
