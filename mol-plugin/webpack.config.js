const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.ts',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      library: 'MolstarPlugin',
      libraryTarget: 'umd',
      globalObject: 'this'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        'react/jsx-runtime': path.resolve(__dirname, 'src/jsx-runtime.ts'),
        'react$': path.resolve(__dirname, 'src/react-shim.ts')
      }
    },
    externals: {
      'molstar': 'molstar'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    mode: argv.mode || 'production'
  };
};