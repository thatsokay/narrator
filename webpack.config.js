const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  entry: {
    app: './src/client/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'build', 'public'),
    filename: 'js/[name].js',
  },
  module: {
    rules: [{test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/}],
  },
  plugins: [
    new HtmlWebpackPlugin({inject: true, template: './public/index.html'}),
  ],
}
