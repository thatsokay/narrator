const clientConfig = require('../webpack.config.js')[0]

module.exports = {
  stories: ['../src/client/**/*.stories.tsx'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-knobs'],
  webpackFinal: (config) => ({
    ...config,
    module: {...config.module, rules: clientConfig.module.rules},
  }),
}
