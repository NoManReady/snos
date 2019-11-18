import * as api from './api'

/**
 * 获取ARP列表信息
 */
export const getArpTable = () => {
  return api.network('getArpTable')
}

/**
 * 获取静态ARP列表信息
 */
export const getStaticArpTable = () => {
  return api.cmd('devConfig.get', {
    module: 'arp_static'
  })
}

/**
 * 是否启用ARP-MAC
 */
export const setArpmacBind = (enable = '1') => {
  return api.cmd('devConfig.update', {
    module: 'arp_static',
    data: { bind_enable: enable }
  })
}

/**
 * 增加静态ARP列表信息
 */
export const addStaticArpTable = (data) => {
  return api.cmd('devConfig.add', {
    module: 'arp_static',
    data
  })
}

/**
 * 删除静态ARP列表信息
 */
export const delStaticArpTable = (data) => {
  return api.cmd('devConfig.del', {
    module: 'arp_static',
    data
  })
}

/**
 * 修改静态ARP列表信息
 */
export const updateStaticArpTable = (data) => {
  return api.cmd('devConfig.update', {
    module: 'arp_static',
    data
  })
}

/**
 * 获取MAC地址过滤
 */
export const getMacFilter = () => {
  return api.cmd('devConfig.get', {
    module: 'mac_filter'
  })
}

/**
 * 增加静态ARP列表信息
 */
export const addMacFilter = (macList) => {
  return api.cmd('devConfig.add', {
    module: 'mac_filter',
    data: { macList }
  })
}

/**
 * 删除静态ARP列表信息
 */
export const delMacFilter = (macList) => {
  return api.cmd('devConfig.del', {
    module: 'mac_filter',
    data: { macList }
  })
}

/**
 * 修改静态ARP列表信息
 */
export const updateMacFilter = (data) => {
  return api.cmd('devConfig.update', {
    module: 'mac_filter',
    data
  })
}