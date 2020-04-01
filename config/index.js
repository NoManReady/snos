'use strict'
// Template version: 1.2.7
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')
const globalConfig = require('../../config')
let theme = JSON.parse(require('./prod.env').THEME)
console.log(theme)
const pathConstant = {
  proPath: path.join(__dirname, '../../luci'),
  entryPath: `themes/${theme}/luasrc/view/entry.htm`,
  cachePath: `themes/${theme}/htdocs/luci-static/${theme}/cache.htm`,
  staticPath: `themes/${theme}/htdocs/luci-static/${theme}`
}

const yargs = require('yargs')
const devIp = yargs.argv.env.devip || yargs.argv.env.ip || yargs.argv.env.i || globalConfig.server.host

module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {
      '/proxy': {
        target: 'http://' + devIp,
        changeOrigin: true,
        pathRewrite: {
          '^/proxy': ''
        }
      },
      '/snos_red': {
        target: 'http://' + devIp,
        changeOrigin: true
      }
    },

    // Various Dev Server settings
    // host:'192.168.23.136',
    host: '192.168.110.121',//localhost', // can be overwritten by process.env.HOST
    port: 9000, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-

    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'source-map',
    // devtool: 'eval',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  },

  build: {
    // Template for index.html
    index: path.join(pathConstant.proPath, pathConstant.entryPath),
    cache: path.join(pathConstant.proPath, pathConstant.cachePath),

    // Paths
    assetsRoot: path.join(pathConstant.proPath, pathConstant.staticPath),
    assetsSubDirectory: 'static',
    // 静态资源加载使用相对路径；动态js加载使用__webpack_public_path__设置
    assetsPublicPath: `<%=media%>/`,  //`../../luci-static/${theme}/`,

    /**
     * Source Maps
     */

    productionSourceMap: false,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: 'eval-source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: true,
    // productionGzipExtensions: ['js', 'css', 'ttf', 'gif'],
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
