'use strict'
const yargs = require('yargs')

let theme = 'eweb'
let viewsPath = 'views/eap'
if (yargs.argv.env.devType !== 'eap') {
  theme = `eweb-${yargs.argv.env.devType}`
  viewsPath = `views/${yargs.argv.env.devType}`
}
console.log('views path === ', viewsPath)
module.exports = {
  NODE_ENV: '"production"',
  PROXY: '""',
  BASE_PATH: '"/cgi-bin/luci"',
  PING: '""',
  KEY: '"RjYkhwzx$2018!"',
  INIT_IP: '"10.44.77.254"',
  THEME: JSON.stringify(theme),
  STATIC_PATH: JSON.stringify(`/luci-static/${theme}`),
  VIEWS_PATH: JSON.stringify(viewsPath)
}
