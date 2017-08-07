import {FileHandler} from '../FileHandler';
import * as fs from 'fs';
import * as path from 'path';
import * as diff from 'diff';
export class MemoryCachedHandler extends FileHandler {
	public fileTexts: {[key: string]: string} = Object.create(null);
	constructor(filePaths: string[], diffModes: {[key: string]: string}, onFileChange: (fileName: string, changes: Object[]) => void) {
		super(filePaths, diffModes, onFileChange);
		for(let filePath of filePaths) {
			this.fileTexts[path.basename(filePath)] = fs.readFileSync(filePath, 'utf8');
		}
	}
	public getInitial (fileName: string) {
		return this.fileTexts[fileName];
	}
	public changeFile(fileName: string, newText: string) {
		let oldText = this.fileTexts[fileName];
		if(oldText == undefined) {
			throw new Error("File not found inside memory cache!");
		}
		this.runDiff(fileName, oldText, newText);
		this.fileTexts[fileName] = newText;
	}
}