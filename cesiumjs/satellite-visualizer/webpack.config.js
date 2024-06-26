"use strict";

const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");


const cesiumSource = "node_modules/cesium/Build/Cesium";
// this is the base url for static files that CesiumJS needs to load
// Not required but if it's set remember to update CESIUM_BASE_URL as shown below
const cesiumBaseUrl = "cesiumStatic";

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    unknownContextCritical: false,
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: {
          and: [/node_modules/], // Exclude libraries in node_modules ...
          not: [/cesium/], // Except Cesium because it uses modern syntax
        },
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { targets: "defaults, not ie 11" }],
              ],
              plugins: ["@babel/plugin-transform-optional-chaining"],
            },
          },
          // Babel understands the import.meta syntax but doesn't transform it in any way
          // However Webpack can't parse this and throws an error for an unexpected token
          // we need to use this extra loader so Webpack can actually bundle the code
          // https://www.npmjs.com/package/@open-wc/webpack-import-meta-loader
          require.resolve("@open-wc/webpack-import-meta-loader"),
        ],
      },
      {
        test: /\.css/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|gif|jpg|jpeg|svg|xml)$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    // Define environment variables
    new Dotenv(),
    new webpack.DefinePlugin({
      CESIUM_TOKEN: JSON.stringify(process.env.CESIUM_TOKEN),
    }),
    // Copy Configs
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "config",
          to: "config",
        },
      ],
    }),
    // Copy Assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "assets",
          to: "assets",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    // Copy Cesium Assets, Widgets, and Workers to a static directory
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(cesiumSource, "Workers"),
          to: `${cesiumBaseUrl}/Workers`,
        },
        {
          from: path.join(cesiumSource, "ThirdParty"),
          to: `${cesiumBaseUrl}/ThirdParty`,
        },
        {
          from: path.join(cesiumSource, "Assets"),
          to: `${cesiumBaseUrl}/Assets`,
        },
        {
          from: path.join(cesiumSource, "Widgets"),
          to: `${cesiumBaseUrl}/Widgets`,
        },
      ],
    }),
    new webpack.DefinePlugin({
      // Define relative base path in cesium for loading assets
      CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
    }),
  ],
  devServer: {
    static: "./dist",
  },
  mode: "development",
};