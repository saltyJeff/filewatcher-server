import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import {Config} from './Config';
import {FileHandler} from './FileHandler';
import {MemoryCachedHandler} from './filehandlers/MemoryCached';
import {FileWatcher} from './filehandlers/FileWatcher';

export function requestHandlerCreator (conf: Config) {
	//get all files from directory
	const fileListeners: {[key: string]: http.ServerResponse[]} = Object.create(null);
	let dir = path.resolve(__dirname, conf.watchDir);
	let dirContent = fs.readdirSync(dir);
	let watchedFiles = [];
	for(let file of dirContent) {
		let filePath = path.resolve(dir, file);
		let stats = fs.statSync(filePath);
		if(stats.isFile()) {
			fileListeners[file] = [];
			watchedFiles.push(filePath);
		}
	}
	//handler
	let handler: FileHandler;
	let onFileChange = (fileName: string, changes: Object[]) => {
		for(let res of fileListeners[fileName]) {
			makeSSE(res, 'change', undefined, JSON.stringify(changes));
		}
		console.log(`${fileName} modified ${Date.now().toLocaleString()}`);
	};
	switch(conf.watchMode) {
		case 'memory':
			handler = new MemoryCachedHandler(watchedFiles, conf.diffModes, onFileChange);
			break;
		case 'watch':
			handler = new FileWatcher(watchedFiles, conf.diffModes, onFileChange);
			break;
		default:
			handler = new MemoryCachedHandler(watchedFiles, conf.diffModes, onFileChange);
			break;
	} 
	process.on('exit', () => {
		console.log('writing files to disk before exit');
		for(let filePath of watchedFiles) {
			let fileName = path.basename(filePath);
			fs.writeFileSync(filePath, handler.getInitial(fileName));
		}
	});

	return (req: http.ServerRequest, res: http.ServerResponse) => {
		let resource = req.url.substring(1);
		let listeners = fileListeners[resource];
		if(!listeners) {
			res.statusCode = 400;
			res.setHeader('Content-type', 'text/plain');
			res.end(`404: Requested File ${resource} not found.\n`);
		}
		else {
			res.statusCode = 200;
			if(req.method == 'POST') {
				res.setHeader('Content-Type', 'text/plain');
				if(conf.watchMode == 'watch') {
					res.statusCode = 403;
					res.end('The watch mode has been set to "watch", make a change to the file to mutate it');
				}
				let segments = [];
				req.on('data', (data) => {
					segments.push(data);
				});
				req.on('end', () => {
					let str = Buffer.concat(segments).toString();
					handler.changeFile(resource, str);
					res.end('write succesful');
				});
			}
			else if(req.method == 'GET') {
				res.setHeader('Content-Type', 'text/event-stream');
				res.setHeader('Cache-Control', 'no-cache');
				res.setHeader('Connection', 'keep-alive');
				res.write("\n");
				listeners.push(res);
				makeSSE(res, 'initial', undefined, handler.getInitial(resource));
			}
		}
	}
}
function makeSSE(res: http.ServerResponse, evtName: string, id: string, data: string) {
	res.write(`event: ${evtName} \n`);
	if(id) {
		res.write(`id: ${id} \n`);
	}
	res.write(`data: ${data} \n\n`);
}