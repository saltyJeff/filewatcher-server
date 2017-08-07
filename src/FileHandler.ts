import * as path from 'path';
import * as diff from 'diff';
export abstract class FileHandler {
	protected watchModes: {[key: string]: string} = Object.create(null);
	constructor (filePaths: string[], diffModes: {[key: string]: string}, onFileChange: (fileName: string, changes: Object[]) => void) {
		for(let file of filePaths) {
			let ext = path.extname(file);
			let watchMode: string = diffModes[ext];
			switch(watchMode) {
				case 'word':
				case 'sentence':
				case 'line':
				case 'json':
				break;
				default:
					if(ext == 'json') {
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
	public abstract getInitial(fileName: string): string
	public abstract changeFile(fileName: string, newText: string);
	public runDiff(fileName: string, oldText: string, newText: string) {
		switch(this.watchModes[fileName]) {
			case 'word':
				diff.diffWordsWithSpace(oldText, newText, (err, changes) => {
					this.onFileChange(fileName, changes);
				});
				break;
			case 'sentence':
				diff.diffSentences(oldText, newText, (err, changes) => {
					this.onFileChange(fileName, changes);
				});
				break;
			case 'line':
				diff.diffLines(oldText, newText, (err, changes) => {
					this.onFileChange(fileName, changes);
				});
				break;	
			case 'json':
				diff.diffJson(JSON.parse(oldText), JSON.parse(newText), (err, changes) => {
					this.onFileChange(fileName, changes);
				});
			default:
				throw new Error(`Couldn't find a diff mode when checking diff`);
		}
	}
	public onFileChange: (fileName: string, changes: Object[]) => void;
}