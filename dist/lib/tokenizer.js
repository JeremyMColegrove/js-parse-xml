"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
var types_1 = require("./types");
var Tokenizer = /** @class */ (function () {
    function Tokenizer() {
        this._string = "",
            this._line = 1;
        this._buffer = "";
        this._cursor = 0;
        // flags to make this parser streamer friendly
        this._in_tag = false;
    }
    // primes our tokenizer, resets cursor etc
    Tokenizer.prototype.init = function (string) {
        this._string = string;
        this._cursor = 0;
    };
    Tokenizer.prototype.getNextToken = function () {
        if (this._cursor < 0)
            return null;
        // if we are not currently parsing a tag, treat as content and look for next tag
        if (!this._in_tag) {
            var next = this._string.indexOf("<", this._cursor);
            if (next > -1) {
                this._in_tag = true;
                this._buffer += this._string.slice(this._cursor, next);
                this._cursor = next;
                if (this._buffer.trim())
                    return this.ContentLiteral();
                // clear the buffer for this new tag
                this._buffer = "";
            }
            else {
                this._buffer += this._string.slice(this._cursor);
                this._cursor = -1;
            }
        }
        // keep looking for an end tag until some condition is satisfied 
        // e.i <![CDATA[<xml>]]> it will find one in the CDATA, but does not satisfy cdata condition so continues
        while (this._cursor > -1) {
            var end = this._string.indexOf(">", this._cursor);
            if (end > -1)
                end++;
            this._buffer += this._string.slice(this._cursor, end);
            this._cursor = end;
            /**
             * check end tag was found
             * if so, check what is in the buffer
             */
            if (end > -1) {
                if (this.isCommentTag(this._buffer)) {
                    if (this._buffer.indexOf("-->") == this._buffer.length - 3) {
                        return this.CommentLiteral();
                    }
                }
                else if (this.isCdataTag(this._buffer)) {
                    this._in_tag = false;
                    if (this._buffer.indexOf("]]>") == this._buffer.length - 3) {
                        return this.CDATALiteral();
                    }
                }
                else if (this.isEndTag(this._buffer)) {
                    return this.EndTagLiteral();
                }
                else if (this.isSelfClosing(this._buffer)) {
                    return this.SelfClosingLiteral();
                }
                else if (this.isParamTag(this._buffer)) {
                    return this.ParamTagLiteral();
                }
                else {
                    return this.TagLiteral();
                }
            }
            else {
                // if no end tag was found, add everything to buffer
                this._buffer += this._string.slice(this._cursor);
            }
        }
        // return null (like requesting the next line in the stream)
        return null;
    };
    Tokenizer.prototype.isCommentTag = function (tag) {
        if (tag.indexOf("<!--") > -1)
            return true;
        return false;
    };
    Tokenizer.prototype.isCdataTag = function (tag) {
        if (tag.indexOf("<![CDATA[") > -1)
            return true;
        return false;
    };
    Tokenizer.prototype.isEndTag = function (tag) {
        if (tag.charCodeAt(1) == 47)
            return true;
        return false;
    };
    Tokenizer.prototype.isSelfClosing = function (tag) {
        if (tag.charCodeAt(tag.length - 2) == 47)
            return true;
        return false;
    };
    Tokenizer.prototype.isParamTag = function (tag) {
        var first_letter = tag.charCodeAt(1);
        if (first_letter == 63 || first_letter == 33) {
            return true;
        }
        return false;
    };
    Tokenizer.prototype.ContentLiteral = function () {
        return this.Literal(types_1.tokenTypes.LITERAL_CONTENT);
    };
    Tokenizer.prototype.TagLiteral = function () {
        this._in_tag = false;
        return this.Literal(types_1.tokenTypes.LITERAL_START);
    };
    Tokenizer.prototype.EndTagLiteral = function () {
        this._in_tag = false;
        return this.Literal(types_1.tokenTypes.LITERAL_END);
    };
    Tokenizer.prototype.SelfClosingLiteral = function () {
        this._in_tag = false;
        return this.Literal(types_1.tokenTypes.LITERAL_SELF_CLOSING);
    };
    Tokenizer.prototype.ParamTagLiteral = function () {
        this._in_tag = false;
        return this.Literal(types_1.tokenTypes.LITERAL_PARAM);
    };
    Tokenizer.prototype.CDATALiteral = function () {
        this._in_tag = false;
        return this.Literal(types_1.tokenTypes.LITERAL_CDATA);
    };
    Tokenizer.prototype.CommentLiteral = function () {
        this._in_tag = false;
        return this.Literal(types_1.tokenTypes.LITERAL_COMMENT);
    };
    Tokenizer.prototype.Literal = function (type) {
        var literal;
        literal = {
            type: type,
            value: this._buffer,
            line: this._line
        };
        this._buffer = "";
        return literal;
    };
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
