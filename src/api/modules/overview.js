import * as api from './api'
/**
 * 首页信息接口
 */

//  接口流量信息
export const interfaceFlow = () => {
  return api.cmd(
    'devSta.get',
    { module: 'flow', data: 'interface_info' },
    { isSilence: true }
  )
}

//  IP流量信息
export const userFlow = (isSilence = false) => {
  return api.cmd(
    'devSta.get',
    { module: 'flow', data: 'user_info' },
    { isSilence }
  )
}

//  用户信息（有线/无线）
export const userList = (isSilence = false) => {
  return api.cmd(
    'devSta.get',
    { module: 'user_list', data: { devType: 'all', dataType: 'timely' } },
    { isSilence, noParse: true }
  )
}

//  设备系统信息
export const sysInfo = () => {
  return api.cmd('devSta.get', { module: 'sysinfo' })
}

//  设置设备系统信息
export const setSysInfo = data => {
  return api.cmd('devSta.set', { module: 'sysinfo', data })
}
//  获取设备工作模式
// export const getDevMode = _ => {
//   return api.cmd('devSta.get', { module: 'dev_mode' })
// }
//  设置设备工作模式
export const setDevMode = (data, isSilence = true) => {
  return api.cmd('devSta.set', { module: 'dev_mode', data }, { timeout: 0, isSilence })
}

//  设备内存等信息
export const deviceInfo = () => {
  return api.overview('getDeviceInfo', null, { isSilence: true })
}

// 端口信息列表
export const portStatus = () => {
  return api.cmd('devSta.get', { module: 'port_status' }, { isSilence: true })
}

// 用户数
export const userCount = () => {
  return api.overview('getUserCount', null, { isSilence: true })
}

// 获取wds信息
export const wdsInfo = () => {
  return api.overview('getWdsInfo', null, { isSilence: true })
}

// 获取hostname
export const getHostName = () => {
  return api.overview('getHostName', null, { isSilence: true })
}

// 设置hostname
export const setHostName = (params) => {
  return api.cmd(
    'devConfig.set', {
    module: 'hostName',
    data: params
  }, {
    timeout: 0,
    isSilence: true
  }
  ).then(d => {
    if (window.top.$$MASTER_WINDOW) {
      try {
        window.top.$$MASTER_WINDOW.postMessage({ value: params.name, sn: params.sn[0], type: 'ewebHostname' }, '*')
      } catch (error) {

      }
    }
    return d
  })
}
