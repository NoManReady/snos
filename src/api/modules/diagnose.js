import * as api from './api'

/**
 * 获取系统日志
 */
export const getSysLog = filter => {
  return api.diagnose('getSysLog', filter)
}
/**
 * 开始网络测速
 */
export const setSpeedTest = params => {
  return api.cmd(
    'devSta.set',
    { module: 'speedtest', data: params },
    { isSilence: true }
  )
}
/**
 * 获取网络测速结果
 */
export const getSpeedTest = () => {
  return api.cmd(
    'devSta.get',
    { module: 'speedtest' },
    { isSilence: true }
  )
}

/**
 * 获取自检url
 */
export const getWebUrl = () => {
  return api.system('getWebUrl', null, { isSilence: true })
}

/**
 * 开始设备自检
 */
export const startCheck = netState => {
  return api.system('startCheck', netState, { isSilence: true })
}

/**
 * 获取设备自检结果
 */
export const getCheckResult = () => {
  return api.system('getCheckResult', null, { isSilence: true })
}

/**
 * 获取诊断告警信息
 */
export const getAlarm = () => {
  return api.cmd(
    'devSta.get',
    { module: 'alarm_mngt' }
  )
}
/**
 * 删除告警
 */
export const delAlarm = (id) => {
  return api.cmd(
    'devSta.set',
    {
      module: 'alarm_mngt',
      data: {
        opt: 'del',
        id: id
      }
    }
  )
}
/**
 * 获取诊断告警字典
 */
export const getAlarmMap = () => {
  return api.cmd(
    'devSta.get',
    { module: 'alarm_map' }
  )
}
/**
 * 获取取消关注的告警
 */
export const getAlarmUpload = () => {
  return api.cmd(
    'devConfig.get',
    { module: 'alarm_upload' }
  )
}
/**
 * 设置取消关注的告警
 */
export const updateAlarmUpload = (data) => {
  return api.cmd(
    'devConfig.update',
    { module: 'alarm_upload', data }
  )
}