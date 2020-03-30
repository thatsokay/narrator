const clientConfig = require('../webpack.config.js')[0]

module.exports = {
  stories: ['../src/client/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-viewport/register',
    '@storybook/addon-actions/register',
    '@storybook/addon-knobs/register',
  ],
  webpackFinal: config => ({
    ...config,
    resolve: {...config.resolve, extensions: clientConfig.resolve.extensions},
    module: {...config.module, rules: clientConfig.module.rules},
  }),
}
