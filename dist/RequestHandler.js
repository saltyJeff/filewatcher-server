"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var MemoryCached_1 = require("./filehandlers/MemoryCached");
var FileWatcher_1 = require("./filehandlers/FileWatcher");
function requestHandlerCreator(conf) {
    //get all files from directory
    var fileListeners = Object.create(null);
    var dir = path.resolve(__dirname, conf.watchDir);
    var dirContent = fs.readdirSync(dir);
    var watchedFiles = [];
    for (var _i = 0, dirContent_1 = dirContent; _i < dirContent_1.length; _i++) {
        var file = dirContent_1[_i];
        var filePath = path.resolve(dir, file);
        var stats = fs.statSync(filePath);
        if (stats.isFile()) {
            fileListeners[file] = [];
            watchedFiles.push(filePath);
        }
    }
    //handler
    var handler;
    var onFileChange = function (fileName, changes) {
        for (var _i = 0, _a = fileListeners[fileName]; _i < _a.length; _i++) {
            var res = _a[_i];
            makeSSE(res, 'change', undefined, JSON.stringify(changes));
        }
        console.log(fileName + " modified " + Date.now().toLocaleString());
    };
    switch (conf.watchMode) {
        case 'memory':
            handler = new MemoryCached_1.MemoryCachedHandler(watchedFiles, conf.diffModes, onFileChange);
            break;
        case 'watch':
            handler = new FileWatcher_1.FileWatcher(watchedFiles, conf.diffModes, onFileChange);
            break;
        default:
            handler = new MemoryCached_1.MemoryCachedHandler(watchedFiles, conf.diffModes, onFileChange);
            break;
    }
    process.on('exit', function () {
        console.log('writing files to disk before exit');
        for (var _i = 0, watchedFiles_1 = watchedFiles; _i < watchedFiles_1.length; _i++) {
            var filePath = watchedFiles_1[_i];
            var fileName = path.basename(filePath);
            fs.writeFileSync(filePath, handler.getInitial(fileName));
        }
    });
    return function (req, res) {
        var resource = req.url.substring(1);
        var listeners = fileListeners[resource];
        if (!listeners) {
            res.statusCode = 400;
            res.setHeader('Content-type', 'text/plain');
            res.end("404: Requested File " + resource + " not found.\n");
        }
        else {
            res.statusCode = 200;
            if (req.method == 'POST') {
                res.setHeader('Content-Type', 'text/plain');
                if (conf.watchMode == 'watch') {
                    res.end('The watch mode has been set to "watch", make a change to the file to mutate it');
                }
                var segments_1 = [];
                req.on('data', function (data) {
                    segments_1.push(data);
                });
                req.on('end', function () {
                    var str = Buffer.concat(segments_1).toString();
                    handler.changeFile(resource, str);
                    res.end('write succesful');
                });
            }
            else if (req.method == 'GET') {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                res.write("\n");
                listeners.push(res);
                makeSSE(res, 'initial', undefined, handler.getInitial(resource));
            }
        }
    };
}
exports.requestHandlerCreator = requestHandlerCreator;
function makeSSE(res, evtName, id, data) {
    res.write("event: " + evtName + " \n");
    if (id) {
        res.write("id: " + id + " \n");
    }
    res.write("data: " + data + " \n\n");
}
//# sourceMappingURL=RequestHandler.js.map