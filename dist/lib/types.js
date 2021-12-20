"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenTypes = exports.defaultOptions = void 0;
exports.defaultOptions = {
    encoding: "utf-8",
    stream: false,
    preserve_whitespace: false,
    convert_values: true,
    strict: true
};
exports.tokenTypes = {
    LITERAL_CONTENT: "ContentTagLiteral",
    LITERAL_START: "StartTagLiteral",
    LITERAL_END: "EndTagLiteral",
    LITERAL_SELF_CLOSING: "SelfClosingLiteral",
    LITERAL_PARAM: "ParamTagLiteral",
    LITERAL_CDATA: "CDATALiteral",
    LITERAL_COMMENT: "CommentLiteral"
};
