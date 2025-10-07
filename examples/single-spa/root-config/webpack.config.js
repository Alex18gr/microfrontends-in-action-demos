const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (webpackConfigEnv, argv) => {
  const orgName = "mf-single-spa-demo";
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: "root-config",
    webpackConfigEnv,
    argv,
    disableHtmlGeneration: true,
  });

  return merge(
    defaultConfig,
    {
      plugins: [
        new HtmlWebpackPlugin({
          inject: false,
          template: "src/index.ejs",
          templateParameters: {
            isLocal: webpackConfigEnv && webpackConfigEnv.isLocal,
            orgName,
          },
        }),
        new CopyWebpackPlugin({
          patterns: [
            { from: 'src/assets', to: 'assets' },
          ],
        }),
      ],
    },
    {
        externals: ['@mf-single-spa-demo/api', 'rxjs', 'rxjs/operators']
      // modify the webpack config however you'd like to by adding to this object
    }
  );
};
