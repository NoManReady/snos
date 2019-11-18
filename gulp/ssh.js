'use strict'
let ssh2 = require('ssh2')
let util = require('util')
let events = require('events')
let Client = require('ssh2').Client
let fs = require('fs')
let path = require('path')
let async = require('async')

/**
 * 描述：连接远程电脑
 * 参数：server 远程电脑凭证；then 回调函数
 * 回调：then(conn) 连接远程的client对象
 */
function Connect(server, then) {
  let conn = new Client()
  conn
    .on('ready', function() {
      then(conn)
    })
    .on('error', function(err) {
      console.log(err)
    })
    .on('end', function() {
      console.log('connect end!')
    })
    .on('close', function(had_error) {
      console.log('connect close')
    })
    .connect(server)
}

/**
 * 描述：运行shell命令 exec同
 * 参数：server 远程电脑凭证；cmd 执行的命令；then 回调函数
 * 回调：then(err, data) ： data 运行命令之后的返回数据信息
 */
function Shell(server, cmd, then) {
  Connect(server, function(conn) {
    conn.shell(function(err, stream) {
      if (err) {
        then(err)
      } else {
        let buf = ''
        stream
          .on('close', function() {
            conn.end()
            then(err, buf)
          })
          .on('data', function(data) {
            buf = buf + data
          })
          .stderr.on('data', function(data) {
            console.log('stderr: ' + data)
          })
        stream.end(cmd)
      }
    })
  })
}

/**
 * 描述：上传文件
 * 参数：server 远程电脑凭证；localPath 本地路径；remotePath 远程路径；then 回调函数
 * 回调：then(err, result)
 */
function UploadFile(server, localPath, remotePath, then) {
  Connect(server, function(conn) {
    conn.sftp(function(err, sftp) {
      if (err) {
        then(err)
      } else {
        sftp.fastPut(localPath, remotePath, function(err, result) {
          conn.end()
          then(err, result)
        })
      }
    })
  })
}

/**
 * 描述：控制上传或者下载一个一个的执行
 */
function Control() {
  events.EventEmitter.call(this)
}
util.inherits(Control, events.EventEmitter) // 使这个类继承EventEmitter

let control = new Control()

control.on('donext', function(todos, then) {
  if (todos.length > 0) {
    let func = todos.shift()
    func(function(err, result) {
      if (err) {
        throw err
        then(err)
      } else {
        control.emit('donext', todos, then)
      }
    })
  } else {
    then(null)
  }
})

/**
 * 描述：获取windows上的文件目录以及文件列表信息
 * 参数：destDir 本地路径，
 *       dirs 目录列表
 *       files 文件列表
 */
function GetFileAndDirList(localDir, dirs, files) {
  let dir = fs.readdirSync(localDir)
  for (let i = 0; i < dir.length; i++) {
    let p = path.join(localDir, dir[i])
    let stat = fs.statSync(p)
    if (stat.isDirectory()) {
      dirs.push(p)
      GetFileAndDirList(p, dirs, files)
    } else {
      files.push(p)
    }
  }
}

/**
 * 描述：创建远程目录
 * 参数：server 远程电脑凭证；
 *       localDir 本地路径，
 *       remotePath 远程路径；
 *       then 回调函数
 * 回调：then(err)
 */
function createDir(server, localDir, remoteDir, dirs, then) {
  // 创建远程目录
  let todoDir = []
  let shells = ''
  dirs.forEach(function(dir) {
    let to = remoteDir + dir.slice(localDir.length)
    shells = shells + 'touch -p ' + to + '\r\n'
  })
  todoDir.push(function(done) {
    console.log(shells)
    Shell(server, shells, done)
  })
  control.emit('donext', todoDir, function(err) {
    console.log('-----文件夹创建完毕，准备上传文件-----')
    then()
  })
}

exports.Connect = Connect
exports.createDir = createDir
exports.Shell = Shell
exports.UploadFile = UploadFile
