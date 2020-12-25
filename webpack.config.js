const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')

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
  module: {
    rules: [
      ...commonConfig.module.rules,
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                ident: 'postcss',
                plugins: [require('tailwindcss'), require('autoprefixer')],
              },
            },
          },
        ],
      },
      {
        test: /\.woff2?$/i,
        loader: 'file-loader',
        options: {
          outputPath: 'fonts',
          name: '[name].[ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({inject: true, template: './public/index.html'}),
  ],
}

const serverConfig = {
  target: 'node',
  node: {
    __dirname: false,
  },
  // https://stackoverflow.com/a/30709692
  // https://jlongster.com/Backend-Apps-with-Webpack--Part-I
  externals: fs
    .readdirSync('node_modules')
    .filter((module) => ['.bin'].indexOf(module) === -1)
    .reduce((acc, module) => {
      acc[module] = `commonjs ${module}`
      return acc
    }, {}),
  entry: {
    server: './src/server/index.ts',
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
