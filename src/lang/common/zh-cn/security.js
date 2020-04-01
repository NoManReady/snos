export default {
  arp: {
    list: 'ARP列表',
    arp_tip:
      '设备学习连接在设备各接口上的网络设备IP与MAC对应表。可以对ARP列表表项进行绑定和过滤操作。',
    mac_bind: 'MAC绑定',
    mac_filter: 'MAC过滤',
    arp_help: '您可以在{bind}页面进行批量删除解绑操作。',
    arp_help1: '您可以在{filter}页面进行批量删除规则操作。',
    arp_bind_tip1:
      'ARP列表中，已绑定或者已过滤的表项，无法被选中进行批量绑定或者批量过滤的操作。',
    arp_bind_tip2: 'ARP列表中，已绑定的表项，无法被选中进行批量绑定操作。',
    search_by_ipmac: '根据IP/MAC地址查找',
    patch_bind: '批量绑定',
    patch_filter: '批量过滤',
    add_to_bind: '添加到MAC绑定列表',
    had_bind: '已绑定',
    add_to_filter: '添加到MAC过滤规则',
    has_filter: '已过滤',
    select_ip_mac_bind: '请选择要执行IP-MAC绑定的列表项',
    ip_mac_binded: 'IP-MAC已绑定',
    bind_limit: '最大支持绑定{max}个，已绑定${has}，可再绑定${stay}个',
    bind_confirm: '确认添加到MAC绑定列表中？',
    select_mac_filter: '请选择要添加到MAC过滤规则的列表项',
    filter_confirm: '确认添加到MAC过滤规则中？'
  },
  arp_bind: {
    mac_ip: 'MAC绑定IP',
    bind_tip:
      '通过开启ARP防护，并将IP地址和MAC地址绑定，能够增加网络的安全防护功能。',
    arp_prot: 'ARP防护',
    prot_tip: '开启状态下，将只允许绑定了IP的MAC主机访问外网',
    ip_mac_list: 'IP-MAC绑定列表',
    bind_limit: '最大支持配置{max}条绑定。',
    select_ip: '输入或从ARP列表中选择IP',
    select_mac: '输入或从ARP列表中选择MAC',
    ip_exist: 'IP地址已配置过',
    mac_exist: 'MAC地址已配置过',
    add_limit: '{name}最多只能添加{max}条数据',
    arp_bind_confirm: '是否确认{status}ARP防护'
  },
  arp_filter: {
    mac_filter: 'MAC地址过滤',
    filter_tip: '通过开启MAC地址过滤和设置过滤类型，控制连接的主机上网。',
    enable_tip: '开启状态下，以下配置才会生效',
    allow_list: '只允许规则列表中的主机访问外网',
    forbid_list: '不允许规则列表中的主机访问外网',
    filter_type: '过滤类型',
    black_list: '黑名单（不允许设备访问外网）',
    white_list: '白名单（允许设备访问外网）',
    rule_list: '规则列表',
    filter_limit: '最大支持配置{max}个规则。',
    remark_rule: '备注不能超过32个字符（单个中文占3个字符）'
  }
};
