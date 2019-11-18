// acl
export const acl = () => {
  return {
    uuid: '',
    type: 1,
    name: ''
  }
}

// 时间对象
export const date = () => {
  return {
    tmngtName: '',
    type: 'user',
    time: {},
    user: '0'
  }
}

// 时间对象
export const time = () => {
  return {
    week: [],
    time: ['', '']
  }
}

// ace
export const ace = (type) => {
  let _common = {
    action: 0,
    tmngtName: '',
    acl_uuid: '',
    uuid: '',
    smask: 'any',
    dmask: 'any'
  }

  if (type === 1) {// MAC特有
    Object.assign(_common, {
      smac: 'any',
      dmac: 'any',
      eth: 'any'
    })
  } else if (type === 2)// IP特有
    Object.assign(_common, {
      sip: 'any',
      dip: 'any',
      protol: 'any',
      sports: 'any',
      sporte: 'any',
      dports: 'any',
      dporte: 'any'
    })
  return _common
}

// acl port

export const aclPort = () => {
  return {
    portid: [],
    mac_uuid: 'none',
    ip_uuid: 'none'
  }
}

// 生成树协议
export const stpBase = () => {
  return {
    enable: 0,
    mode: 0,
    forward_time: '15',
    hello_time: '2',
    age_time: '20',
    priority: '32768',
    recovery_time: '30'
  }
}

// 端口生成树
export const stpPort = () => {
  return {
    portid: [],
    priority: '128',
    linktype: 2,
    fastport: 0,
    bpdu_guard: 0
  }
}

// LLDP协议
export const lldpBase = () => {
  return {
    enable: 0,
    tx_interval: '30',
    tx_delay: '2',
    fast_count: '3',
    reinit_delay: '2',
    holdtime: '4'
  }
}

// 端口lldp
export const lldpPort = () => {
  return {
    portid: [],
    rx: 0,
    tx: 0,
    med: 0
  }
}
