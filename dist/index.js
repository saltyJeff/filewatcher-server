#!/usr/bin/env node
"use strict";
exports.__esModule = true;
require('source-map-support').install();
var http = require("http");
var path = require("path");
var RequestHandler_1 = require("./RequestHandler");
var argv = require('minimist')(process.argv.slice(2));
var config = require(path.resolve(__dirname, '../config.json')); //load default config
if (argv.c) {
    config = require(argv.c);
}
if (!config.diffModes) {
    config.diffModes = Object.create(null);
}
if (!config.watchDir) {
    config.watchDir = process.cwd();
}
var server = http.createServer(RequestHandler_1.requestHandlerCreator(config));
config.port = config.port || 8420;
config.watchMode = config.watchMode || 'memory';
server.listen(config.port, '127.0.0.1', function () {
    console.log("File changes are being served\nport: " + config.port + "\nwatched directory: " + path.resolve(__dirname, config.watchDir) + "\nwatch mode: " + config.watchMode);
});
process.on('SIGINT', function () { return process.exit(); });
//# sourceMappingURL=index.js.map