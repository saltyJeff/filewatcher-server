"use strict";
exports.__esModule = true;
var path = require("path");
var diff = require("diff");
var FileHandler = (function () {
    function FileHandler(filePaths, diffModes, onFileChange) {
        this.watchModes = Object.create(null);
        for (var _i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
            var file = filePaths_1[_i];
            var ext = path.extname(file);
            var watchMode = diffModes[ext];
            switch (watchMode) {
                case 'word':
                case 'sentence':
                case 'line':
                case 'json':
                    break;
                default:
                    if (ext == 'json') {
                        watchMode = 'json';
                    }
                    else {
                        watchMode = 'word'; //default watch mode
                    }
            }
            this.watchModes[path.basename(file)] = watchMode;
        }
        this.onFileChange = onFileChange;
    }
    FileHandler.prototype.runDiff = function (fileName, oldText, newText) {
        var _this = this;
        switch (this.watchModes[fileName]) {
            case 'word':
                diff.diffWordsWithSpace(oldText, newText, function (err, changes) {
                    _this.onFileChange(fileName, changes);
                });
                break;
            case 'sentence':
                diff.diffSentences(oldText, newText, function (err, changes) {
                    _this.onFileChange(fileName, changes);
                });
                break;
            case 'line':
                diff.diffLines(oldText, newText, function (err, changes) {
                    _this.onFileChange(fileName, changes);
                });
                break;
            case 'json':
                diff.diffJson(JSON.parse(oldText), JSON.parse(newText), function (err, changes) {
                    _this.onFileChange(fileName, changes);
                });
            default:
                throw new Error("Couldn't find a diff mode when checking diff");
        }
    };
    return FileHandler;
}());
exports.FileHandler = FileHandler;
//# sourceMappingURL=FileHandler.js.map