const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const commonConfig = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  stats: 'minimal',
  module: {
    rules: [{test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/}],
  },
}

const clientConfig = {
  entry: {
    app: './src/client/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'build', 'public'),
    filename: 'js/[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({inject: true, template: './public/index.html'}),
  ],
}

const serverConfig = {
  target: 'node',
  node: {
    console: false,
    __dirname: false,
  },
  entry: {
    server: './src/server.ts',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'server.js',
  },
}

module.exports = [
  {...commonConfig, ...clientConfig},
  {...commonConfig, ...serverConfig},
]
