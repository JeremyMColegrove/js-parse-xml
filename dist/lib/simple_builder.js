"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Builder = require("./abstracts/builder");
var SimpleBuilder = /** @class */ (function (_super) {
    __extends(SimpleBuilder, _super);
    function SimpleBuilder(options) {
        var _this = _super.call(this, options) || this;
        _this._finished = false;
        return _this;
    }
    SimpleBuilder.prototype.build = function () {
        if (this._branch) {
            delete this._branch["@name"];
            delete this._branch["@attributes"];
            delete this._branch["@parent"];
            delete this._branch["@root"];
        }
        return this._branch;
    };
    SimpleBuilder.prototype.handleStartTagToken = function (token) {
        var name;
        var node;
        if (this._finished) {
            this._logger.error("There must be a root element", this._options.strict);
        }
        name = this.stripTag(token);
        node = {
            "@name": name,
            "@attributes": this.parseAttributes(token),
            "@parent": this._branch
        };
        //@ts-ignore (gives error about undefined value)
        node[name] = {};
        // copy all of the local data into the global data
        this._attributes = Object.assign({}, this._attributes, node['@attributes']);
        if (!this._branch) {
            node["@parent"] = node;
            node["@root"] = true;
            this._branch = node;
            return;
        }
        var value = this._branch["@name"];
        var child = node["@name"];
        if (this._branch[value][child] && !Array.isArray(this._branch[value][child])) {
            this._branch[value][child] = [this._branch[value][child]];
        }
        if (Array.isArray(this._branch[value][child])) {
            this._branch[value][child].push(node[child]);
        }
        else {
            // this is an invalid xml syntax case, where content comes before a pair of tags (tags overwrites content)
            if (typeof this._branch[value] !== "object") {
                this._branch[value] = {};
            }
            this._branch[value][child] = node[child];
        }
        this._branch = node;
    };
    SimpleBuilder.prototype.handleEndTagToken = function (token) {
        if (this.stripTag(token) != this._branch["@name"]) {
            this._logger.error("Found mismatched start/end tag <".concat(this._branch["@name"], "> ").concat(token.value), this._options.strict);
        }
        if (this._branch["@root"])
            this._finished = true;
        this._branch = this._branch["@parent"];
        this._attributes = this._branch["@attributes"];
    };
    SimpleBuilder.prototype.handleSelfClosingToken = function (token) {
        this.handleStartTagToken(token);
        this.handleEndTagToken(token);
    };
    SimpleBuilder.prototype.handleContentToken = function (token) {
        // remove whitespaces, etc
        var content = this.processContent(token.value);
        var value = this._branch["@parent"]["@name"];
        var child = this._branch["@name"];
        // if the child is an array
        // console.log(this._branch["@parent"][value])
        if (Array.isArray(this._branch["@parent"][value][child])) {
            var length_1 = this._branch["@parent"][value][child].length;
            this._branch["@parent"][value][child][length_1 - 1] = content;
        }
        else {
            //check if circular root obj
            if (this._branch["@root"]) {
                this._branch[child] = content;
            }
            else {
                // check if the second to last item is an object (content can not come after a node)
                this._branch["@parent"][value][child] = content;
            }
        }
    };
    SimpleBuilder.prototype.handleCDATAToken = function (token) {
        token.value = token.value.substring(9, token.value.length - 3);
        this.handleContentToken(token);
    };
    SimpleBuilder.prototype.handleCommentToken = function (token) {
        // just a comment, do nothing
        var comment = token.value.slice(4, token.value.length - 3);
        if (comment.indexOf("--") > -1) {
            this._logger.error("Invalid syntax '--'found in comment ".concat(token.value), this._options.strict);
        }
    };
    SimpleBuilder.prototype.handleParamToken = function (token) {
        if (this._branch) {
            this._logger.error("Invalid parameter tag position", this._options.strict);
        }
        // check that <? ends with ?> 
        if (token.value[1] == "?" && token.value[1] != token.value[token.value.length - 2]) {
            this._logger.error("Invalid parameter tag '".concat(token.value, "'"), this._options.strict);
        }
    };
    return SimpleBuilder;
}(Builder));
module.exports = SimpleBuilder;
