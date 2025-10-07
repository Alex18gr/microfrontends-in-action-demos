const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react");

module.exports = (webpackConfigEnv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "mf-single-spa-demo",
    projectName: "navbar",
    webpackConfigEnv,
  });

  return merge(defaultConfig, {
    // customizations can go here
  });
};
