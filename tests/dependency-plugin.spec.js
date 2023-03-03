const DependencyPlugin = require('../lib/dependency-plugin.js');

test('DependencyPlugin', async () => {
	const plugin = new DependencyPlugin({
		pattern: '**/*.asset.php'
	});

	const cwd = process.cwd();

	const newSizes = await plugin.readFromDisk(cwd);

	const oldSizes = await plugin.readFromDisk(cwd);

	const diff = await plugin.getDiff(oldSizes, newSizes);

	expect(diff).toMatchSnapshot();	
});

test('DependencyPluginOutput', async () => {
	const plugin = new DependencyPlugin({
		pattern: '**/*.asset.php'
	});

	const newSizes = {
        'sample/index.asset.php': [ 'wp-block-editor', 'wp-blocks', 'wp-element', 'wp-primitives' ],
      }

	const oldSizes = {
        'sample/index.asset.php': [ 'wp-block-editor', 'wp-blocks', 'wp-components', 'wp-element' ],
      }

	const diff = await plugin.getDiff(oldSizes, newSizes);

	expect(diff).toMatchSnapshot();
});
