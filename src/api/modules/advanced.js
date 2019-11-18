import * as api from './api'

/**
 * 获取策略路由列表
 */
export const getRoutePolicy = () => {
  return api.cmd(
    'devSta.get',
    { module: 'policy_route' }
  )
}

/**
 * 增删改策略路由
 */
export const setRoutePolicy = (params, opt = 'set', async = false) => {
  return api.cmd(
    `devConfig.${opt}`,
    { module: 'policy_route', async, data: params }
  )
}

/**
 * 上移/下移策略路由
 */
export const setRoutePolicySort = (name, opt = "down") => {
  return api.cmd(
    'devConfig.update',
    { module: 'policy_route', data: { opt: opt, rulename: name } }
  )
}

/**
 * 获取路由列表可达状态
 */
export const getRoutesSta = (isSilence = false) => {
  return api.cmd('devSta.get', { module: 'static_route' }, { isSilence })
}

/**
 * 获取路由列表
 */
export const getRoutes = () => {
  return api.cmd('devConfig.get', { module: 'static_route' })
}

/**
 * 添加路由列表
 */
export const addRoutes = (data) => {
  return api.cmd('devConfig.add', { module: 'static_route', data })
}

/**
 * 编辑路由列表
 */
export const updateRoutes = (data) => {
  return api.cmd('devConfig.update', { module: 'static_route', data })
}

/**
 * 删除路由列表
 */
export const delRoutes = (list) => {
  return api.cmd('devConfig.del', { module: 'static_route', data: { list } })
}


/**
 * 设置路由列表
 */
export const setRoutes = (params, async = false) => {
  return api.cmd(
    'devConfig.set',
    { module: 'static_route', data: params, async },
    { timeout: 0 }
  )
}

/**
 * 获取接口列表
 */
export const getIfaceTypes = () => {
  return api.network('getIfaceTypes', null, { isSilence: true })
}

/**
 * 获取动态dns花生壳
 */
export const getPhdDnsSta = () => {
  return api.cmd(
    'devSta.get',
    { module: 'phddns' },
  )
}

/**
 * 获取动态dns花生壳
 */
export const getPhdDns = () => {
  return api.cmd(
    'devConfig.get',
    { module: 'phddns' },
  )
}

/**
 * 设置动态dns花生壳
 */
export const setPhdDns = (params) => {
  return api.cmd(
    'devConfig.set',
    { module: 'phddns', data: params },
  )
}

/**
 * 获取端口映射列表
 */
export const getPortMapping = () => {
  return api.cmd('devConfig.get', { module: 'port_mapping' })
}

/**
 * 添加端口映射
 */
export const addPortMapping = (list) => {
  return api.cmd('devConfig.add', { module: 'port_mapping', data: { list } })
}

/**
 * 编辑端口映射
 */
export const updatePortMapping = (data) => {
  return api.cmd('devConfig.update', { module: 'port_mapping', data })
}

/**
 * 删除端口映射
 */
export const delPortMapping = (ruleName) => {
  return api.cmd('devConfig.del', { module: 'port_mapping', data: { ruleName } })
}


/**
 * 设置端口映射列表
 */
export const setPortMapping = params => {
  return api.cmd(
    'devConfig.set',
    { module: 'port_mapping', data: params },
    { timeout: 0 }
  )
}

/**
 * 获取macc营销认证
 */
export const getMaccAuth = () => {
  return api.cmd(
    'devSta.get',
    { module: 'app_auth', data: { func: "app_auth_get_macc" } },
    { timeout: 0 }
  )
}

/**
 * 设置macc营销认证
 */
export const setMaccAuth = (params, async = false) => {
  return api.cmd(
    'devConfig.set',
    { module: 'app_auth_macc', data: params, async },
    { timeout: 0 }
  )
}

/**
 * 获取认证策略
 */
export const getAuthRule = () => {
  return api.cmd(
    'devSta.get',
    { module: 'app_auth', data: { func: "app_auth_get_auth_rule" } },
    { timeout: 0 }
  )
}

/**
 * 设置认证策略
 */
export const setAuthRule = (params, async = false) => {
  return api.cmd(
    'devConfig.set',
    { module: 'app_auth_rule', data: params, async },
    { timeout: 0 }
  )
}

/**
 * 获取营销免认证
 */
export const getAuthLess = () => {
  return api.cmd(
    'devSta.get',
    { module: 'app_auth', data: { func: "app_auth_get_whitelist" } },
    { timeout: 0 }
  )
}

/**
 * 设置免认证用户
 */
export const setSrcip = (params, async = false) => {
  return api.cmd(
    'devConfig.set',
    { module: 'app_auth_direct_srcip', data: params, async },
    { timeout: 0 }
  )
}

/**
 * 设置免认证外网IP
 */
export const setDstip = (params, async = false) => {
  return api.cmd(
    'devConfig.set',
    { module: 'app_auth_direct_dstip', data: params, async },
    { timeout: 0 }
  )
}

/**
 * 设置URL白名单
 */
export const setDirectUrl = (params, async = false) => {
  return api.cmd(
    'devConfig.set',
    { module: 'app_auth_direct_url', data: params, async },
    { timeout: 0 }
  )
}

/**
 * 设置用户MAC白名单
 */
export const setDirectMac = (params, async = false) => {
  return api.cmd(
    'devConfig.set',
    { module: 'app_auth_direct_mac', data: params, async },
    { timeout: 0 }
  )
}

/**
 * 设置用户MAC黑名单
 */
export const setDenyMac = (params, async = false) => {
  return api.cmd(
    'devConfig.set',
    { module: 'app_auth_deny_mac', data: params, async },
    { timeout: 0 }
  )
}

/**
 * 获取在线用户
 */
export const getUserOnline = params => {
  return api.cmd(
    'devSta.get',
    { module: 'app_auth', data: { func: "app_auth_get_user_online" } },
    { timeout: 0 }
  )
}

/**
 * 设置在线用户
 */
export const setUserOnline = (params, async = false) => {
  return api.advanced('delAuthUser', { users: params })
}

/**
 * 获取智能流控
 */
export const getSmartFlow = () => {
  return api.advanced('getFlowSmart')
}
/**
 * 设置智能流控
 */
export const setSmartFlow = (params) => {
  return api.cmd(
    'devConfig.set',
    { module: 'flowctrl', data: params },
  )
}
/**
 * 获取自定义策略
 */
export const getPolicyFlow = (isSilence = false) => {
  return api.cmd(
    'devSta.get',
    { module: 'flowctrl_udp' },
    { isSilence }
  )
}
/**
 * 上移/下移策略流控
 */
export const setStrategySort = (name, opt = "down") => {
  return api.cmd(
    'devConfig.update',
    { module: 'flowctrl_udp', data: { opt: opt, rulename: name } }
  )
}
/**
 * 设置自定义策略
 */
export const setPolicyFlow = (params, opt='add', async = false) => {
  return api.cmd(
    `devConfig.${opt}`,
    { module: 'flowctrl_udp', data: params, async },
  )
}
/**
 * 获取IP连接数限制
 */
export const getIpConn = () => {
  return api.cmd(
    'devConfig.get',
    { module: 'ip_connlimit' },
  )
}

/**
 * 添加IP连接数
 */
export const addIpConn = (list) => {
  return api.cmd(
    'devConfig.add',
    {
      module: 'ip_connlimit',
      data: { list }
    },
  )
}

/**
 * 编辑IP连接数
 */
export const updateIpConn = (data) => {
  return api.cmd(
    'devConfig.update',
    {
      module: 'ip_connlimit',
      data
    },
  )
}

/**
 * 删除IP连接数
 */
export const delIpConn = (information) => {
  return api.cmd(
    'devConfig.del',
    {
      module: 'ip_connlimit',
      data: { information }
    },
  )
}

/**
 * 设置IP连接数限制
 */
export const setIpConn = (params) => {
  return api.cmd(
    'devConfig.set',
    { module: 'ip_connlimit', data: params },
  )
}
/**
 * 整网管理重启
 */
export const setReboot = (params) => {
  return api.cmd(
    'devSta.set',
    { module: 'devReboot', data: params }
  )
}

/**
 * 整网管理恢复出厂并删除分组信息
 */
export const setReset = (params) => {
  return api.cmd(
    'devSta.set',
    { module: 'devReset', data: params }
  )
}

/**
 * 整网管理恢复出厂不删除分组信息
 */
export const setResetConfig = (params) => {
  return api.cmd(
    'devSta.set',
    { module: 'resetConfig', data: params }
  )
}

/**
 * 获取ACL
 */
export const getAcl = () => {
  return api.cmd(
    'devConfig.get',
    { module: 'acl' }
  )
}

/**
 * 获取ACL
 */
export const setAcl = (params) => {
  return api.cmd(
    'devConfig.set',
    { module: 'acl', data: params }
  )
}

/**
 * 获取账号认证
 */
export const getAccountAuth = () => {
  return api.cmd(
    'devSta.get',
    { module: 'guest_auth', data: { func: 'guest_auth_get_userinfo' } }
  )
}

/**
 * 设置账号认证
 */
export const setAccountAuth = (params) => {
  return api.cmd(
    'devConfig.set',
    { module: 'guest_auth', data: { func: 'user_pwd_cfg', name: 'user_pwd_auth', ...params } }
  )
}

/**
 * 设置账号认证（用户配置）
 */
export const setAccountAuthUser = (params) => {
  return api.cmd(
    'devConfig.set',
    { module: 'guest_auth', data: { func: 'user_pwd_manage', ...params } }
  )
}

/**
 * 获取访客授权信息
 */
export const getGuestAuth = () => {
  return api.cmd(
    'devSta.get',
    { module: 'guest_auth', data: { func: 'guest_auth_get_qrcode_passive_auth_cfg' } }
  )
}

/**
 * 设置访客授权信息
 */
export const setGuestAuth = (params) => {
  return api.cmd(
    'devConfig.set',
    { module: 'guest_auth', data: { func: 'guest_auth_set_qrcode_passive_auth_cfg', name: 'qrcode_passive_auth', ...params } }
  )
}

/**
 * 获取访客扫描信息
 */
export const getGuestScanAuth = () => {
  return api.cmd(
    'devSta.get',
    { module: 'guest_auth', data: { func: 'guest_auth_get_qrcode_active_auth_cfg' } }
  )
}

/**
 * 设置访客扫描信息
 */
export const setGuestScanAuth = (params) => {
  return api.cmd(
    'devConfig.set',
    { module: 'guest_auth', data: { func: 'guest_auth_set_qrcode_active_auth_cfg', name: 'qrcode_active_auth', ...params } }
  )
}


/**
 * 设置应用认证信息
 */
export const setAppAuth = (params) => {
  return api.cmd(
    'devConfig.set',
    { module: 'app_auth', data: { func: 'app_auth_set_flow_detect', name: 'qrcode_active_auth', ...params } }
  )
}

/**
 * 获取应用认证信息
 */
export const getAppAuth = () => {
  return api.cmd(
    'devSta.get',
    { module: 'app_auth', data: { func: 'app_auth_get_flow_detect' } }
  )
}

/**
 * 获取应用流控
 */
export const getFlowApp = () => {
  return api.cmd(
    'devConfig.get',
    { module: 'flowctrl_app' },
  )
}
/**
 * 设置应用流控
 */
export const setFlowApp = (params, async = false) => {
  return api.cmd(
    'devConfig.set',
    { module: 'flowctrl_app', data: params, async },
  )
}

/**
 * 获取整机映射DMZ列表
 */
export const getNatDmz = () => {
  return api.cmd(
    'devConfig.get',
    { module: 'nat_dmz' }
  )
}

/**
 * 增删改整机映射DMZ
 */
export const setNatDmz = (params, opt = 'set', async = false) => {
  return api.cmd(
    `devConfig.${opt}`,
    { module: 'nat_dmz', async, data: params }
  )
}