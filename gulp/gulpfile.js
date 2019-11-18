let gulp = require('gulp')
let del = require('del')
let path = require('path')
let fs = require('fs')
let fileUtil = require('./file.js')

const BASE_DIR_BACK = './luci/modules/eweb/luasrc'
const BASE_DIR_BACK_ORIGIN = '/usr/lib/lua/luci'

const BASE_DIR_FRONT = './luci/themes/eweb/htdocs/luci-static/eweb'
const BASE_DIR_FRONT_ORIGIN = '/www/luci-static/eweb'

gulp.task('clean', function () {
  del(['./luci/eweb/*'])
})

/**
 * 上传静态目录
 */
gulp.task('static', function (done) {
  fileUtil.UploadDir(BASE_DIR_FRONT, BASE_DIR_FRONT_ORIGIN)
  done()
})

/**
 * 上传view
 */
gulp.task('view', function (done) {
  fileUtil.UploadDir(`${BASE_DIR_BACK}/view`, `${BASE_DIR_BACK_ORIGIN}/view`)
  done()
})

/**
 * 上传lua
 */
gulp.task('lua', function (done) {
  fileUtil.UploadDir(
    `${BASE_DIR_BACK}/controller`,
    `${BASE_DIR_BACK_ORIGIN}/controller`
  )
  done()
})

/**
 * 上传luasrc
 */
gulp.task('luasrc', function (done) {
  fileUtil.UploadDir(BASE_DIR_BACK, `${BASE_DIR_BACK_ORIGIN}`)
  fileUtil.UploadDir(`./luci/themes/eweb/luasrc/view`, `${BASE_DIR_BACK_ORIGIN}/view`)
  done()
})
/**
 * 上传modules
 */
gulp.task('modules', function (done) {
  fileUtil.UploadDir(
    `${BASE_DIR_BACK}/modules`,
    `${BASE_DIR_BACK_ORIGIN}/modules`
  )
  done()
})

gulp.task('watchlua', function (done) {
  let watchMap = [{
    w: `${BASE_DIR_BACK}/controller`,
    r: `${BASE_DIR_BACK_ORIGIN}/controller`
  },
  {
    w: `${BASE_DIR_BACK}/modules`,
    r: `${BASE_DIR_BACK_ORIGIN}/modules`
  },
  {
    w: `${BASE_DIR_BACK}/view`,
    r: `${BASE_DIR_BACK_ORIGIN}/view`
  },
  {
    w: `${BASE_DIR_BACK}/utils`,
    r: `${BASE_DIR_BACK_ORIGIN}/utils`
  },
  {
    w: `${BASE_DIR_BACK}/webconfig`,
    r: `${BASE_DIR_BACK_ORIGIN}/webconfig`
  }
    // {
    //   w: BASE_DIR_FRONT,
    //   r: BASE_DIR_FRONT_ORIGIN
    // }
  ]
  watchMap.forEach(function (m) {
    watchAndUpload(m)
  })
  done()
})

/**
 * 创建gulp监听并上传该文件
 * @param {Object} m
 */
function watchAndUpload(m) {
  // 监听文件夹（相对路径）
  let _wDir = m.w
  // 远程文件夹
  let _rDir = m.r
  // 本地文件夹路径（绝对路径）
  let _wRealDir = path.resolve(_wDir).replace(/\\/g, '/')
  // 创建监听，并回调改变的文件对象event
  let watcher = gulp.watch(_wDir + '/**/*')
  watcher.on("change", function (pa, stats) {
    // 改变文件的绝对路径
    var _local = path.resolve(pa).replace(/\\/g, '/')
    // 改变文件的远程绝对路径
    var _origin = _local.replace(_wRealDir, _rDir)
    // 上传该文件
    fileUtil.UploadFile(_local, _origin)
  })
}

var imagemin = require('gulp-imagemin')
var pngquant = require('imagemin-pngquant')

gulp.task('imagemin', function () {
  return gulp
    .src(['./assets/*'])
    .pipe(
      imagemin({
        interlaced: false,
        progressive: false,
        optimizationLevel: 3,
        use: [pngquant()],
        svgoPlugins: [{
          removeViewBox: true
        }]
      })
    )
    .pipe(gulp.dest('./dist'))
})


// 执行所有任务
gulp.task('default', gulp.parallel('static', 'luasrc'))