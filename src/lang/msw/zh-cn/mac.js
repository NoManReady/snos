export default {
  mac: {
    mac_addr: 'MAC地址',
    ip_addr: 'ip地址',
    mac_addr_list: 'MAC地址表',
    static_mac_addr: '静态MAC地址',
    dynamic_mac_addr: '动态MAC地址',
    filter_mac_addr: '过滤MAC地址',
    mac_cfg: 'MAC基础配置',
    arp_addr_list: 'ARP列表',
    // list
    search_by_mac: '按MAC查询',
    search_by_vlan: '按VLAN查询',
    search_by_port: '按端口查询',
    static: '静态',
    dynamic: '动态',
    filter: '过滤',
    // static
    static_notice_tip: '{0}交换机在转发数据时，需要根据MAC地址表来做出相应转发，手工方式绑定设备下接的网络设备的MAC地址与端口关系,如添加一个静态地址，当在VLAN中接收到目的地址为该地址的报文时，这个报文将被转发到指定的接口中。应用场景如端口开启了802.1x认证，可以设置MAC绑定免认证。',
    static_add_tip: '添加静态地址',
    no_pc_mac: '{mac}为设备MAC，不可配置',
    static_limit_over: '静态MAC已配置最大容量',
    cfg_is_exist: '该配置已存在，请重新配置',
    // dynamic
    clear_by_mac: '基于MAC清除',
    clear_by_port: '基于端口清除',
    clear_by_vlan: '基于VLAN清除',
    // filter
    filter_notice_tip: '{0}交换机在转发数据时，需要根据MAC地址表来做出相应转发，当在配置的VLAN中接收到源地址或目的地址为配置的MAC地址时，将丢弃此报文，不进行转发。应用场景如某个用户发起ARP攻击时，可以将其配置为过滤地址，防止攻击。',
    filter_add_tip: '添加过滤地址',
    filter_limit_over:'过滤MAC已配置最大容量',
    // base
    mac_agetime:'MAC老化时间',
    agetime_f:'老化时间：',
    agetime_range:'老化时间范围:10-630',
    agetime_tip:'（范围:10-630，单位:秒，0表示不老化）',
    agetime_no_empty:'请输入MAC老化时间',
    // arp
    arp_notice_tip:'设备学习连接在设备各接口上的网络设备IP与MAC对应表。',
    search_by_ipmac:'根据IP/MAC地址查找'
  }
}
