'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const globalConfig = require('../../config')

const yargs = require('yargs')
console.log('yargs.argv', yargs.argv)
const _env = yargs.argv.env
const pass = _env ? _env.pass || _env.pwd || _env.p : (yargs.argv.pass || yargs.argv.pwd || yargs.argv.p)

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  PROXY: '"/proxy"',
  PING: '"http://' + globalConfig.server.host + '"',
  STATIC_PATH: '""',
  EWEB_PASS: JSON.stringify(pass)
})
