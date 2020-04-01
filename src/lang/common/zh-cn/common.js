export default {
  // 操作类(动作)
  action: {
    patch_add: '批量添加',
    patch_convert: '批量转换',
    patch_delete: '批量删除',
    patch_edit: '批量设置',
    patch_clear: '批量清除',
    clear_all: '全部清除',
    add: '添加',
    edit: '修改',
    edit1: '编辑',
    delete: '删除',
    clear: '清除',
    refresh: '刷新',
    ope: '操作',
    expand: '展开',
    shrink: '收缩',
    confirm: '确定',
    editing: '配置中',
    config: '配置',
    save_edit: '保存配置',
    save: '保存',
    cancel: '取消',
    submit: '提交',
    select: '请选择',
    click_to_handle: '点击去处理',
    upload: '上传',
  },
  // 短语
  phrase: {
    suggest: '建议',
    remark: '备注',
    local: '本机',
    notice: '注意',
    help: '帮助',
    explain: '说明',
    tip: '提示',
    warn: '告警',
    notice_f: '@:phrase.notice：',
    remark_f: '@:phrase.remark：',
    explain_f: '@:phrase.explain：',
    tip_f: '@:phrase.tip：',
    auto: '自动',
    unknow: '未知',
    enable: '开启',
    disable: '关闭',
    close: '关',
    open: '开',
    close_btn: '关闭',
    status: '状态',
    effective: '已生效',
    ineffective: '未生效',
    serial: '序号',
    alltime: '所有时段',
    all: '全部',
    all_select: '全选',
    search: '搜索',
    searching: '搜索中',
    type: '类型',
    yes: '是',
    no: '否',
    high: '高',
    middle: '中',
    low: '低',
    connection: '已连接',
    disconnection: '未连接',
    online: '在线',
    offline: '离线',
    never_on: '从未上线'
  },
  // 操作提示
  tip: {
    add_success: '添加成功',
    del_success: '删除成功',
    remove_success: '清除成功',
    edit_success: '修改成功',
    edit1_success: '配置成功',
    ope_success: '操作成功',
    confirm_delete: '是否确认删除？',
    select_del_item: '请选择要删除的列表项',
    max_limit: '最大支持配置{cnt}条数据。',
    max_limit_f: '最大支持配置{0}条数据。'
  },
  // 符号
  symbol: {
    semic: '：',
    comma: '，',
    period: '。'
  },
  // 时间
  time: {
    year: '年',
    month: '月',
    day: '天',
    time: '日',
    hour: '时',
    minute: '分',
    second: '秒'
  },
  // wan config
  wan: {
    ip_addr_f: '@:sysinfo.ip_addr：',
    mac_addr_f: '@:sysinfo.mac_addr：',
    mask_addr_f: '@:sysinfo.mask：',
    gateway_addr_f: '@:sysinfo.gateway_addr：',
    dns_addr_f: '@:sysinfo.dns_addr：',
    ip_example: '格式：1.1.1.1',
    mac_example: '格式：00:11:22:33:44:55',
    mask_example: '格式：255.255.255.0',
    dns_example: '格式：114.114.114.114，多个以空格隔开',
    ip_range_example: '范围格式：192.168.1.2-192.168.1.100',
    net_addr: '网段地址不可使用',
    cast_addr: '广播地址不可使用',
    ip_gateway_same: 'IP地址不可与网关地址一样',
    ip_gateway_net_diff: '网关地址与IP地址不在同一个网段',
    invalid_ip_addr: '请输入有效的IP地址',
    invalid_mac_addr: '无效的MAC地址',
    invalid_mask_addr: '请输入有效的子网掩码',
    invalid_dns_addr: '请输入有效的DNS地址，多个以空格隔开',
    invalid_vlan_id: '请输入有效的VLAN ID',
    ip_no_empty: '请输入IP地址',
    vid_no_empty: '请输入VLAN ID',
    mac_no_empty: '请输入MAC地址',
    mask_no_empty: '请输入子网掩码',
    dns_no_empty: '请输入DNS',
    gateway_no_empty: '请输入网关地址',
    static_ip: '静态IP',
    dynamic_ip: '动态IP',
    pppoe: '宽带上网',
    net_protocol: '联网类型',
    net_protocol_f: '@:wan.net_protocol：'
  },
  sysinfo: {
    sys_info: '系统信息',
    sys_upgrade: '系统升级',
    ip_addr: 'IP地址',
    mac_addr: 'MAC地址',
    mask: '子网掩码',
    gateway_addr: '网关地址',
    dns_addr: 'DNS服务器',
    dev_type: '设备型号',
    dev_name: '设备名称',
    dev_name_modify: '修改设备名称',
    sn_num: 'SN号',
    soft_version: '软件版本',
    dev_mode: '工作模式',
    hard_version: '硬件版本',
    net_role: '自组网角色',
    net_role_f: '@:sysinfo.net_role：',
    hard_version_f: '@:sysinfo.hard_version：',
    dev_mode_f: '@:sysinfo.dev_mode：',
    dev_type_f: '@:sysinfo.dev_type：',
    dev_name_f: '@:sysinfo.dev_name：',
    sn_num_f: '@:sysinfo.sn_num：',
    mac_addr_f: '@:sysinfo.mac_addr：',
    soft_version_f: '@:sysinfo.soft_version：'
  }
};