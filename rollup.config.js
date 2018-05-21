export default {
	input: 'src/Origami.js',
	output: [
		{
			format: 'umd',
			name: 'OriSim3d',
			file: 'build/origami.js',
      sourcemap: true,
      indent: '\t'
		},
		{
			format: 'es',
			file: 'build/origami.module.js',
			indent: '\t'
		}
	]
};
