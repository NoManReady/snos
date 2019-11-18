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
 * 获取 隧道信息列表
 */
export const getL2tpChannel = () => {
  return api.cmd('devSta.get', {
    module: 'l2tp_channelInfo'
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
