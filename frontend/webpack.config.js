const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    bootstrap: './src/bootstrap.js',
    worker: './src/worker.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  // mode: 'development',
  mode: 'production',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/@nymproject/nym-client-wasm/*.(js|wasm)',
          to: '[name][ext]',
        },
      ],
    }),
  ],
  experiments: { syncWebAssembly: true },
};