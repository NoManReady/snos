// 风暴控制
export const storm = () => {
  return {
    control_type: 0,
    broadcast: '',
    multicast: '',
    unicast: '',
    portid: []
  }
}

// DHCP Snooping
export const snoop = () => {
  return {
    enable: 0,
    option82: 0,
    lpid: []
  }
}

// SNMP
export const snmp = () => {
  return {
    enable: 0,
    version: 0,
    community: 'public',
    user: '',
    authpasswd: '',
    encpasswd: '',
    hostips: ['']
  }
}


export const wan = () => {
  return {
    proto: 'dhcp', // 默认dhcp
    ipaddr: '',
    netmask: '',
    dns: '',
    gateway: '',
    password: '',
    username: '',
    mtu: '1500',
    macaddr: '',
    vlanid: '1',
    metric: '0'
  }
}
