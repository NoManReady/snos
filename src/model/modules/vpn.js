// IPSec
export const vpnSecurityFn = () => {
  return {
    name: '',
    remote_gateway: '',
    intf_binding: 'AUTO',
    local_network: [''],
    remote_network: [''],
    psk: '',
    status: 'enable',

    ike_proposal_1: 'sha1-3des-dh1',
    ike_proposal_2: 'sha1-des-dh1',
    ike_proposal_3: 'sha1-3des-dh2',
    ike_proposal_4: 'md5-des-dh1',
    ike_proposal_5: 'md5-3des-dh2',
    exchange_mode: 'main',
    connection_type: 'initiator', // initiator(客户端) 或 responder(服务端)
    local_id_type: 'IP_ADDRESS',
    local_id_value: '',
    remote_id_type: 'IP_ADDRESS',
    remote_id_value: '',
    ikelifetime: '86400',
    dpd_enable: 'enable',
    dpd_interval: '10',

    mode: 'tunnel',
    ph2_proposal_1: 'esp-sha1-aes128',
    ph2_proposal_2: 'esp-md5-3des',
    ph2_proposal_3: '---',
    ph2_proposal_4: '---',
    ph2_proposal_5: '---',
    pfs: 'none',
    lifetime: '3600'
  }
}
// 阶段一安全提议
export const proposal1 = () => {
  return [
    { name: '---', val: '---' },
    { name: 'md5-des-dh1', val: 'md5-des-dh1' },
    { name: 'md5-des-dh2', val: 'md5-des-dh2' },
    { name: 'md5-des-dh5', val: 'md5-des-dh5' },
    { name: 'md5-3des-dh1', val: 'md5-3des-dh1' },
    { name: 'md5-3des-dh2', val: 'md5-3des-dh2' },
    { name: 'md5-3des-dh5', val: 'md5-3des-dh5' },
    { name: 'md5-aes128-dh1', val: 'md5-aes128-dh1' },
    { name: 'md5-aes128-dh2', val: 'md5-aes128-dh2' },
    { name: 'md5-aes128-dh5', val: 'md5-aes128-dh5' },
    { name: 'md5-aes192-dh1', val: 'md5-aes192-dh1' },
    { name: 'md5-aes192-dh2', val: 'md5-aes192-dh2' },
    { name: 'md5-aes192-dh5', val: 'md5-aes192-dh5' },
    { name: 'md5-aes256-dh1', val: 'md5-aes256-dh1' },
    { name: 'md5-aes256-dh2', val: 'md5-aes256-dh2' },
    { name: 'md5-aes256-dh5', val: 'md5-aes256-dh5' },
    { name: 'sha1-des-dh1', val: 'sha1-des-dh1' },
    { name: 'sha1-des-dh2', val: 'sha1-des-dh2' },
    { name: 'sha1-des-dh5', val: 'sha1-des-dh5' },
    { name: 'sha1-3des-dh1', val: 'sha1-3des-dh1' },
    { name: 'sha1-3des-dh2', val: 'sha1-3des-dh2' },
    { name: 'sha1-3des-dh5', val: 'sha1-3des-dh5' },
    { name: 'sha1-aes128-dh1', val: 'sha1-aes128-dh1' },
    { name: 'sha1-aes128-dh2', val: 'sha1-aes128-dh2' },
    { name: 'sha1-aes128-dh5', val: 'sha1-aes128-dh5' },
    { name: 'sha1-aes192-dh1', val: 'sha1-aes192-dh1' },
    { name: 'sha1-aes192-dh2', val: 'sha1-aes192-dh2' },
    { name: 'sha1-aes192-dh5', val: 'sha1-aes192-dh5' },
    { name: 'sha1-aes256-dh1', val: 'sha1-aes256-dh1' },
    { name: 'sha1-aes256-dh2', val: 'sha1-aes256-dh2' },
    { name: 'sha1-aes256-dh5', val: 'sha1-aes256-dh5' }
  ]
}
// 阶段二安全提议
export const proposal2 = () => {
  return [
    { name: '---', val: '---' },
    { name: 'ah-md5', val: 'ah-md5' },
    { name: 'ah-sha1', val: 'ah-sha1' },
    { name: 'esp-md5-des', val: 'esp-md5-des' },
    { name: 'esp-md5-3des', val: 'esp-md5-3des' },
    { name: 'esp-md5-aes128', val: 'esp-md5-aes128' },
    { name: 'esp-md5-aes192', val: 'esp-md5-aes192' },
    { name: 'esp-md5-aes256', val: 'esp-md5-aes256' },
    { name: 'esp-sha1-des', val: 'esp-sha1-des' },
    { name: 'esp-sha1-3des', val: 'esp-sha1-3des' },
    { name: 'esp-sha1-aes128', val: 'esp-sha1-aes128' },
    { name: 'esp-sha1-aes192', val: 'esp-sha1-aes192' },
    { name: 'esp-sha1-aes256', val: 'esp-sha1-aes256' }
  ]
}

// L2TP服务器
export const vpnL2tpSerFn = () => {
  return {
    username: "",
    password: "",
    localip: "",
    ippool_name: "",
    DNS: "",
    // netmode: "lan2lan",
    // remotesubnet: "",
    ipsecenc: "no",
    presharekey: "",
    l2tphellointerval: "60",
    lcpechointerval: "60",
    exchange_mode: "aggressive",
    local_id_type: "IP_ADDRESS",
    local_id_value: "",
    ike_proposal: "sha1-3des-dh1",
    ph2_proposal: "esp-sha1-aes128",
    enable: "1"
  }
}

// L2TP客户端
export const vpnL2tpCliFn = () => {
  return {
    tunnelname: 'l2tp',
    username: '',
    password: '',
    lns: '',
    ipsecenc: 'no',
    presharekey: '',
    remotesubnet: '',
    l2tphellointerval: "60",
    lcpechointerval: "60",
    workmode: 'nat',
    exchange_mode: "aggressive",
    remote_id_type: "IP_ADDRESS",
    remote_id_value: "",
    ike_proposal: "sha1-3des-dh1",
    ph2_proposal: "esp-sha1-aes128",
    enable: 'on'
  }
}

// 地址池管理
export const vpnPoolFn = () => {
  return {
    ippool_name: "",
    first_addr: "",
    end_addr: "",
    netmask: "255.255.128.0",
    ipRange: ""
  }
}

// 用户管理
export const vpnUserFn = () => {
  return {
    "provider": "l2tpserver",
    "password": "",
    "username": "",
    "netmode": "client2lan",
    "remotesubnet": "",
    "enable": "on"
  }
}

// PPTP服务器
export const vpnPptpSerFn = () => {
  return {
    localip: "",
    ippool_name: "PPTP",
    DNS: "",
    // netmode: "lan2lan",
    // remotesubnet: "",
    // ipsecenc: "no",
    // presharekey: "",
    lcpechointerval: "60",
    // ike_proposal: "sha1-3des-dh1",
    // ph2_proposal: "esp-sha1-aes128",
    enable: "1"
  }
}

// PPTP客户端
export const vpnPptpCliFn = () => {
  return {
    tunnelname: 'pptp',
    username: '',
    password: '',
    lns: '',
    // ipsecenc: 'yes',
    // presharekey: '',
    remotesubnet: '',
    workmode: 'nat',
    lcpechointerval: "60",
    // ike_proposal: "sha1-3des-dh1",
    // ph2_proposal: "esp-sha1-aes128",
    enable: 'off'
  }
}