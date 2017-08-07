import {FileHandler} from '../FileHandler';
import * as fs from 'fs';
import * as path from 'path';
import * as diff from 'diff';
import * as chokidar from 'chokidar';
export class FileWatcher extends FileHandler {
	public fileTexts: {[key: string]: string} = Object.create(null);
	constructor(filePaths: string[], diffModes: {[key: string]: string}, onFileChange: (fileName: string, changes: Object[]) => void) {
		super(filePaths, diffModes, onFileChange);
		for(let filePath of filePaths) {
			this.fileTexts[path.basename(filePath)] = fs.readFileSync(filePath, 'utf8');
		}
		let watcher = chokidar.watch(filePaths);
		let fileTexts = this.fileTexts;
		//damn closure
		watcher.on('change', (filePath: string) => {
			((daFilePath: string) => {
				fs.readFile(filePath, (err, data) => {
					let fileName = path.basename(daFilePath);
					let newText = data.toString();
					let oldText = this.fileTexts[fileName];
					fileTexts[fileName] = newText;
					console.log(fileTexts);
					console.log(oldText,newText);
					super.runDiff(fileName, oldText, newText); //CLOSURE=PAIN
				})
			})(filePath);
		});
	}
	public getInitial (fileName: string) {
		console.log('i am da file name and i was called');
		return this.fileTexts[fileName];
	}
	public changeFile(fileName: string, newText: string) {
		throw new Error("Automatically watches for file changes, impossible to modify");
	}
}