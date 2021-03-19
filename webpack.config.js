const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "./src/index.js"),
  mode: "development",
  output: {
    path: path.resolve(__dirname, "./public"),
    publicPath: "/",
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: /src/,
        use: ["babel-loader"],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};
