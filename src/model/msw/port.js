// 端口基础配置
export const base = () => {
  return {
    enable: 1,
    c_duplex: 0,
    c_speed: 4,
    c_flowcontrol: 0,
    portid: []
  }
}
// 端口聚合
export const aggregate = () => {
  return {
    lpid: [],
    aggregateport: '',
    interface: ''
  }
}

// 端口镜像
export const mirror = () => {
  return {
    src_port: [],
    dst_port: "",
    mirror_direction: 0,
    switch: 1,
    session: 0
  }
}

// 物理性配置
export const phy = () => {
  return {
    eee: 0,
    mtu: 1500,
    media_type: 1,
    media_flag: 0,
    interface: '',
    description: '',
    portid: []
  }
}
// 端口保护
export const protect = () => {
  return {
    enable: 1,
    portid: []
  }
}

// 端口vlan
export const portVlan = () => {
  return {
    mode: 1,
    untagvlan: '',
    permitvlan: '1-4094',
    pvid: '',
    portid: []
  }
}


// mac
export const macBase = () => {
  return {
    macaddr: '',
    vlanid: '',
    lpid: ''
  }
}


// rate
export const rate = () => {
  return {
    portid: [],
    irate: '',
    orate: ''
  }
}
