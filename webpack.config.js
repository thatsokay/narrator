const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  stats: 'minimal',
  module: {
    rules: [],
  },
  entry: {
    app: './src/client/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'build', 'public'),
    filename: 'js/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
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
        type: 'asset/resource',
        generator: {filename: 'fonts/[name].[ext]'},
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({inject: true, template: './public/index.html'}),
  ],
}
