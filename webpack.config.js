const path = require('path');

module.exports = {
  mode: 'development',            // Changed from 'production' - keeps code readable
  entry: './src/index.js',        // your front-end JS
  output: {
    filename: 'bundle.js',        // generated file
    path: path.resolve(__dirname, 'public'),
  },
  devtool: 'source-map',          // Changed from false - creates source maps for debugging
};
