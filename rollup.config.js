export default {
	input: 'src/Origami.js',
	output: [
		{
			format: 'umd',
			name: 'OriSim3d',
			file: 'dist/origami.js',
      sourcemap: true,
      indent: '\t'
		},
		{
			format: 'es',
			file: 'dist/origami.module.js',
			indent: '\t'
		}
	]
};
