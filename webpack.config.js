const path = require('path')

module.exports = {
  entry: './src/static/app/index.jsx',
  output: {
    path: path.resolve(__dirname, 'src/static'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  externals: {
    'react': 'React'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
  ]
}
