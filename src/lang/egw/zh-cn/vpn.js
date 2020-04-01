export default {
  ipsec: {
    ipsec_security_policy: "IPSec安全策略",
    ipsec_link_status: "IPSec连接状态",
    initiator: "客户端",
    master: "服务端",
    // Strategy
    mask_module_tip:"子网范围格式：IP地址/掩码位数。一般设置24位掩码数，即255.255.255.0。",
    mask_example:"如果设置为 192.168.110.x/24，那么此子网范围是 192.168.110.1-192.168.110.254。",
    policy_tab: "策略列表",
    no_edit_l2tp: "不可编辑的策略为L2TP生成的策略（不计入支持配置的条数）。",
    policy_type: "策略类型",
    policy_name: "策略名称",
    peer_gateway: "对端网关",
    terminal_network_range: "对端子网范围",
    mac_or_ip: "域名或IP地址",
    gateway_second: "备选网关",
    interface_bind: "绑定接口",
    interface_auto_tip: "多线路情况下，推荐设置为“自动”",
    local_subnet_scope: "本地子网范围",
    psk: "预共享密钥",
    ike_policy_step: "阶段一设置（IKE策略）",
    ike_policy: "IKE策略",
    negotiation_mode: "协商模式",
    main: "主模式",
    aggressive: "野蛮模式",
    local_id_type: "本地ID类型",
    local_id: "本地ID",
    peer_id_type: "对端ID类型",
    peer_id: "对端ID",
    lifetime: "生存时间",
    open_dpd_check: "DPD检测开启",
    range_dpd_check: "DPD检测周期",
    forbid: "禁用",
    time_dpd_check: "秒(1-300)",
    ike_policy_step2: "阶段二设置（建立连接策略）",
    transform: "转换集{n}",
    perfect_forward_encryption: "完美向前加密",
    policy_name_is_has: "策略名称已存在",
    policy_name_is_required: "请输入策略名称",
    ip_or_url_is_required: "请输入有效的域名或IP地址",
    cnt_128_char: "1-128个字符",
    psk_is_required: "请输入预共享密钥",
    local_id_is_required: "请输入本地ID",
    peer_id_is_required: "请输入对端ID",
    lifetime_is_required: "请输入生存时间",
    range_dpd_is_required: "请输入DPD检测周期",
    edit_user: "编辑用户",
    add_user: "添加用户",
    psk_is_has_tip:"检测到对端网关{ip}已配置过预共享密钥，与此密钥不一致，是否覆盖旧的密钥?",
    psk_is_has_tip2: "是否覆盖旧密钥",
    mask_is_has: "子网范围重叠",
    mask_is_required: "请输入子网范围",
    mask_beyond_network: "子网范围冲突，本地子网范围包含了此网段",
    algorithm_no_repeated: "算法不能重复",
    ah_esp_no_confuse: "ah和esp算法不能混用",
    // Union
    ipsec_link_tab: "IPSec连接列表",
    name: "名称",
    direction: "方向",
    tunnel: "隧道两端",
    flows: "数据流",
    normal: "正常",
    abnormal: "异常",
    safe_agreement: "安全协议",
    ah_check_algorithm: "AH验证算法",
    esp_check_algorithm: "ESP验证算法",
    esp_encryption_algorithm: "ESP加密算法"
  },
  l2tp: {
    l2tp_service: "L2TP服务器",
    l2tp_initiator: "L2TP客户端",
    tunnel_information_tab: "隧道信息列表",
    interval_is_required: "请输入时间间隔",
    time_positive_integer: "时间必须为正整数",
    time_positive_integer_range: "时间范围：60-1000",
    tunnel_name: "隧道名称",
    // Client
    global: "全局设置",
    l2tp_maintenance_interval: "L2TP链路维护时间间隔",
    initiator_set: "客户端设置",
    service_addr: "服务器地址",
    ipsec_encryption: "IPSec加密",
    no_encryption: "不加密",
    encryption: "加密",
    remotesubnet: "对端子网",
    workmode: "工作模式",
    l2tp_initiator_edit: "编辑L2TP客户端",
    l2tp_initiator_add: "添加L2TP客户端",
    tunnelname_length_tip: "1-12个字符",
    //server
    l2tp_service_set: "L2TP服务器设置",
    local_addr: "本地地址",
    addr_zone: "地址池",
    more_then_addr_zone: "【地址池数量已达上限】",
    normal_addr_zone_name: "自定义地址池名称",
    addr_zone_ip_range: "地址池IP范围",
    pc_enter_route: "电脑拨入路由器",
    route_to_route: "路由器对路由器",
    terminal_network_range: "对端子网范围",
    outside_addr_zone: "与地址池IP范围冲突",
    outside_lan_ip: "与LAN口IP网段冲突",
    local_addr_is_required: "请输本地地址",
    addr_zone_is_required: "请选择地址池",
    dns_is_required: "请输入DNS地址",
    terminal_network_range_is_required: "请输入对端子网范围",
    group_net_mode: "组网模式",
    // tunnel
    service_initiator: "服务器/客户端",
    virtual_local_ip: "虚拟本地IP",
    link_service_ip: "接入服务IP",
    peer_virtual_ip: "对端虚拟IP"
  },
  pptp: {
    pptp_service: "PPTP服务器",
    pptp_initiator: "PPTP客户端",
    tunnel_information_tab: "隧道信息列表",
    // server
    pptp_service_set: "PPTP服务器设置",
    pptp_maintenance_interval: "PPTP链路维护时间间隔",
    ppp_maintenance_interval: "PPP链路维护时间间隔",
    tunnel_user_tip: '{type}隧道用户身份认证的{name}'
    //Client
  },
  pool: {
    addr_zone_manage: "地址池管理",
    addr_zone_is_used: "被使用的IP地址池，不能执行{0}操作。",
    addr_zone_tab: "地址池列表",
    addr_zone_name: "地址池名称",
    addr_zone_add: "添加地址池",
    addr_zone_edit: "编辑地址池",
    addr_zone_is_has: "地址池名称已存在",
    end_addr_less_then_start_addr: "结束地址要大于开始地址",
    within_addr_num: "包含了{cnt}个地址，限制最大 1000 个",
    addr_range_is_has: "地址范围与已有地址池发生重叠，请重新输入！",
    addr_used_in_service: "包含已被服务端使用的地址：{ip}",
    pool_name_no_empty: "请输入地址池名称",
    iprange_no_empty: "请输入IP范围"
  },
  manager: {
    vpn_user: 'VPN用户管理',
    vpn_user_list: 'VPN用户管理列表',
    vpn_user_tip: '不能包含特殊字符（逗号，空格，“*”）',
    username_is_required: '请输入用户名',
    password_is_required: '请输入密码',
    provider_type: '隧道类型'
  }
};