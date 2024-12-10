const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    quill: './text-editor.js'
  },
  output: {
    globalObject: 'self',
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].js',
    publicPath: '/dist/'
  },
  devServer: {
    static: path.join(__dirname),
    compress: true
  }
}