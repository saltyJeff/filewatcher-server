"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var FileHandler_1 = require("../FileHandler");
var fs = require("fs");
var path = require("path");
var MemoryCachedHandler = (function (_super) {
    __extends(MemoryCachedHandler, _super);
    function MemoryCachedHandler(filePaths, diffModes, onFileChange) {
        var _this = _super.call(this, filePaths, diffModes, onFileChange) || this;
        _this.fileTexts = Object.create(null);
        for (var _i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
            var filePath = filePaths_1[_i];
            _this.fileTexts[path.basename(filePath)] = fs.readFileSync(filePath, 'utf8');
        }
        return _this;
    }
    MemoryCachedHandler.prototype.getInitial = function (fileName) {
        return this.fileTexts[fileName];
    };
    MemoryCachedHandler.prototype.changeFile = function (fileName, newText) {
        var oldText = this.fileTexts[fileName];
        if (oldText == undefined) {
            throw new Error("File not found inside memory cache!");
        }
        this.runDiff(fileName, oldText, newText);
        this.fileTexts[fileName] = newText;
    };
    return MemoryCachedHandler;
}(FileHandler_1.FileHandler));
exports.MemoryCachedHandler = MemoryCachedHandler;
//# sourceMappingURL=MemoryCached.js.map