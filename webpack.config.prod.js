const webpack = require('webpack')
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './client/Index.tsx',
  output: {
    path: path.resolve(__dirname, 'assets/js'),
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  optimization: {
    minimize: true
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],

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
