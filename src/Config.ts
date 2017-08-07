export interface Config {
	port: number;
	watchDir: string;
	watchMode: string;
	diffModes: {[key: string]: string};
}