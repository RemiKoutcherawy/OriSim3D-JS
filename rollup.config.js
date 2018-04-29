export default {
	input: 'HandleEvent.js',
	sourceMap: true,
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
