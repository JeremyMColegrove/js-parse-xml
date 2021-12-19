"use strict";
var tokenizer_1 = require("./tokenizer");
var types_1 = require("./types");
var Logger = require("./logger");
var SimpleBuilder = require("./simple_builder");
var Parser = /** @class */ (function () {
    function Parser(options) {
        this._tokenizer = new tokenizer_1.Tokenizer();
        this._logger = new Logger();
        // this._simplifier = new Simplifier()
        this._options = Object.assign({}, types_1.defaultOptions, options);
        // the simple or full builder type
        this._builder = new SimpleBuilder(options);
        // making sure same number of start and end tags
        this._tag_balance = 0;
    }
    Parser.prototype.finish = function () {
        // // not enough end tags
        if (this._tag_balance > 0) {
            this._logger.error("Unexepcted end of input", this._options.strict);
        }
        return this._builder.build();
    };
    Parser.prototype.feed = function (xml) {
        // prime our token stream
        this._tokenizer.init(xml);
        var token;
        while ((token = this._tokenizer.getNextToken())) {
            switch (token.type) {
                case "StartTagLiteral":
                    this.handleStartTagToken(token);
                    break;
                case "SelfClosingLiteral":
                    this.handleSelfClosingToken(token);
                    break;
                case "ContentLiteral":
                    this.handleContentToken(token);
                    break;
                case "EndTagLiteral":
                    this.handleEndTagToken(token);
                    break;
                case "CDATALiteral":
                    this.handleCDATAToken(token);
                    break;
                case "ParamTagLiteral":
                    this.handleParamToken(token);
                    break;
                case "CommentLiteral":
                    this.handleCommentToken(token);
                    break;
                default:
                    this._logger.error("Could not process unknown token '".concat(token.type, "'. Try upgrading js-parse-xml to latest version?"), this._options.strict);
            }
        }
    };
    Parser.prototype.handleStartTagToken = function (token) {
        this._tag_balance++;
        this._builder.handleStartTagToken(token);
    };
    Parser.prototype.handleSelfClosingToken = function (token) {
        //handle the tag name and then pass to both StartToken and EndToken
        this._builder.handleSelfClosingToken(token);
    };
    Parser.prototype.handleEndTagToken = function (token) {
        this._tag_balance--;
        this._builder.handleEndTagToken(token);
    };
    Parser.prototype.handleContentToken = function (token) {
        this._builder.handleContentToken(token);
    };
    Parser.prototype.handleCDATAToken = function (token) {
        this._builder.handleCDATAToken(token);
    };
    Parser.prototype.handleParamToken = function (token) {
        this._builder.handleParamToken(token);
    };
    Parser.prototype.handleCommentToken = function (token) {
        this._builder.handleCommentToken(token);
    };
    return Parser;
}());
module.exports = Parser;
module.exports = Parser;
