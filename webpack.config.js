const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/admin.js",
  output: {
    path: path.resolve(__dirname, "/public/media/scripts"),
    filename: "admin.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /public/,
        loader: "babel-loader",
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: "./src/admin.html",
    }),
  ],
};
