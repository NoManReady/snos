'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const globalConfig = require('../../config')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  PROXY: '"/proxy"',
  PING: '"http://' + globalConfig.server.host + '"',
  STATIC_PATH: '""'
})
