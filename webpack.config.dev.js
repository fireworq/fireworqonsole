const path = require('path');

module.exports = {
  mode: 'development',
  entry: './client/Index.tsx',
  output: {
    path: path.resolve(__dirname, 'assets/js'),
    filename: 'bundle.js'
  },

  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'ts-loader' }
        ]
      }
    ]
  }
};
