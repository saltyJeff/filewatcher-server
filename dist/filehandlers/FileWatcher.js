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
var chokidar = require("chokidar");
var FileWatcher = (function (_super) {
    __extends(FileWatcher, _super);
    function FileWatcher(filePaths, diffModes, onFileChange) {
        var _this = _super.call(this, filePaths, diffModes, onFileChange) || this;
        _this.fileTexts = Object.create(null);
        for (var _i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
            var filePath = filePaths_1[_i];
            _this.fileTexts[path.basename(filePath)] = fs.readFileSync(filePath, 'utf8');
        }
        var watcher = chokidar.watch(filePaths);
        var fileTexts = _this.fileTexts;
        //damn closure
        watcher.on('change', function (filePath) {
            (function (daFilePath) {
                fs.readFile(filePath, function (err, data) {
                    var fileName = path.basename(daFilePath);
                    var newText = data.toString();
                    var oldText = _this.fileTexts[fileName];
                    fileTexts[fileName] = newText;
                    console.log(fileTexts);
                    console.log(oldText, newText);
                    _super.prototype.runDiff.call(_this, fileName, oldText, newText); //CLOSURE=PAIN
                });
            })(filePath);
        });
        return _this;
    }
    FileWatcher.prototype.getInitial = function (fileName) {
        console.log('i am da file name and i was called');
        return this.fileTexts[fileName];
    };
    FileWatcher.prototype.changeFile = function (fileName, newText) {
        throw new Error("Automatically watches for file changes, impossible to modify");
    };
    return FileWatcher;
}(FileHandler_1.FileHandler));
exports.FileWatcher = FileWatcher;
//# sourceMappingURL=FileWatcher.js.map