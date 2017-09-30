# css-magic-split-webpack-plugin

Split your CSS for stupid browsers using [webpack] and [postcss].

Using [webpack] to generate your CSS is fun for some definitions of fun. Unfortunately the fun stops when you have a large app and need IE9 support because IE9 will ignore any more than ~4000 selectors in your lovely generated CSS bundle. The solution is to split your CSS bundle smartly into multiple smaller CSS files. Now _you can_.™ Supports source-maps.

The main motivation for adding the split-by-comments feature is facilitate the ability to split vendor styles from your app's styles. This is especially useful when using SASS or LESS preprocessors. Simply use the appropriate loader for your stylesheet and the plugin will take care of the rest. 

## Installation

```sh
npm install --save css-magic-split-webpack-plugin
```

## Usage

Add split points in your CSS, SASS or LESS stylesheets. Then simply add an instance of `CSSSplitWebpackPlugin` to your list of plugins in your webpack configuration file _after_ `ExtractTextPlugin`. That's it!

```css
/*! split:vendor */
@import 'bootstrap.css';

/*! split:app */
@import 'app.css';
```

```javascript
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CSSSplitWebpackPlugin = require('css-magic-split-webpack-plugin').default;

module.exports = {
  entry: './index.js',
  context: __dirname,
  output: {
    path: __dirname + '/dist',
    publicPath: '/foo',
    filename: 'bundle.js',
  },
  module: {
    loaders: [{
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader'),
    },{
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader', 'sass-loader'),
    }],
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new CSSSplitWebpackPlugin({size: 4000, commentPattern: '! split:'}),
  ],
};
```

The following configuration options are available:

**size**: `default: 4000` The maximum number of CSS rules allowed in a single file. To make things work with IE this value should be somewhere around `4000`.

**bySize**: `default: true` Determines whether or not the file is split by size.

**byComment**: `default: true` Determines whether or not the file is to be split by CSS comments.

**commentPattern**: `default: "! split:"` The pattern to search for in comments. Example: 

**imports**: `default: false` If you originally built your app to only ever consider using one CSS file then this flag is for you. It creates an additional CSS file that imports all of the split files. You pass `true` to turn this feature on, or a string with the name you'd like the generated file to have.

**filename**: `default: "[name]-[part]-[chunkName].[ext]"` Control how the split files have their names generated. The default uses the parent's filename and extension, but adds in the part number.

**preserve**: `default: false`. Keep the original unsplit file as well. Sometimes this is desirable if you want to target a specific browser (IE) with the split files and then serve the unsplit ones to everyone else.

[webpack]: http://webpack.github.io/
[herp]: https://github.com/ONE001/css-file-rules-webpack-separator
[postcss]: https://github.com/postcss/postcss
[postcss-chunk]: https://github.com/mattfysh/postcss-chunk
