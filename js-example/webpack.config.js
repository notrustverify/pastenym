const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');




var indexPage = {
entry:
  "./bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin({ patterns: ['index.html'] })
  ],
  experiments: { syncWebAssembly: true }
};

var pastePage = {
entry:
  "./bootstrapPaste.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrapPaste.js",
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin({ patterns: ['paste.html'] })
  ],
  experiments: { syncWebAssembly: true }
};

module.exports = [indexPage,pastePage]