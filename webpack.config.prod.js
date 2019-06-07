const webpack = require('webpack')

module.exports = {
  entry: './client/Index.tsx',
  output: {
    filename: './assets/js/bundle.js'
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
