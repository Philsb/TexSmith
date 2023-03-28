const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "build"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
    }),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "assembly-libs"),
      outDir: path.resolve(__dirname, "build/assembly-libs"),
      forceMode: `production`,
      extraArgs: " --target web"
    })
  ],
  module: {
    // exclude node_modules
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      // `ts` and `tsx` files are parsed using `ts-loader`
      { 
        test: /\.(ts|tsx)$/, 
        loader: "ts-loader" 
      },
      {
        test: /\.(sa|sc|c)ss$/, // styles files
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/, // to import images and fonts
        loader: "url-loader",
        options: { limit: false },
      },
    ],
  },
  // pass all js files through Babel
  resolve: {
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  },
  devServer: {
    static: path.resolve(__dirname, "build"),
    open: false,
    port:3000,
  },
};
