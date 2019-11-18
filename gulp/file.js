let fs = require('fs')
let path = require('path')
let join = path.join
let ssh = require('./ssh')
let config = require('./config')

const SERVER = config.server

const yargs = require('yargs')
console.log('yargs.argv', yargs.argv)
const _env = yargs.argv.env
const devIp = _env ? _env.devip || _env.ip || _env.i : (yargs.argv.i || yargs.argv.ip)
if (devIp) {
  SERVER.host = devIp
}
console.log(`代理到此IP设备: ${SERVER.host}`)

/**
 *  返回指定目录所有的文件路径
 * @param pathString  文件夹路径
 * @returns {Array}
 */
function findSync(pathString) {
  let result = {
    files: [],
    dirs: []
  }
  function finder(_pStr) {
    let files = fs.readdirSync(_pStr)
    files.forEach((val, index) => {
      let fPath = join(_pStr, val)
      let rPath = fPath.replace(/\\/g, '/')
      let stats = fs.statSync(fPath)
      if (stats.isDirectory()) {
        result.dirs.push(rPath)
        finder(fPath)
      }
      if (stats.isFile()) {
        result.files.push(rPath)
      }
    })
  }
  finder(pathString)
  return result
}

/**
 * 上传文件（单个）
 * @param {String} local
 * @param {String} origin
 */
function UploadFile(local, origin) {
  ssh.Connect(SERVER, function (conn) {
    conn.sftp(function (err, sftp) {
      if (err) {
        console.log(err)
      } else {
        sftp.fastPut(local, origin, function (err, result) {
          conn.end()
          let time = new Date().toLocaleString()
          if (!err) {
            console.log('time:' + time + '---' + local + '---watch-ok')
          } else {
            console.log('time:' + time + '---' + local + '---watch-failure')
          }
        })
      }
    })
  })
}

/**
 * 上传本地指定文件夹内容到远程目录
 * @param {本地路径} local
 * @param {远程路径} origin
 */
function UploadDir(
  local = './code/themes/eweb/htdocs/luci-static/eweb',
  origin = '/www/luci-static/eweb'
) {
  let _local = path.resolve(local)
  let _localReal = _local.replace(/\\/g, '/')
  const { files, dirs } = findSync(_local)
  let count = files.length
  ssh.createDir(SERVER, _local, origin, dirs, function () {
    ssh.Connect(SERVER, function (conn) {
      conn.sftp(function (err, sftp) {
        if (err) {
          console.log(err)
        } else {
          files.forEach(file => {
            ; (function (f) {
              let originP = f.replace(_localReal, origin)
              sftp.fastPut(f, originP, function (err, result) {
                count--
                if (count === 0) {
                  conn.end()
                }
                let time = new Date().toLocaleString()
                if (err) {
                  console.log('time:' + time + '---' + f + '------failure')
                } else {
                  console.log('time:' + time + '---' + f + '------ok')
                }
              })
            })(file)
          })
        }
      })
    })
  })
}
exports.UploadFile = UploadFile
exports.findSync = findSync
exports.UploadDir = UploadDir
