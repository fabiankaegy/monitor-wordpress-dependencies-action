import fs from 'fs';
import prettyBytes from 'pretty-bytes';
import phpArrayParser from 'php-array-parser';

/**
 * Check if a given file exists and can be accessed.
 * @param {string} filename
 */
export async function fileExists(filename) {
	try {
		await fs.promises.access(filename, fs.constants.F_OK);
		return true;
	} catch (e) {}
	return false;
}

/**
 * @param {number} delta
 * @param {number} originalSize
 */
export function getDeltaText(delta, originalSize) {
	let deltaText = (delta > 0 ? '+' : '') + prettyBytes(delta);
	if (Math.abs(delta) === 0) {
		// only print size
	} else if (originalSize === 0) {
		deltaText += ` (new file)`;
	} else if (originalSize === -delta) {
		deltaText += ` (removed)`;
	} else {
		const percentage = Math.round((delta / originalSize) * 100);
		deltaText += ` (${percentage > 0 ? '+' : ''}${percentage}%)`;
	}
	return deltaText;
}

/**
 * Create a Markdown table from text rows
 * @param {string[][]} rows
 */
function markdownTable(rows) {
	if (rows.length == 0) {
		return '';
	}

	// Skip all empty columns
	while (rows.every(columns => !columns[columns.length - 1])) {
		for (const columns of rows) {
			columns.pop();
		}
	}

	const [firstRow] = rows;
	let columnLength = firstRow.length;

	// Hide `Change` column if they are all `0 B`
	if (columnLength === 3 && rows.every(columns => columns[2] === '0 B')) {
		columnLength -= 1;
		for (const columns of rows) {
			columns.pop();
		}
	}

	if (columnLength === 0) {
		return '';
	}

	return [
		// Header
		['Filename', 'Dependencies', 'Change', ''].slice(0, columnLength),
		// Align
		[':---', ':---:', ':---:', ':---:'].slice(0, columnLength),
		// Body
		...rows
	].map(columns => `| ${columns.join(' | ')} |`).join('\n');
}

/**
 * @typedef {Object} Diff
 * @property {string} filename
 * @property {number} size
 * @property {number} delta
 */

/**
 * Create a Markdown table showing diff data
 * @param {Diff[]} files
 * @param {object} options
 * @param {boolean} [options.collapseUnchanged]
 * @param {boolean} [options.omitUnchanged]
 * @param {number} [options.minimumChangeThreshold]
 */
export function diffTable(files, { collapseUnchanged, omitUnchanged, minimumChangeThreshold }) {
	let changedRows = [];
	let unChangedRows = [];

	for (const file of files) {
		const { filename, size, delta } = file;

		const isUnchanged = delta?.length;

		if (isUnchanged && omitUnchanged) continue;

		const columns = [
			`\`${filename}\``, 
			size, 
			delta
		];
		if (isUnchanged && collapseUnchanged) {
			unChangedRows.push(columns);
		} else {
			changedRows.push(columns);
		}
	}

	let out = markdownTable(changedRows);

	if (unChangedRows.length !== 0) {
		const outUnchanged = markdownTable(unChangedRows);
		out += `\n\n<details><summary>ℹ️ <strong>View Unchanged</strong></summary>\n\n${outUnchanged}\n\n</details>\n\n`;
	}

	return out;
}

/**
 * Convert a string "true"/"yes"/"1" argument value to a boolean
 * @param {string} v
 */
export function toBool(v) {
	return /^(1|true|yes)$/.test(v);
}

export async function getFileContents(filename) {
	return (await fs.promises.readFile(filename)).toString();
}

export async function getAssetFileArray(contents) {
	const pattern = /array\(.+?(?=\;)/gm;
	const matches = contents.match(pattern);
	if (!matches) {
		throw new Error('Could not find asset file array');
	}
	return matches[0];
}

export async function parseAssetFile(filename) {
	const contents = await getFileContents(filename);
	const array = await getAssetFileArray(contents);
	return phpArrayParser.parse(array)
}

export async function getAssetDependencies(filename) {
	const { dependencies } = await parseAssetFile(filename);
	return dependencies;
}


export function toMap(names, values) {
    return names.reduce((map, name, i) => {
        map[name] = values[i];
        return map;
    }, {});
}

export function dedupe(item, index, arr) {
    return arr.indexOf(item) === index;
}

export function toFileMap(files) {
    return files.reduce((result, file) => {
        if (file.size) {
            // excluding files with size 0
            result[file.filename] = file.size;
        }
        return result;
    }, {});
}
