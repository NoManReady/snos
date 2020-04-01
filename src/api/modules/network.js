import * as api from './api'
import store from '@/store'

/**
 * 获取Network配置
 */
export const getNetwork = (isSilence = false, auth = {}) => {
  return api.cmd('devConfig.get', {
    module: 'network',
    ...auth
  }, { isSilence, timeout: 0 })
}

/**
 * 获取Network分组配置
 */
export const getNetworkGroup = (config = {}) => {
  return api.cmd('acConfig.get', {
    module: 'network_group'
  }, config)
}

/**
 * 获取Network给定配置
 */
export const getNetworkByType = (type, setting) => {
  return api.network('getNetworkByType', {
    type
  }, setting)
}

/**
 * 获取交换机邻居
 */
export const getNeighborListByType = async (roles = ['esw', 'ap'], isSilence = false) => {
  let params = []
  if (roles.length === 0 || roles.includes('ap')) {
    params.push({
      method: 'devSta.get',
      params: { module: 'neighbor' }
    })
  }
  if (roles.length === 0 || roles.includes('esw')) {
    params.push({
      method: 'devSta.get',
      params: { module: 'esw_neighbor' }
    })
  }
  let _res = await api.cmd(
    'cmdArr',
    { params },
    { isSilence, timeout: 0, noParse: true }
  )
  let _list1 = !!_res[0] ? _res[0].neighbor || [] : []
  let _list2 = !!_res[1] ? _res[1].neighbor || [] : []
  let _neighbor = _list1.concat(_list2)
  return _neighbor
}

/**
 * 获取Network邻居(包括交换机)
 */
export const getNetworkNeighbor = async (isSilence = false, roles = ['esw', 'ap']) => {
  let _groupMap = {}
  let _result = { conflict: false }
  let _neighbor = await getNeighborListByType(roles, isSilence)

  // 获取当前网络
  _result.curNetwork = store.getters.networkId || {}
  _result.neighbor = _neighbor
  _groupMap[_result.curNetwork.networkId] = _result.curNetwork.networkId
  _result.neighbor.forEach(v => {
    if (!_groupMap[v.networkId]) {
      _groupMap[v.networkId] = v.networkId
      _result.conflict = true
    }
  })
  _result.networkIds = _groupMap

  return _result
}

/**
 * 获取当前所属分组
 */
export const getNetworkId = () => {
  return api.cmd('devSta.get', {
    module: 'networkId'
  })
}

/**
 * 设置Network邻居
 */
export const setNetworkNeighbor = (params, async = true) => {
  return api.cmd(
    'devSta.set', {
    module: 'networkId_merge',
    data: params,
    async
  }, {
    timeout: 0
  }
  )
}

/**
 * 设置Network分组配置
 */
export const setNetworkGroup = (params, async = false) => {
  return api.cmd(
    'acConfig.set', {
    module: 'network_group',
    data: params,
    async
  }, {
    timeout: 0
  }
  )
}

/**
 * 设置Network配置
 */
export const setNetwork = (network, updateSysinfo = true) => {
  // return api.cmd(
  //   'devConfig.set',
  //   { module: 'network', data: params },
  //   { timeout: 0 }
  // )
  return api.network('setNetwork', {
    network
  }, {
    timeout: 0,
    async: true
  }).then(_ => {
    if (updateSysinfo) {
      // 更新sysinfo信息
      setTimeout(() => {
        store.dispatch('getSysinfo')
      }, 12000);
    }
  })
}

/**
 * 设置Network配置
 */
export const setNetworkRemote = (network, auth = {}, async = true) => {
  return api.cmd('devConfig.set', {
    module: 'network',
    data: network,
    async,
    ...auth
  }, { timeout: 0 })
}

/**
 * 获取POE供电状态信息
 */
export const getPoeStatus = (isSilence = false) => {
  return api.cmd('devSta.get', {
    module: 'poe',
    data: {
      func: 'json_info'
    }
  }, { isSilence })
}

/**
 * 获取静态地址分配信息
 */
export const getStaticDhcpTable = () => {
  return api.cmd('devConfig.get', {
    module: 'dhcp_static'
  })
}

/**
 * 增加静态地址分配信息
 */
export const addStaticDhcpTable = (list) => {
  return api.cmd('devConfig.add', {
    module: 'dhcp_static',
    data: { list }
  })
}

/**
 * 编辑静态地址分配信息
 */
export const updateStaticDhcpTable = (data) => {
  return api.cmd('devConfig.update', {
    module: 'dhcp_static',
    data
  })
}

/**
 * 删除静态地址分配信息
 */
export const delStaticDhcpTable = (macaddr) => {
  return api.cmd('devConfig.del', {
    module: 'dhcp_static',
    data: { macaddr }
  })
}

/**
 * 设置静态地址分配信息
 */
export const setStaticDhcpTable = params => {
  return api.cmd('devConfig.set', {
    module: 'dhcp_static',
    data: params
  })
}

/**
 * 设置ISP和多链路负载均衡信息
 */
export const setMultWan = params => {
  return api.network('setMultWan', params)
}

/**
 * 获取联网状态
 */
export const getNetworkStatus = () => {
  return api.cmd(
    'devSta.get', {
    module: 'networkConnect'
  }, {
    isSilence: true,
    timeout: 0
  }
  )
}

/**
 * 获取wan口mac地址
 */
export const getWanMac = () => {
  return api.cmd('devSta.get', {
    module: 'waninfo'
  }, {
    isSilence: true
  })
}

/**
 * 获取wan口ip地址
 */
export const getWanIp = (auth = {}, isSilence = true) => {
  return api.cmd('devSta.get', {
    module: 'ipinfo',
    ...auth
  }, {
    isSilence,
    timeout: 0
  })
}

/**
 * 获取DHCP选项
 */
export const getDhcpOption = (isSilence = false) => {
  return api.cmd('devConfig.get', {
    module: 'dhcp_option'
  }, { isSilence })
}
/**
 * 设置DHCP选项
 */
export const setDhcpOption = (params) => {
  return api.cmd('devConfig.set', {
    module: 'dhcp_option',
    data: params
  })
}
/**
 * 获取DNS代理
 */
export const getDnsProxy = (isSilence = false) => {
  return api.cmd('devConfig.get', {
    module: 'dns_proxy'
  }, { isSilence })
}
/**
 * 设置DNS代理
 */
export const setDnsProxy = (params) => {
  return api.cmd('devConfig.set', {
    module: 'dns_proxy',
    data: params
  })
}
/**
 * 获取端口VLAN
 */
export const getVlanPort = () => {
  return api.cmd('devSta.get', {
    module: 'vlan_port'
  })
}
/**
 * 设置端口VLAN
 */
export const setVlanPort = (data) => {
  return api.cmd('devConfig.set', {
    module: 'vlan_port',
    data
  })
}
/**
 * 获取端口信息
 */
export const getPortInfo = (settings) => {
  return api.cmd('devConfig.get', {
    module: 'portInfo'
  }, settings)
}
/**
 * 设置端口信息
 */
export const setPortInfo = (data) => {
  return api.cmd('devConfig.set', {
    module: 'portInfo',
    data
  })
}
/**
 * 获取AP有线口
 */
export const getWireLan = () => {
  return api.cmd('acConfig.get', {
    module: 'wirelan'
  })
}
/**
 * 设置AP有线口
 */
export const setWireLan = (data) => {
  // return api.cmd('acConfig.set', {
  //   module: 'wirelan',
  //   data
  // })
  return api.wireless('setWireLan', data)
}
/**
 * 获取DHCP SNOOPING
 */
export const getDhcpSnoop = () => {
  return api.cmd('acConfig.get', {
    module: 'dhcp_snp'
  })
}
/**
 * 设置DHCP SNOOPING
 */
export const setDhcpSnoop = (params) => {
  return api.cmd('acConfig.set', {
    module: 'dhcp_snp',
    data: params
  })
}
/**
 * 获取 WIFi NET
 */
export const getNet = () => {
  return api.cmd('acConfig.get', {
    module: 'nfpp_global'
  })
}
/**
 * 设置  WIFi NET
 */
export const setNet = (params) => {
  return api.cmd('acConfig.set', {
    module: 'nfpp_global',
    data: params
  })
}

