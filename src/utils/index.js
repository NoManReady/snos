import { Loading } from 'element-ui'
import timer from './timer'
import router from '@/router'
import store from '@/store'
import {
  getVersion,
  hasBackupFile,
  restoreConfig,
  delRestoreConfig,
} from '../api/modules/system'
import { system } from '../api/modules/api'
import { getNetworkNeighbor } from '../api/modules/network'
import Axios from 'axios'
import Vue from 'vue'
const vueInstance = new Vue()
/**
 * 去中心化
 * @param {上下文} requireContext
 * @param {排除文件} exinclude
 */
export const deCentralization = (
  requireContext,
  exinclude = /index/,
  fn = argv => argv
) => {
  const sourceMap = {}
  const paths = requireContext.keys().filter(p => {
    return !exinclude.test(p)
  })
  for (let p of paths) {
    const ss = fn(requireContext(p))
    for (let s in ss) {
      sourceMap[s] = ss[s]
    }
  }
  return sourceMap
}

/**
 * 去中心化(export default形式)
 * @param {上下文} requireContext
 */
export const deCentralizationUmd = (
  requireContext,
  fn = (a, b) => ({
    ...a,
    ...b
  })
) => {
  const sourceMap = (r => {
    return requireContext.keys().map(k => {
      return r(k).default
    })
  })(requireContext)
  return sourceMap.reduce(fn)
}

/**
 * 开发输出log
 * @param {消息} msg
 */
export const log = (...msg) => {
  if (process.env.NODE_ENV === 'development' && console && console.log) {
    console.log(...msg)
  }
}

/**
 * 获取style样式
 */
export const getStyle = (element, attr) => {
  let target
  // scrollTop 获取方式不同，不属于style，而且只有document.body才能用
  if (attr === 'scrollTop') {
    target = element.scrollTop
  } else if (element.currentStyle) {
    target = element.currentStyle[attr]
  } else {
    target = document.defaultView.getComputedStyle(element, null)[attr]
  }
  return target
}

/**
 * 重启模块
 * @param {重启模块} modules
 * @param {查询间隔} delay
 */
export const restart_modules = async (modules, delay = 3000) => {
  // let _loading = Loading.service({ text: '开始重启模块' })
  // await restart(modules)
  // let _module = await checkRestartStatus()
  // while (_module.status !== 'finish') {
  //   _module = _module.status.split('/').slice(-1)[0]
  //   _loading.text = `重启${_module}模块`
  //   await new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve()
  //     }, delay)
  //   })
  //   _module = await checkRestartStatus()
  // }
  // _loading.close()
}

/**
 * 检测是否可访问
 */
export const isLanOnline = host => {
  let _protocol = window.location.protocol
  if (host && host.indexOf(_protocol) !== 0) {
    host = _protocol + '//' + host
  }
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.src = `${host || process.env.PING}/luci-static/${
      process.env.THEME
      }/favicon.ico`
    img.onload = () => resolve(1)
    img.onerror = () => resolve(0)
  })
}

/**
 * 检测网络是否可用
 */
export const isNetEnable = (host, time = 10000) => {
  var instance = Axios.create()
  instance.defaults.timeout = time
  let _protocol = window.location.protocol
  if (host && host.indexOf(_protocol) !== 0) {
    host = _protocol + '//' + host
  }
  return instance
    .post(`${host || ''}${window.BASE_URI}/api/auth`, {
      method: 'checkNet'
    })
    .then(
      res => ({
        code: 1,
        res
      }),
      res => ({
        code: 0,
        res
      })
    )
    .catch(res => {
      return {
        code: 0,
        res
      }
    })
}

/**
 * 延迟指定时间
 * @param {延迟时间} delay
 */
export const sleep = (delay = 3000, text, p) => {
  let _loading
  if (text) {
    _loading = Loading.service({
      text
    })
  }
  return new Promise(resolve => {
    setTimeout(() => {
      _loading && _loading.close()
      resolve(p && p.cancel())
    }, delay)
  })
}

/**
 * 等待上线
 */
export const awaitOnLine = (
  time = 5000,
  text = '请耐心等待...',
  host,
  maxTry = 30
) => {
  let _loading = null
  if (text !== 0) {
    _loading = Loading.service({
      text
    })
  }
  timer.clean()
  return new Promise(async (resolve, reject) => {
    await sleep(time)
    let _res = await isNetEnable(host)
    maxTry--
    while (_res.code === 0 && maxTry) {
      await sleep()
      _res = await isNetEnable(host)
      maxTry--
    }
    _loading && _loading.close()
    if (!maxTry) {
      vueInstance.$msgbox({
        title: '提示',
        message: '网络访问超时，请检查网络是否可连通或尝试刷新页面。',
        type: 'error'
      })
      reject()
    } else {
      resolve()
    }
  })
}


/**
 * 等待上线
 */
export const awaitOnLine_plus = (
  { time = 5000,
    text = '请耐心等待...',
    host,
    maxTry = 30 }
) => {
  return awaitOnLine(time, text, host, maxTry)
}

/**
 * 检测是否有在线版本
 */
export const isOnlineVers = () => {
  return new Promise(async (resolve, reject) => {
    let data = await getVersion({
      deviceType: 'self'
    })

    if (typeof data.new === 'object') {
      if (data.new.totalCount) {
        let newVerData =
          (data.new.firmwareList && data.new.firmwareList[0]) || {}
        let newVersion = newVerData.versionCode

        if (newVersion.trim() != data.cur.trim()) {
          resolve(true)
        }
      }
    }
    resolve(false)
  })
}

export const getOnlineVers = async () => {
  let form = {
    curVersion: '',
    newVersion: '',
    versionDesc: '',
    // '1、增加双WAN口工功能，支持负载均衡和运营商选路<br />2、增加营销认证功能，支持微信连WiFi、短信认证、一键认证<br />3、支持流控<br/>4、休息休息<br/>5、很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长<br/>6、aaaaaaaaaaaa',
    hasNewVersion: false,
    downloadPath: ''
  }
  let data = await getVersion({ deviceType: 'self' })

  form.curVersion = data.cur || ''
  if (typeof data.new === 'object') {
    if (data.new.totalCount) {
      let newVerData = (data.new.firmwareList && data.new.firmwareList[0]) || {}

      let newVersion = newVerData.versionCode

      if (newVersion.trim() != form.curVersion.trim()) {
        form.newVersion = newVersion
        form.versionDesc = newVerData.releaseNotes || '暂无描述'
        form.downloadPath = newVerData.downloadUrlTar
        form.hasNewVersion = true
      } else {
        form.curVersion += '(当前已是最新版本)'
      }
    } else {
      form.curVersion += '(当前已是最新版本)'
    }
  }
  return form
}

export const upgradeOnlineVers = async _vers => {
  await vueInstance.$confirm(
    `1、在线升级会保留当前配置<br/><span class="c-danger">2、升级过程中会重启设备</span><br/>3、升级时请不要刷新或关闭浏览器，升级成功会自动跳转到登录页。`,
    `确认升级提示`,
    {
      // type: 'warning',
      showClose: false,
      cancelButtonText: '取消升级',
      confirmButtonText: '知道了，升级吧',
      closeOnClickModal: false,
      dangerouslyUseHTMLString: true
    }
  )
  if (!_vers.downloadPath) {
    return vueInstance.$alert('未获取到最新版本，请重新获取')
  }

  system('upgradeConfirm', {
    path: _vers.downloadPath,
    isPersist: true
  })
    .then(d => {
      awaitOnLine(60000, '正在升级设备...', null, 50).then(() => {
        window.top.location.reload()
      })
    })
}

let NOTICE = null
// 跳转在线升级页面
const _onOnlineUpgrade = () => {
  router.push({
    name: 'admin/alone/systool_upgrade',
    query: {
      tab: '0'
    }
  })
  NOTICE.close()
}
// 检测是否有在线版本
export const loadOnlineVers = async () => {
  let _vers = await getOnlineVers()

  if (_vers.hasNewVersion) {
    let _htmlArr = [
      '<div class="c-danger fs16">建议升级到最新版本！</div>',
      `<div class="mt5"><label class="fl">新版本号：</label><div style="margin-left: 70px;">${
      _vers.newVersion
      }</div>`,
      `<div class="mt5"><label class="fl">版本说明：</label><pre style="margin-left: 70px; font-family: inherit;">${
      _vers.versionDesc
      }</pre>`
    ]
    await vueInstance.$confirm(_htmlArr.join(''), `发现有新版本`, {
      // type: 'warning',
      showClose: false,
      cancelButtonText: '暂不升级',
      confirmButtonText: '马上升级（推荐）',
      closeOnClickModal: false,
      dangerouslyUseHTMLString: true,
      customClass: 'w500'
    })
    upgradeOnlineVers(_vers)
  }
}
let MESSAGE = null
// 跳转编辑冲突页
const _onEditConflict = () => {
  router.push({
    name: 'admin/network_neighbor'
  })
  MESSAGE.close()
}
// 网络组信息
export const loadNetworkNeighbor = async () => {
  //       1. 只有新设备：提示发现新设备，点击去处理。
  //       2. 有别的网络：提示发现不属于本网络管理的设备，点击去处理
  if (MESSAGE && MESSAGE.close) {
    MESSAGE.close()
  }
  getNetworkNeighbor(true).then(d => {
    if (d.conflict) {
      let _jsx = null,
        msg = ''
      if (d.curNetwork.networkId !== '0' && !!d.networkIds['0']) {
        msg = '发现新设备，'
      } else {
        msg = '发现不属于本网络管理的设备，'
      }
      _jsx = new Vue({
        functional: true,
        render(h) {
          return (
            <p>
              {msg}
              <a
                class="f-theme fs15"
                href="javascript:void(0);"
                onClick={_onEditConflict}
              >
                点击去处理
              </a>
            </p>
          )
        }
      }).$mount()
      MESSAGE = vueInstance.$notify({
        duration: 0,
        title: '提示',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        showClose: true,
        onClose: () => (MESSAGE = null),
        message: _jsx._vnode
      })
    }
  })
}
export const checkBackupFile = async () => {
  if (!store.getters.roles.includes('egw')) {
    // EGW才检测是否有备份文件
    return false
  }
  let d = await hasBackupFile()
  if (d.hasfile) {
    vueInstance
      .$confirm(
        `检测到设备上存有备份文件，是否进行恢复？<div class="c-danger">（注意：恢复过程会重启）</div>`,
        '提示',
        {
          type: 'info',
          showClose: false,
          cancelButtonText: '删除备份',
          confirmButtonText: '恢复备份',
          closeOnClickModal: false,
          dangerouslyUseHTMLString: true
        }
      )
      .then(
        async () => {
          let res = await restoreConfig(d.path)
          if (res.addr) {
            awaitOnLine(10000, '配置恢复中...').then(() => {
              window.top.location.reload()
            })
          } else if (res.msg.includes('not supports')) {
            vueInstance
              .$confirm(
                `备份文件不支持当前设备，请检查备份文件是否损坏。`,
                '提示',
                {
                  type: 'warning',
                  showClose: false,
                  cancelButtonText: '暂不处理',
                  confirmButtonText: '删除备份',
                  closeOnClickModal: false,
                  dangerouslyUseHTMLString: true
                }
              )
              .then(() => {
                delRestoreConfig(d.path)
                vueInstance.$message.success('删除备份成功')
              })
          }
        },
        () => {
          delRestoreConfig(d.path)
          vueInstance.$message.success('删除备份成功')
        }
      )
      .catch(() => { })
  }
}
