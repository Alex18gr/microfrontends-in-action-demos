const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: { path: path.resolve(__dirname, 'dist'), publicPath: 'auto', clean: true },
  resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },
  devServer: { port: 3002, historyApiFallback: true, static: { directory: path.join(__dirname, 'public') }, hot: true },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/, options: { transpileOnly: true } },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'catalog',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductCatalog': './src/ProductCatalog.tsx'
      },
      remotes: { host: 'host@http://localhost:3000/remoteEntry.js' },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
        'react-router-dom': { singleton: true, requiredVersion: false }
      }
    }),
    new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'public/index.html') })
  ]
};
