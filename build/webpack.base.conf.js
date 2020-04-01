'use strict'
const path = require('path')
var os = require('os')
var HappyPack = require('happypack')
var yargs = require('yargs')
var HappyPackThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: ['babel-polyfill', './src/main.js']
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath:
      process.env.NODE_ENV === 'production'
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '#': resolve('src') + `/views/${yargs.argv.env.devType}`,
      '@': resolve('src')
    },
    modules: [resolve('node_modules')]
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        include: [resolve('src')],
        use: ['happypack/loader?id=vue']
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.js$/,
        include: [resolve('src')],
        use: ['happypack/loader?id=babel']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        exclude: [resolve('src/assets/icons')],
        options: {
          limit: 50000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf|md)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    new HappyPack({
      id: 'vue',
      threadPool: HappyPackThreadPool,
      loaders: [
        {
          loader: 'vue-loader',
          options: vueLoaderConfig
        }
      ]
    }),
    new HappyPack({
      id: 'babel',
      threadPool: HappyPackThreadPool,
      loaders: ['babel-loader?cacheDirectory'],
      verbose: true
    })
  ],
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
