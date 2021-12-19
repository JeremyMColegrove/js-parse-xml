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
var Builder = require("../lib/abstracts/builder");
var LosslessBuilder = /** @class */ (function (_super) {
    __extends(LosslessBuilder, _super);
    function LosslessBuilder(options) {
        var _this = _super.call(this, options) || this;
        _this._branch = null;
        return _this;
    }
    LosslessBuilder.prototype.build = function () {
        return this._branch;
    };
    LosslessBuilder.prototype.handleStartTagToken = function (token) {
        var node;
        var name;
        name = this.stripTag(token);
        node = {
            name: name,
            attributes: {},
            "@parent": this._branch,
            content: null,
            children: []
        };
        if (!this._branch) {
            node["@parent"] = node;
            this._branch = node;
            return;
        }
        this._branch.children.push(node);
        this._branch = node;
    };
    LosslessBuilder.prototype.handleEndTagToken = function (token) {
        if (this.stripTag(token) != this._branch.name) {
            this._logger.error("Found mismatched start/end tag <".concat(this._branch.name, "> ").concat(token.value), this._options.strict);
        }
        var parent = this._branch["@parent"];
        delete this._branch["@parent"];
        this._branch = parent;
    };
    LosslessBuilder.prototype.handleSelfClosingToken = function (token) {
        this.handleStartTagToken(token);
        this.handleEndTagToken(token);
    };
    LosslessBuilder.prototype.handleContentToken = function (token) {
        this._branch.content = this.processContent(token.value);
    };
    LosslessBuilder.prototype.handleCDATAToken = function (token) {
        token.value = token.value.substring(9, token.value.length - 3);
        this.handleContentToken(token);
    };
    LosslessBuilder.prototype.handleCommentToken = function (token) {
        // just a comment, do nothing
    };
    LosslessBuilder.prototype.handleParamToken = function (token) {
        if (this._branch) {
            this._logger.error("Invalid parameter tag position", this._options.strict);
        }
        // check that <? ends with ?> 
        if (token.value[1] == "?" && token.value[1] != token.value[token.value.length - 2]) {
            this._logger.error("Invalid parameter tag '".concat(token.value, "'"), this._options.strict);
        }
    };
    return LosslessBuilder;
}(Builder));
module.exports = LosslessBuilder;
