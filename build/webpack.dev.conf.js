'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const globalConfig = require('../../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const path = require('path')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)
const yargs = require('yargs')
const devIp = yargs.argv.env.devip || yargs.argv.env.ip ||yargs.argv.env.i || globalConfig.server.host

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      usePostCSS: true
    })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    contentBase: path.resolve(__dirname, '../'),
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true,
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay ? {
      warnings: false,
      errors: true
    } : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll
    },

  },
  plugins: [
    // new webpack.DllReferencePlugin({
    //   name: 'vueBundle',
    //   // dllplugin 打包输出的manifest.json
    //   manifest: require('../vueBundle.manifest.json'),
    //   // 和dllplugin里面的context一致
    //   context: path.join(__dirname, '..')
    // }),
    // new webpack.DllReferencePlugin({
    //   name: 'vendor',
    //   // dllplugin 打包输出的manifest.json
    //   manifest: require('../vendor.manifest.json'),
    //   // 和dllplugin里面的context一致
    //   context: path.join(__dirname, '..')
    // }),
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'development.html',
      favicon: path.resolve(__dirname, '../favicon.ico'),
      inject: true
    }),
    // new PreloadWebpackPlugin({
    //   rel: 'prefetch',
    //   include: 'allChunks'
    // })
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(
        new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: [
              `Device type is ${yargs.argv.env.devType}. IP is ${devIp}`,
              `Your application is running here: http://${
                devWebpackConfig.devServer.host
              }:${port}`
            ]
          },
          onErrors: config.dev.notifyOnErrors ?
            utils.createNotifierCallback() : undefined
        })
      )

      resolve(devWebpackConfig)
    }
  })
})
