const clientConfig = require('../webpack.config.js')[0]

module.exports = {
  stories: ['../src/client/**/*.stories.tsx'],
  webpackFinal: config => ({
    ...config,
    resolve: {...config.resolve, extensions: clientConfig.resolve.extensions},
    module: {...config.module, rules: clientConfig.module.rules},
  }),
}
