const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/admin.jsx",
  output: {
    path: path.resolve(__dirname, "/public"),
    filename: "admin.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
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
