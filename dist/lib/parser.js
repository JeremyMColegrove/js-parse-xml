"use strict";
var tokenizer_1 = require("./tokenizer");
var Parser = /** @class */ (function () {
    function Parser(options) {
        this._tokenizer = new tokenizer_1.Tokenizer();
        this._branch = null;
        this._root = null;
        this._attributes = {};
        this._options = options;
        // making sure same number of start and end tags
        this._tag_balance = 0;
        if (this._options.benchmark)
            console.time("benchmark");
    }
    Parser.prototype.finish = function () {
        if (!this._branch)
            return null;
        // not enough end tags
        if (this._tag_balance > 0) {
            throw new SyntaxError(this.syntaxErrorMessage("Unexepcted end of input", -1));
        }
        // remove any temporary variables
        delete this._branch["@root"];
        delete this._branch["@name"];
        delete this._branch["@parent"];
        delete this._branch["@attributes"];
        if (this._options.benchmark)
            console.timeEnd("benchmark");
        return this._branch;
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
                    throw new Error(this.syntaxErrorMessage("Could not process unknown token '".concat(token.type, "'"), token.line));
            }
        }
    };
    Parser.prototype.syntaxErrorMessage = function (message, lineNo) {
        return "".concat(message, ": line ").concat(lineNo);
    };
    Parser.prototype.handleStartTagToken = function (token) {
        var name;
        var node;
        this._tag_balance++;
        name = this.stripTag(token);
        node = {
            "@name": name,
            "@attributes": {},
            "@parent": this._branch
        };
        //@ts-ignore (gives error about undefined value)
        node[name] = {};
        // copy all of the local data into the global data
        // this.#attributes = Object.assign({}, node['@attributes'], this.#attributes)
        if (!this._branch) {
            node["@parent"] = node;
            node["@root"] = true;
            this._root = node;
            return this._branch = node;
        }
        if (name == this._root["@name"]) {
            throw new SyntaxError(this.syntaxErrorMessage("Multiple root tags with name '".concat(name, "'"), token.line));
        }
        var value = this._branch["@name"];
        var child = node["@name"];
        if (this._branch[value][child] && !Array.isArray(this._branch[value][child]))
            this._branch[value][child] = [this._branch[value][child]];
        if (Array.isArray(this._branch[value][child])) {
            this._branch[value][child].push(node[child]);
        }
        else {
            this._branch[value][child] = node[child];
        }
        this._branch = node;
    };
    Parser.prototype.handleSelfClosingToken = function (token) {
        //handle the tag name and then pass to both StartToken and EndToken
        this.handleStartTagToken(token);
        this.handleEndTagToken(token);
    };
    Parser.prototype.handleEndTagToken = function (token) {
        this._tag_balance--;
        if (this.stripTag(token) != this._branch["@name"]) {
            throw new SyntaxError(this.syntaxErrorMessage("Found mismatched start/end tag <".concat(this._branch["@name"], "> ").concat(token.value), token.line));
        }
        // navigate out
        this._branch = this._branch["@parent"];
    };
    Parser.prototype.handleContentToken = function (token) {
        // add content
        var content = this.processContent(token.value);
        var value = this._branch["@parent"]["@name"];
        var child = this._branch["@name"];
        // if the child is an array
        if (Array.isArray(this._branch["@parent"][value][child])) {
            this._branch["@parent"][value][child].pop();
            this._branch["@parent"][value][child].push(content);
        }
        else {
            //check if circular root obj
            if (this._branch["@root"]) {
                this._branch[child] = content;
            }
            else {
                this._branch["@parent"][value][child] = content;
            }
        }
    };
    Parser.prototype.handleCDATAToken = function (token) {
        // strip the CDATA tag and pass it as a ContentTokenLiteral
        token.value = token.value.substring(9, token.value.length - 3);
        this.handleContentToken(token);
    };
    Parser.prototype.handleParamToken = function (token) {
        if (this._root) {
            throw new SyntaxError(this.syntaxErrorMessage("Invalid parameter tag position", token.line));
        }
        // check that <? ends with ?> 
        if (token.value[1] == "?" && token.value[1] != token.value[token.value.length - 2]) {
            throw new SyntaxError(this.syntaxErrorMessage("Invalid parameter tag '".concat(token.value, "'"), token.line));
        }
    };
    Parser.prototype.handleCommentToken = function (token) {
        var text = token.value.substring(4, token.value.length - 3);
        // make sure -- is not in comment ( illegal )
        if (text.includes("--")) {
            throw new SyntaxError(this.syntaxErrorMessage("Invalid character sequence '--' in comment", token.line));
        }
    };
    // string processing helper functions
    Parser.prototype.stripTag = function (token) {
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
            throw new SyntaxError(this.syntaxErrorMessage("Unexpected character found in '".concat(tag, "'"), token.line));
        }
        // remove namespace
        var tag_split = tag.split(":");
        tag = tag_split.pop();
        return tag;
    };
    // takes content and parses it into a number
    Parser.prototype.processContent = function (content) {
        if (Object.prototype.toString.call(content) === "[object String]") {
            // first apply any attributes on the string
            if (!this._options.preserve_whitespace && this._attributes['xml:space'] != "preserve")
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
    return Parser;
}());
module.exports = Parser;
module.exports = Parser;
