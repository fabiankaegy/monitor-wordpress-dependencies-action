const { DependencyPlugin } = require('../lib/dependency-plugin.js');

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
