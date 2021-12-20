"use strict";
var Logger = require("../logger");
var types_1 = require("../types");
var Builder = /** @class */ (function () {
    function Builder(options) {
        this._attributes = {};
        this._logger = new Logger();
        this._options = Object.assign({}, types_1.defaultOptions, options);
    }
    Builder.prototype.build = function () {
        throw new Error("This method is not implemented.");
    };
    Builder.prototype.handleStartTagToken = function (token) {
        throw new Error("This method is not implemented.");
    };
    Builder.prototype.handleEndTagToken = function (token) {
        throw new Error("This method is not implemented.");
    };
    Builder.prototype.handleSelfClosingToken = function (token) {
        throw new Error("This method is not implemented.");
    };
    Builder.prototype.handleCDATAToken = function (token) {
        throw new Error("This method is not implemented.");
    };
    Builder.prototype.handleCommentToken = function (token) {
        throw new Error("This method is not implemented.");
    };
    Builder.prototype.handleContentToken = function (token) {
        throw new Error("This method is not implemented.");
    };
    Builder.prototype.handleParamToken = function (token) {
        throw new Error("This method is not implemented.");
    };
    // string processing helper functions
    Builder.prototype.stripTag = function (token) {
        var tag;
        var regex;
        var match;
        tag = token.value.trim();
        // remove brackets <>
        tag = tag.substring(1, tag.length - 1);
        // remove any attributes
        tag = tag.split(" ")[0];
        // remove end tag symbol </
        if (tag[0] == "/") {
            tag = tag.substring(1);
        }
        // remove self closing symbol />
        if (tag[tag.length - 1] == "/") {
            tag = tag.substring(0, tag.length - 1);
        }
        // check for any bad xml tags 
        regex = new RegExp(/([^.\-A-Za-z0-9_:])|(^[0-9._\-:])/);
        match = regex.test(tag);
        if (match) {
            this._logger.error("Unexpected character found in '".concat(tag, "'"), this._options.strict);
        }
        // remove namespace
        var tag_split = tag.split(":");
        tag = tag_split.pop();
        return tag;
    };
    // takes content and parses it into a number
    Builder.prototype.processContent = function (content) {
        if (Object.prototype.toString.call(content) === "[object String]") {
            // first apply any attributes on the string
            if (this._attributes['xml:space'] && this._attributes['xml:space'] != "default" && this._attributes['xml:space'] != "preserve") {
                this._logger.warning("Found '".concat(this._attributes["xml:space"], "' instead of 'default' or 'preserve'."));
            }
            if (!this._options.preserve_whitespace && this._attributes['xml:space'] !== "preserve")
                content = content.trim();
            // convert decimals and hex strings to numbers
            if (this._options.convert_values) {
                //@ts-ignore
                if (!isNaN(content)) {
                    // test if it is hex
                    if (content.includes("x"))
                        return Number.parseInt(content, 16);
                    else if (content.includes("."))
                        return Number.parseFloat(content);
                    else
                        return Number.parseInt(content);
                }
            }
            return content;
        }
        return content;
    };
    Builder.prototype.parseAttributes = function (token) {
        // take the value of the token and split it into all of the attributes, construct a hashmap
        var tag = token.value;
        var cursor = 0;
        var result = {};
        while (cursor < tag.length) {
            var whitespace = tag.indexOf(" ", cursor);
            if (whitespace > -1) {
                // find the next = sign
                var equals = tag.indexOf("=", whitespace);
                if (equals > -1) {
                    cursor = equals + 1;
                    var key = tag.slice(whitespace + 1, equals);
                    while (cursor < tag.length && tag[cursor] == " ")
                        cursor++;
                    var char = tag[cursor++];
                    if (char != "\"" && char != "\'") {
                        this._logger.error("Invalid attribute found.", this._options.strict);
                    }
                    var next = tag.indexOf(char, cursor);
                    if (next < 0) {
                        this._logger.error("Unexpected end of attribute.", this._options.strict);
                    }
                    else {
                        var value = tag.slice(cursor, next);
                        cursor = next + 1;
                        result[key.trim()] = value.trim();
                    }
                }
                else
                    cursor = tag.length;
            }
            else
                cursor = tag.length;
        }
        return result;
    };
    return Builder;
}());
module.exports = Builder;
