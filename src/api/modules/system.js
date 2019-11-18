import * as api from './api'

/**
 * 获取版本信息
 */
export const getVersion = version => {
  return api.system('getVersion', version, { isSilence: true })
}

/**
 * 获取设备同步时间
 * @param {配置时间：时间戳} time
 */
export const asyncTime = () => {
  return api.system('asyncTime', null, { isSilence: true })
}

/**
 * 设置设备同步时间
 * @param {配置时间：时间戳} time
 */
export const setSysTime = data => {
  return api.common('setSysTime', data)
}

/**
 * 获取session时间
 */
export const getSessiontime = () => {
  return api.system('getSessiontime')
}

/**
 * 重启
 */
export const reboot = () => {
  return api.system('reboot')
}

/**
 * 获取定时重启
 */
export const getTimeReboot = () => {
  return api.cmd('acConfig.get', {
    module: 'timeReboot'
  })
}

/**
 * 设置定时重启
 */
export const setTimeReboot = data => {
  return api.cmd('acConfig.set', {
    module: 'timeReboot',
    data
  })
}

/**
 * 检测是否有备份文件
 */
export const hasBackupFile = () => {
  return api.system('hasBackupFile', null, { isSilence: true })
}
/**
 * 恢复备份文件
 */
export const restoreConfig = (path) => {
  return api.system('restoreConfig', path)
}
/**
 * 删除备份文件
 */
export const delRestoreConfig = (path) => {
  return api.system('delRestoreConfig', path)
}
