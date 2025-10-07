const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default

module.exports = (angularWebpackConfig, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(angularWebpackConfig, options);

  singleSpaWebpackConfig.externals = {
    '@mf-single-spa-demo/api': '@mf-single-spa-demo/api',
    ...singleSpaWebpackConfig.externals
  }

  // Feel free to modify this webpack config however you'd like to
  return singleSpaWebpackConfig
}
