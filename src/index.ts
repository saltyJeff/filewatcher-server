#!/usr/bin/env node
require('source-map-support').install();
import * as http from 'http';
import {Config} from './Config';
import * as path from 'path';
import {requestHandlerCreator} from './RequestHandler';
const argv = require('minimist')(process.argv.slice(2));

let config: Config = require(path.resolve(__dirname, '../config.json')); //load default config
if(argv.c) {
	config = require(argv.c);
}
if(!config.diffModes) {
	config.diffModes = Object.create(null);
}
if(!config.watchDir) {
	config.watchDir = process.cwd();
}
const server = http.createServer(requestHandlerCreator(config));
config.port = config.port || 8420;
config.watchMode = config.watchMode || 'memory';
server.listen(config.port, '127.0.0.1', () => {
	console.log(
`File changes are being served
port: ${config.port}
watched directory: ${path.resolve(__dirname, config.watchDir)}
watch mode: ${config.watchMode}`);
});
process.on('SIGINT', () => process.exit());