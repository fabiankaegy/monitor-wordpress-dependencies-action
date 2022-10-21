import { getAssetDependencies, toMap, dedupe } from './utils';

const path = require('path');
const promisify = require('util.promisify');
const globPromise = require('glob');
const minimatch = require('minimatch');
const fs = require('fs-extra');

const glob = promisify(globPromise);

const getFileSize = input => Buffer.byteLength(input);
getFileSize.file = async path => (await fs.stat(path)).size;

export class DependencyPlugin {
	constructor(options) {
		const opt = options || {};
		opt.pattern = opt.pattern || '**/*.asset.php';
		opt.filename = opt.filename || 'size-plugin.json';
		opt.writeFile = opt.writeFile !== false;
		opt.filepath = path.join(process.cwd(), opt.filename);
		opt.mode = opt.mode || process.env.NODE_ENV;
		this.options = opt;
	}

	filterFiles(files) {
		const isMatched = minimatch.filter(this.options.pattern);
		const isExcluded = this.options.exclude
			? minimatch.filter(this.options.exclude)
			: () => false;
		return files.filter(file => isMatched(file) && !isExcluded(file));
	}

	async readFromDisk(cwd) {
		const files = await glob(this.options.pattern, {
			cwd,
			ignore: this.options.exclude
		});

		const dependencies = await Promise.all(
			this.filterFiles(files).map(file => {
				const filepath = path.join(cwd, file);
				return getAssetDependencies(filepath).catch(() => null);
			})
		);
		return toMap(
			files,
			dependencies
		);
	}

	async getDiff(dependenciesBefore, dependencies) {
		// get a list of unique filenames
		const fileNames = [
			...Object.keys(dependenciesBefore),
			...Object.keys(dependencies)
		].filter(dedupe);
		const files = [];
		for (const filename of fileNames) {
			const dependency = dependencies[filename] || 0;
			const dependencyBefore = dependenciesBefore[filename] || 0;
			const difference = dependency.filter(x => !dependencyBefore.includes(x))
			files.push({ filename, dependency: dependency.join(', '), difference: difference.join(', ') });
		}
		return files;
	}
}


/**
 * @name Item
 * @typedef Item
 * @property {string} name Filename of the item
 * @property {number} dependencyBefore Previous dependency, in kilobytes
 * @property {number} dependency Current dependency, in kilobytes
 * @property {string} dependencyText Formatted current size
 * @property {number} delta Difference from previous size, in kilobytes
 * @property {string} deltaText Formatted size delta
 * @property {string} msg Full item's default message
 * @property {string} color The item's default CLI color
 * @public
 */

/**
 * @name Data
 * @typedef Data
 * @property {Item[]} dependencies List of file size items
 * @property {string} output Current buffered output
 * @public
 */