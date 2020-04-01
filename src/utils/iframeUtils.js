import md5 from 'md5'
import router from '@/router'
import bus from '@/utils/bus'
import store from '@/store'
const master = window.APP_MASTER || store.getters.master

// 获取特权通道MD5值
const _getMd5 = (sn, ip, time) => {
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
  initpath = window.top.INITPATH || 'admin', // 顶层指定或默认到admin下的第一个菜单（整网概览）
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
  let _ver = vers.replace(/.*(P|R)(2|3|4|5|6|7|8|9).*Release\((\d+)\)/, '$3')
  return +_ver > 6223023 // 2019-10-30 23点后的版本才支持
}

/**
 * 显示本机（网关/设备）管理的统一入口
 * @{sn, ip, initpath}, 特权通道和初始化页面
 * @from 触发源组件，出问题时定位事件来源
 * @sysinfo 系统信息  根据系统信息跳转到不同页面/弹出详情页。
 *          EG(路由模式) 或者 NBR  跳转到【网关管理】页
 *          EAP 或者 EG(AC模式) 跳转到【AP列表】页
 *          MSW跳转到【交换机管理】页
 */
export const popDevDetail = (sysinfo, from = 'UNKONWN', initpath = false) => {
  if (!sysinfo) {
    sysinfo = window.top.APP_SYSINFO || store.getters.sysinfo
  }
  let forwardMode = sysinfo.forwardMode || 'AP'
  let sn = sysinfo.serial_num || sysinfo.serialNumber || sysinfo.sn || ''
  let ip = sysinfo.auth_ip || sysinfo.ip || ''
  let product = (sysinfo.product || sysinfo.productType || 'eap').toUpperCase()
  let _showPop = false

  if (!initpath) {
    if (forwardMode === 'ROUTER' && ['EGW', 'EWR'].includes(product)) {// EG做路由模式
      let _isSlaveEg = sysinfo.hasAc || window !== window.top // 存在AC时或是内嵌页面时说明当前是从模式
      initpath = _isSlaveEg ? 'admin/slave_eg' : 'admin/alone'
    } else {
      if (product === 'EGW' && forwardMode !== 'AC') {
        initpath = 'admin/slave_eg' // 从EG
      } else if (product === 'GW_RGOS') {
        initpath = 'admin/nbr' // NBR
      } else {
        // 其他情况，如交换机/EAP/AC(网关的AC模式)， 跳转到对应页面后再弹出设备详情页
        const _PATH_MAP = {
          AC: 'admin/wifi/wifi_ap',
          EAP: 'admin/wifi/wifi_ap',
          MSW: 'admin/switch_list'
        }
        initpath = _PATH_MAP[product] || _PATH_MAP[forwardMode]
        _showPop = true
      }
    }
  }

  let _hasLocalPage = router.getMatchedComponents({ name: initpath }).length > 0
  if (_hasLocalPage) {
    // 本地路由存在目标页面时，本地路由跳转
    router.push({ name: initpath })
  }
  // 弹出单台设备详情
  if (_showPop) {
    if (router.currentRoute.name === initpath) {
      return _popDevDetail(ip, sn, from)
    }
    setTimeout(() => {
      _popDevDetail(ip, sn, from)
    }, 1000);
  }
}
function _popDevDetail(ip, sn, from) {
  bus.$emit('popDevDetail', {
    from: from,
    devConfig: {
      ip, sn, initpath: 'admin/alone', menuMode: 'none'
    }
  })
}

