"use strict";
var Simplifier = /** @class */ (function () {
    function Simplifier() {
    }
    Simplifier.prototype.simplify = function (root) {
        var result;
        result = {};
        result[root.name] = root.content ? root.content : {};
        this.helper(root, result[root.name]);
        return result;
    };
    Simplifier.prototype.helper = function (node, result) {
        // check if result is soemthing other than an object
        if (!(typeof result === 'object'))
            return result;
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var append = child.content ? child.content : {};
            if (result[child.name] && Array.isArray(result[child.name])) {
                result[child.name].push(append);
            }
            else if (result[child.name]) {
                result[child.name] = [result[child.name]];
                result[child.name].push(append);
            }
            else {
                result[child.name] = append;
            }
            this.helper(child, append);
        }
        return result;
    };
    return Simplifier;
}());
module.exports = Simplifier;
