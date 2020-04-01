export default {
  stp: {
    stp_cfg: "STP配置",
    apply_stp: "应用STP",
    cfg_tip:
      "{0}开启生成树功能及改变生成树模式，浏览器将会重新连接，配置过程中请勿刷新页面。",
    stp_switch: "STP开关",
    priority: "优先级",
    hand_time: "握手时间",
    age_time: "老化时间",
    forward_delay: "转发延迟",
    recovery_time: "恢复时间",
    auto_time: "Errdisabled端口自动恢复时间",
    spantree_mode: "生成树模式",
    stp_switch_f: "@:msw.stp.stp_switch：",
    priority_f: "@:msw.stp.priority：",
    hand_time_f: "@:msw.stp.hand_time：",
    age_time_f: "@:msw.stp.age_time：",
    forward_delay_f: "@:msw.stp.forward_delay：",
    recovery_time_f: "@:msw.stp.recovery_time：",
    auto_time_f: "@:msw.stp.auto_time：",
    spantree_mode_f: "@:msw.stp.spantree_mode：",
    // rule
    hand_recovery_forward_rule: "2×(握手时间+1)<=老化时间<=2×(转发延迟时间-1)",
    forward_no_empty: "请输入转发延迟",
    hand_no_empty: "请输入握手时间",
    age_no_empty: "请输入老化时间",
    priority_no_empty: "请输入优先级",
    recovery_no_empty: "请输入恢复时间",
    stp_enable_confirm: "是否确认{status}生成树功能？",
    cfg_port: "生成树端口设置",
    scf_port_tip: "建议直连PC的端口开启Port Fast",
    port_role: "端口角色",
    port_status: "端口状态",
    link_type: "连接类型",
    link_type_f: "@:msw.stp.link_type：",
    cfg_status: "配置状态",
    actual_status: "实际状态",
    auto: "自动",
    share: "共享",
    ptop: "点对点"
  },
  lldp: {
    // base
    lldp_cfg: "LLDP配置",
    apply_lldp: "应用LLDP",
    lldp_info: "LLDP信息",
    lldp_switch: "LLDP开关",
    ttl_mul: "TTL乘数",
    init_delay: "初始延迟时间",
    send_interval: "发送时间间隔",
    send_delay: "发送延迟时间",
    send_pack_cnt: "发送报文个数",
    lldp_switch_f: "@:msw.lldp.lldp_switch：",
    ttl_mul_f: "@:msw.lldp.ttl_mul：",
    init_delay_f: "@:msw.lldp.init_delay：",
    send_interval_f: "@:msw.lldp.send_interval：",
    send_delay_f: "@:msw.lldp.send_delay：",
    send_pack_cnt_f: "@:msw.lldp.send_pack_cnt：",

    ttl_pack_rule: "TTL乘数×报文发送时间间隔+1必须小于等于65535",
    interval_delay: "发送间隔时间x0.25必须大于等于发送延迟时间",
    ttl_no_empty: "请输入TTL乘数",
    init_delay_no_empty: "请输入初始化延迟时间",
    send_delay_no_empty: "请输入发送时间延迟",
    interval_no_empty: "请输入发送时间间隔",
    pack_no_empty: "请输入发送报文个数",
    lldp_enable_confirm: "是否确认{status}LLDP功能？",
    // port
    send_lldpdu: "发送LLDPDU",
    receive_lldpdu: "接收LLDPDU",
    media_terminal: "媒体终端发现MED",
    send_lldpdu_f: "@:msw.lldp.send_lldpdu：",
    receive_lldpdu_f: "@:msw.lldp.receive_lldpdu：",
    media_terminal_f: "@:msw.lldp.media_terminal：",
    priority_no_empty: "@:msw.stp.priority_no_empty",
    // info
    dev_info: "设备信息",
    dev_type: "设备类型",
    dev_id: "设备ID",
    dev_name: "系统名称",
    dev_desc: "系统描述",
    dev_id_type: "设备ID类型",
    port_id_type: "端口ID类型",
    port_id: "端口ID",
    vlan_name: "VLAN 名称",
    dev_type_f: "@:msw.lldp.dev_type：",
    dev_id_f: "@:msw.lldp.dev_id：",
    dev_name_f: "@:msw.lldp.dev_name：",
    dev_desc_f: "@:msw.lldp.dev_desc：",
    dev_id_type_f: "@:msw.lldp.dev_id_type：",
    port_id_type_f: "@:msw.lldp.port_id_type：",
    port_id_f: "@:msw.lldp.port_id：",
    vlan_name_f: "@:msw.lldp.vlan_name：",
    supported_function_f: "支持的功能：",
    enabled_function_f: "已启用的功能：",
    net_manage_addr_f: "网络管理地址：",
    manage_addr_f: "管理地址：",
    nei_info: "邻居信息",
    view_nei_info: "点击查看邻居信息",
    nei_sys: "邻居系统",
    nei_desc: "邻居详情",
    vlan_name_f: "VLAN 名称："
  },
  rldp: {
    rldp_cfg: "RLDP配置",
    apply_rldp: "应用RLDP",
    rldp_info: "RLDP信息",
    rldp_switch_f: 'RLDP开关：',
    pack_check_time: '报文检测时间间隔',
    err_recover_time: '开启自动恢复功能',
    recover_on_time: '定时自动恢复时间',
    pack_check_time_f: '@:msw.rldp.pack_check_time：',
    err_recover_time_f: '@:msw.rldp.err_recover_time：',
    recover_on_time_f: '@:msw.rldp.recover_on_time：',
    recover_no_empty: '请输入定时自动恢复时间',
    pack_check_time_no_empty: '请输入报文检测时间间隔',
    rldp_enable_confirm: "是否确认{status}RLDP功能？",
    loop_status: '环路开关',
    loop_action: '处理方式',
    loop_status_f: '@:msw.rldp.loop_status：',
    loop_action_f: '@:msw.rldp.loop_action：',
    port_err_1: 'Warning',
    port_err_2: 'Block',
    port_err_3: 'Shutdown',
    reset_status: '恢复故障端口',
    detect_state_normal:'正常',
    detect_state_err:'异常',
    detect_status:'检测状态',
    reset_warning_confirm:'是否确认重置？',
    loop_action_actual:'实际状态'
  },
  snoop: {
    explain_tip:
      "{0}开启DHCP Snooping可以起到DHCP报文过滤的功能。对于DHCP客户端请求报文，仅将其转发到信任口，对于DHCP服务器响应报文，仅转发来自信任口的响应报文。",
    notice_tip: "{0}一般连接DHCP服务器端口设置为信任口。",
    port_select: "选择信任口端口：",
    dhcp_switch: "DHCP Snooping开关：",
    dhcp_enable_confirm: "是否确认{status}DHCP Snooping？"
  },
  acl: {
    acl_list: "ACL列表",
    alc_date: "ACL时间",
    access_ctrl: "访问控制",
    ctrl_type: "控制类型",
    rule_type: "规则类型",
    mac_ctrl: "基于MAC",
    ip_ctrl: "基于IP",
    view_rule: "查看规则",
    acl_name_f: "ACL名称：",
    access_ctrl_f: "@:msw.acl.access_ctrl：",
    access_ctrl_type_f: "访问控制类型：",
    acl_name_tip: "例如：服务器访问控制",
    mac_ctrl_type: "基于MAC地址控制",
    ip_ctrl_type: "基于IP地址控制",
    cfg_rule: "规则配置",
    // rule
    name_is_exist: "【{name}】已配置过，请重新输入",
    name_is_invalid: "无效的ACL名称，请重新输入",
    name_no_empty: "请输入ACL名称",
    acl_has_limit: "ACL已配置最大容量",
    // ace
    ace_binded_tip:
      "当前ACL已被应用，不可进行修改，点击指定规则可查看规则详细信息。",
    forbid: "禁止",
    move: "移动",
    block: "阻塞",
    allow: "允许",
    all: "所有",
    move_tip: "移动规则选择",
    move_desc: "将选中的第{begin}条规则和第{end}条规则互换。",
    move_rule_tip: "（注：规则匹配优先级是从上到下依次匹配）",
    addr_mask: "（地址/掩码）",
    begin_end: "（起始-结束）",
    add_rule: "添加规则",
    edit_rule: "修改规则",
    cancel_edit: "取消修改",
    ip_protocol: "IP协议号",
    source_ip: "源IP",
    dest_ip: "目的IP",
    source_port: "源端口",
    dest_port: "目的端口",
    source_ip_f: "@:msw.acl.source_ip：",
    dest_ip_f: "@:msw.acl.dest_ip：",
    source_port_f: "@:msw.acl.source_port：",
    dest_port_f: "@:msw.acl.dest_port：",
    pack_type: "报文类型号",
    source_mac: "源MAC",
    dest_mac: "目的MAC",
    pack_type_f: "@:msw.acl.pack_type：",
    source_mac_f: "@:msw.acl.source_mac：",
    dest_mac_f: "@:msw.acl.dest_mac：",
    exist_rule: "已有规则：",
    drag_tip: "（拖动序号可交换规则顺序）",
    no_rule: "暂无规则",
    matched_rule: "匹配规则",
    reset: "重置",
    source_port_range: "源地址端口范围",
    dest_port_range: "目的地址端口范围",
    index: "索引",
    // rule
    bp_not_lg_ep: "起始端口号不能小于结束端口号",
    should_be_number: "请输入数字",
    is_same_rule: "互换的规则号不能相同",
    rule_range: "规则号范围为1~{end}",
    protocol_range: "取值范围 0-255",
    mask_no_empty: "请输入掩码",
    mac_mask_format: "请输入正确的掩码格式,如ff:ff:ff:ff:ff:00",
    ip_mask_format: "请输入正确的掩码格式,如255.255.255.0",
    sourceip_no_empty: "请输入源IP地址",
    destip_no_empty: "请输入目的IP地址",
    sourcemac_no_empty: "请输入源MAC地址",
    destmac_no_empty: "请输入目的MAC地址",
    sp_begin_no_empty: "请输入源端口起始端口号",
    sp_end_no_empty: "请输入源端口结束端口号",
    dp_begin_no_empty: "请输入目的端口起始端口号",
    dp_end_no_empty: "请输入目的端口结束端口号",
    eth_no_empty: "请输入报文类型号",
    rule_is_exist: "规则已存在，请重新修改",
    rule_no_modify: "规则未修改",
    // port
    acl_port_tip: "设备过滤方向：入口方向（只在接收报文上做过滤）。",
    apply_acl: "应用ACL",
    patch_release: "批量解除",
    must_one_rule: "至少绑定一个ACL，请选择",
    release_bind: "解除绑定",
    release_success: "解除绑定成功",
    empty: "无",
    apply_port_f: "应用端口：",
    apply_port_no_empty: "请选择应用的端口"
  },
  wanip: {
    manage_ip: "管理IP",
    wan_cfg_page: "上网配置页面",
    protocol_type_f: "联网类型：",
    manage_vlan_f: "管理VLAN：",
    vlan_tip: "范围为2~232,234~4090,不填默认为1",
    vlan_no_port_tip: "该VLAN下无成员端口，请前往VLAN划分进行配置",
    vlan_no_exist_tip: "管理VLAN ID还未创建，请前往VLAN划分进行创建",
    loading: "加载中",
    validing: "校验中",
    request_err: "请求错误"
  },
  cable: {
    port_panel: "端口面板",
    begin_test: "开始检测",
    testing: "检测中",
    test_result: "检测结果",
    cable_len: "线缆长度（cm）",
    unope: "未操作",
    normal: "正常",
    unsupported: "不支持",
    unmatched: "不匹配",
    short: "短路",
    open: "断开",
    select_test_port: "请选择要检测的端口",
    cable_uplink_tip:
      "当前检测端口包含上联口【{uplink}】，可能会出现网络连通闪断，是否开始检测？"
  }
};
