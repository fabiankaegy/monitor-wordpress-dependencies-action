import { toBool, getDeltaText, iconForDifference, diffTable, fileExists, parseAssetFile } from '../src/utils.js';
import path from 'path';

test('toBool', () => {
	expect(toBool('1')).toBe(true);
	expect(toBool('true')).toBe(true);
	expect(toBool('yes')).toBe(true);

	expect(toBool('0')).toBe(false);
	expect(toBool('false')).toBe(false);
	expect(toBool('no')).toBe(false);
});

test('getDeltaText', () => {
	expect(getDeltaText(5000, 20000)).toBe('+5 kB (+25%)');
	expect(getDeltaText(-5000, 20000)).toBe('-5 kB (-25%)');
	expect(getDeltaText(210, 0)).toBe('+210 B (new file)');
	expect(getDeltaText(0, 0)).toBe('0 B');
});

test('iconForDifference', () => {
	expect(iconForDifference(0, 5000)).toBe('');
	expect(iconForDifference(5500, 5000)).toBe('🆘');
	expect(iconForDifference(-550, 5000)).toBe('👏');
});

test('diffTable', () => {
	const files = [
		{
			filename: 'one.js',
			size: 5000,
			delta: 2500
		},
		{
			filename: 'two.js',
			size: 5000,
			delta: -2500
		},
		{
			filename: 'three.js',
			size: 300,
			delta: 0
		},
		{
			filename: 'four.js',
			size: 4500,
			delta: 9
		}
	];
	const defaultOptions = {
		showTotal: true,
		collapseUnchanged: true,
		omitUnchanged: false,
		minimumChangeThreshold: 1
	};

	expect(diffTable(files, { ...defaultOptions })).toMatchSnapshot();
	expect(diffTable(files, { ...defaultOptions, showTotal: false })).toMatchSnapshot();
	expect(diffTable(files, { ...defaultOptions, collapseUnchanged: false })).toMatchSnapshot();
	expect(diffTable(files, { ...defaultOptions, omitUnchanged: true })).toMatchSnapshot();
	expect(diffTable(files, { ...defaultOptions, minimumChangeThreshold: 10 })).toMatchSnapshot();
	expect(diffTable(files.map(file => ({...file, delta: 0})), { ...defaultOptions })).toMatchSnapshot();

	expect(diffTable([files[2]], { ...defaultOptions })).toMatchSnapshot();
});

test('fileExists', async () => {
	expect(await fileExists('package.json')).toBe(true);
	expect(await fileExists('file-that-does-not-exist')).toBe(false);
});

test('parseAssetFile', async () => {
	const assetFixturePath = path.resolve( './fixtures/after/index.asset.php' );
	expect(await parseAssetFile(assetFixturePath)).toMatchSnapshot();
});
