const { toBool, diffTable, fileExists, parseAssetFile } = require('../lib/utils.js');
const path = require('path');

test('toBool', () => {
	expect(toBool('1')).toBe(true);
	expect(toBool('true')).toBe(true);
	expect(toBool('yes')).toBe(true);

	expect(toBool('0')).toBe(false);
	expect(toBool('false')).toBe(false);
	expect(toBool('no')).toBe(false);
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
