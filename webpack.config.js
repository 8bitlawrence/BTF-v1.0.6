const path = require('path');

module.exports = {
  mode: 'production',             // minifies and optimizes automatically
  entry: './src/index.js',        // your front-end JS
  output: {
    filename: 'bundle.js',        // generated file
    path: path.resolve(__dirname, 'public'),
  },
  devtool: false,                 // disables source maps (hides source)
};
