"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStringSync = exports.Parser = void 0;
var Parser = require("./lib/parser");
exports.Parser = Parser;
function parseStringSync(xml, options) {
    var parser = new Parser(options);
    parser.feed(xml);
    return parser.finish();
}
exports.parseStringSync = parseStringSync;
