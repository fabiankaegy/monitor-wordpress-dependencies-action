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
			filename: 'sample/index.asset.php',
			dependency: ['wp-block-editor', 'wp-blocks', 'wp-element', 'wp-primitives',],
			added: ['wp-primitives'],
			removed: ['wp-components'],
		  },
		  {
			filename: 'sample/test.asset.php',
			dependency: ['wp-block-editor', 'wp-blocks', 'wp-element', 'wp-primitives',],
			added: ['wp-primitives, wp-components'],
			removed: [''],
		  },
		  {
			filename: 'sample/hello.asset.php',
			dependency: ['wp-block-editor', 'wp-blocks', 'wp-element', 'wp-primitives'],
			added: ['wp-primitives',],
			removed: [''],
		  },
		  {
			filename: 'sample/view.asset.php',
			dependency: ['wp-block-editor', 'wp-blocks', 'wp-element', 'wp-primitives'],
			added: ['wp-primitives',],
			removed: [''],
		  }
	];
	const defaultOptions = {
		showTotal: true,
		collapseUnchanged: true,
		omitUnchanged: false,
	};

	expect(diffTable(files, { ...defaultOptions })).toMatchSnapshot();
	expect(diffTable(files, { ...defaultOptions, showTotal: false })).toMatchSnapshot();
	expect(diffTable(files, { ...defaultOptions, collapseUnchanged: false })).toMatchSnapshot();
	expect(diffTable(files, { ...defaultOptions, omitUnchanged: true })).toMatchSnapshot();

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
