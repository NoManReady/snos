import * as api from './api'

/**
 * 获取IP-SEC安全策略 配置
 */
export const getIpSec = () => {
  return api.cmd('devSta.get', {
    module: 'ipsec',
    data: {
      func: 'ipsec_get_cfg'
    }
  })
}

/**
 * 设置 IP-SEC安全策略 配置
 * opt : String   'add' | 'delete' | 'modify
 */
export const setIpSec = (opt = 'add', data) => {
  return api.cmd('devConfig.set', {
    module: 'ipsec',
    async: true,
    data: {
      func: 'ipsec_set_cfg',
      op: opt,
      data
    }
  })
}
/**
 * 获取 IP-SEC连接 配置
 */
export const getIpSecSa = () => {
  return api.cmd('devSta.get', {
    module: 'ipsec',
    data: {
      func: 'ipsec_get_sa'
    }
  })
}

/**
 * 获取L2TP服务器 配置
 */
export const getL2tpSer = () => {
  return api.cmd('devConfig.get', {
    module: 'l2tp_server'
  })
}

/**
 * 设置 L2TP服务器 配置
 * data : L2TP服务器配置参数
 */
export const setL2tpSer = (data) => {
  return api.cmd('devConfig.set', {
    module: 'l2tp_server',
    async: true,
    data
  })
}
/**
 * 获取PPTP服务器 配置
 */
export const getPptpSer = () => {
  return api.cmd('devConfig.get', {
    module: 'pptp_server'
  })
}

/**
 * 设置 PPTP服务器 配置
 * data : PPTP服务器配置参数
 */
export const setPptpSer = (data) => {
  return api.cmd('devConfig.set', {
    module: 'pptp_server',
    async: true,
    data
  })
}
/**
 * 获取PPTP客户端 配置
 */
export const getPptpClient = () => {
  return api.cmd('devConfig.get', {
    module: 'pptp_client'
  })
}

/**
 * 设置 PPTP客户端 配置
 * data : PPTP客户端配置参数
 */
export const setPptpClient = (data) => {
  return api.cmd('devConfig.update', {
    module: 'pptp_client',
    async: true,
    data
  })
}
/**
 * 获取 PPTP客户端 全局设置
 */
export const getPptpClientGlobal = () => {
  return api.cmd('devConfig.get', {
    module: 'pptp_lcp_client_interval'
  })
}
/**
 * 设置 PPTP客户端 全局设置
 */
export const setPptpClientGlobal = (data) => {
  return api.cmd('devConfig.set', {
    module: 'pptp_lcp_client_interval',
    data
  })
}
/**
 * 获取 L2TP客户端 全局设置
 */
export const getL2tpClientGlobal = () => {
  return api.cmd('devConfig.get', {
    module: 'l2tp_lcp_client_interval'
  })
}
/**
 * 设置 L2TP客户端 全局设置
 */
export const setL2tpClientGlobal = (data) => {
  return api.cmd('devConfig.set', {
    module: 'l2tp_lcp_client_interval',
    data
  })
}
/**
 * 获取 L2TP客户端 配置
 */
export const getL2tpClient = () => {
  return api.cmd('devConfig.get', {
    module: 'l2tp_client'
  })
}
/**
 * 增加 L2TP客户端
 */
export const setL2tpClient = (data, isAdd = true) => {
  return api.cmd(`devConfig.${isAdd ? 'add' : 'update'}`, {
    module: 'l2tp_client',
    async: true,
    data
  })
}
/**
 * 删除 L2TP客户端
 */
export const delL2tpClient = (data) => {
  return api.cmd('devConfig.del', {
    module: 'l2tp_client',
    async: true,
    data
  })
}
/**
 * 获取 L2TP隧道信息列表
 */
export const getL2tpChannel = () => {
  return api.cmd('devSta.get', {
    module: 'l2tp_channelInfo'
  })
}
/**
 * 踢下线 L2TP隧道信息列表
 */
export const delL2tpChannel = (data) => {
  return api.cmd('devSta.del', {
    module: 'l2tp_channelInfo',
    data
  })
}
/**
 * 获取 PPTP隧道信息列表
 */
export const getPptpChannel = () => {
  return api.cmd('devSta.get', {
    module: 'pptp_channelInfo'
  })
}
/**
 * 踢下线 PPTP隧道信息列表
 */
export const delPptpChannel = (data) => {
  return api.cmd('devSta.del', {
    module: 'pptp_channelInfo',
    data
  })
}
/**
 * 获取 IP地址池 配置
 */
export const getIpPool = () => {
  return api.cmd('devSta.get', {
    module: 'ippool'
  })
}
/**
 * 增加 IP地址池
 */
export const setIpPool = (data, isAdd = true) => {
  return api.cmd(`devConfig.${isAdd ? 'add' : 'update'}`, {
    module: 'ippool',
    async: true,
    data
  })
}
/**
 * 删除 IP地址池
 */
export const delIpPool = (data) => {
  return api.cmd('devConfig.del', {
    module: 'ippool',
    async: true,
    data
  })
}

/**
 * 设置用户管理
 */
export const setVpnUser = (data, isAdd = true) => {
  return api.cmd(`devConfig.${isAdd ? 'add' : 'update'}`, {
    module: 'vpn_user',
    async: true,
    data
  })
}
/**
 * 删除 用户管理
 */
export const delVpnUser = (data) => {
  return api.cmd('devConfig.del', {
    module: 'vpn_user',
    async: true,
    data
  })
}
/**
 * 获取用户管理
 */
export const getVpnUser = (data) => {
  return api.cmd('devConfig.get', {
    module: 'vpn_user',
    async: true,
    data
  })
}
