const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.tsx',
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      library: {
        name: 'MolstarPlugin',
        type: 'umd'
      },
      globalObject: 'this'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx']
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