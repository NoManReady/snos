import md5 from 'md5'
import router from '@/router'
import bus from '@/utils/bus'
const master = window.APP_MASTER || this.$store.getters.master

// 获取特权通道MD5值
const _getMd5 = (sn, ip, time = this.nowTime) => {
  return md5(`RjYkhwzx$2018!${time}${sn}${ip}`)
}

/**
 * 内嵌iframe为主AC的访问地址
 * 地址带如下参数：
 * @initPath 登录系统的初始显示页面的路由
 * @menuMode 菜单显示方式 水平/竖直/不显示菜单  "horizontal" | "vertical" | "none"
 * @hideHead 是否显示页头栏
 * @auth     特权通道密码
 * @snosRed  代理标识
 *
 * @isSnosUrl 标识url地址是否是代理地址
 **/
export const getIframeUrl = ({
  ip = master.ip || '10.44.77.253',
  sn = master.sn || '',
  initpath = 'admin', // 默认到admin下的第一个菜单（整网概览）
  menuMode = 'vertical',
  hideHead = 'false',
  time = Math.round(new Date().getTime() / 1000)
} = {}, isSnosUrl = true) => {
  let snosRed = `snos_red_${ip}`
  let auth = _getMd5(sn, ip, time)
  // 开发测试
  // if (process.env['NODE_ENV'] === 'development') {
  //   return `${location.protocol}//192.168.110.136:9000/cgi-bin/luci/;stok=iframe?menuMode=vertical`
  //   return `${location.protocol}//192.168.110.136:9000/cgi-bin/luci/;stok=iframe?hideHead=true&menuMode=none&initpath=admin/alone/homepage`
  // }
  let _preUrl
  let _isLocal = window.top.APP_SYSINFO && window.top.APP_SYSINFO.serial_num === sn
  if (_isLocal) {
    _preUrl = `${window.top.location.origin}`
    _preUrl += `/cgi-bin/luci/;stok=iframe?auth=${auth}`
  } else {
    if (isSnosUrl) {
      _preUrl = `${location.protocol}//${location.host}/${snosRed}`
    } else {
      _preUrl = `${location.protocol}//${ip}`
    }
    _preUrl += `/cgi-bin/luci/;stok=iframe?auth=${auth}`
    if (isSnosUrl) {
      _preUrl += `&snosRed=/${snosRed}`
    }
  }
  return `${_preUrl}&hideHead=${hideHead}&menuMode=${menuMode}&initpath=${initpath}&time=${time}`
}

// 判断（主设备）版本号是否是支持整网配置（内嵌iframe）
export const isNewVersion = (vers) => {
  let _ver = vers.replace(/.*(P|R)2.*Release\((\d+)\)/, '$2')
  return +_ver > 6223023 // 2019-10-30 30点后的版本才支持
}

/**
 * 显示本机（网关/设备）管理的统一入口
 * @{sn, ip, initpath}, 特权通道和初始化页面
 * @from 触发源组件，出问题时定位事件来源
 * @productType 设备类型  egw直接跳转到网关管理页；eap跳转到AP列表页；msw跳转到交换机管理页
 */
export const popDevDetail = ({ sn, ip, initpath = 'admin/alone' }, from = '', productType = false) => {
  let _time = 0
  if (productType) {
    productType = productType.toLocaleLowerCase()
    const _PATH_MAP = {
      egw: initpath,
      eap: 'admin/wifi/wifi_ap',
      msw: 'admin/switch_list'
    }
    let _pathname = _PATH_MAP[productType]
    if (_pathname && (router.currentRoute.name !== _pathname)) {
      router.push({ name: _pathname })
      _time = 1000
    }
  }

  if (productType !== 'egw') {  // 只有网关设备有本机管理
    setTimeout(() => {
      bus.$emit('popDevDetail', {
        from: from,
        devConfig: {
          ip, sn, initpath, menuMode: 'none'
        }
      })
    }, _time);
  }
}

