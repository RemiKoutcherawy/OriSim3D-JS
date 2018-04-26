export default {
	input: 'src/Origami.js',
	// sourceMap: true,
	output: [
		{
			format: 'umd',
			name: 'OriSim3d',
			file: 'dist/origami.js',
			indent: '\t'
		},
		{
			format: 'es',
			file: 'dist/origami.module.js',
			indent: '\t'
		}
	]
};
