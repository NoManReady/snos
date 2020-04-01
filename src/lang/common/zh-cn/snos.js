// 整网模块
export default {
  devlist: {
    list_desc: '查看网络中的{name}信息',
    no_switch: '（不包含交换机设备）',
    cur_group_f: '当前分组：',
    local: '本机',
    cfg_manage: '配置管理',
    master: '主',
    slave: '从',
    online_status: '在线状态',
    dev_type: '型号',
    user_cnt: '用户数',
    soft_version: '软件版本',
    ver_to_upgrade: '有新的推荐版本{0}，点击确认升级',
    sn: '序列号',
    group_name: '分组名称',
    channel: '信道',
    open_group: '展开分组',
    close_group: '收起分组',
    all_group: '所有分组',
    def_group: '默认组',
    aplist: 'AP列表',
    devlist: '设备列表',
    dev_warn_tip:
      '建议升级目标设备版本，体验更便捷的WEB管理。旧版本设备需新开浏览器页查看/配置，是否跳转到该设备的WEB页面？',
    dev_warn: '检测到目标设备的版本较旧',
    no_see: '不看了',
    to_see: '好的，跳转查看',
    found_diff_dev: '发现不属于本网络管理的设备，',
    enable_dev_fail: '可升级版本获取失败，请刷新页面重新获取',
    upgrade_confirm: '是否确认升级到新版本（{version}）？',
    upgrade_tip:
      '升级命令已下发，请等待设备后台<strong>静默升级</strong>，<div class="c-warning pt10">请几分钟后刷新页面查看。</div>',
    online: '在线',
    offline: '离线',
    never_online: '从未上线',
    // channelPopover
    edit_dev_channel: '修改设备信道',
    channel_name: '{type}信道',
    // aplist
    patch_ope: '批量操作',
    dev_upgrade: '升级设备',
    dev_delete: '删除设备',
    group_move: '迁移分组',
    dev_group_move: '迁移设备分组',
    select_group: '选择分组',
    no_other_group: '暂无其他分组',
    group_no_empty: '未选中分组',
    dev_upgrade_no_empty: '请选择要升级的设备',
    upgrade_tip: '当前选中的设备已是最新版本或是离线状态，不可升级。',
    upgrade_confirm_tip:
      '<div>当前选中 <span class="f-theme">{cnt}</span> 台设备，其中已是最新版本和处于离线状态的设备有<span class="f-theme">{off_cnt} </span>台，将不执行升级，是否确认升级 <span class="f-red">{on_cnt}</span> 台设备？</div>',
    delete_dev_item: '请选择要删除的设备',
    online_dev_tip: '当前选中的设备均为在线设备，不可删除',
    delete_confirm_tip:
      '<div>当前选中 <span class="f-theme">{cnt}</span> 台设备，其中 <span class="f-theme">{on_cnt} </span>台是在线设备不会删除，将删除 <span class="f-red">{off_cnt}</span> 台非在线设备，是否确认删除？</div>',
    move_dev_item: '请选择要迁移的设备',
    // group tree
    search_group: '搜索分组',
    no_group: '暂无分组',
    groupname_no_empty: '请输入分组名称',
    groupname_rule: '分组名称不能超过31个字符（单个中文占3个字符）',
    groupname_exist: '分组名称已存在',
    move_group_confirm: '该分组下的设备将会迁移至默认分组，是否确认删除？',
    group_limit: '最多支持添加 {cnt} 个分组',
    // hostname
    hostname_rule: '请输入中文,英文字母，数字，下划线，-，#或@',
    hostname_len_rule: '设备名称不能超过{len}个字符，中文占3个字符',
    // popover
    search_cur_group: '搜索当前分组',
    advanced_search: '高级搜索',
    list_filter: '列表筛选',
    // switch
    switch_list: '交换机列表',
    switch_list_tip: '查看当前网络中的交换机信息。',
    patch_del_off_dev: '批量删除离线设备',
    patch_upgrade_dev: '批量升级设备',
    go_eweb: '点击前往EWEB配置界面'
  },
  diagnose: {
    // alarm
    fault_alarm: '故障告警',
    fault_alarm_tip:
      '您可以在本页面查看故障告警信息，删除或取消关注某类告警等。',
    fault_alarm_list: '故障告警列表',
    alarm_time: '告警时间',
    alarm_desc: '告警详情',
    alarm_info: '告警信息',
    no_alarm_info: '（查询不到告警信息）',
    no_suggest_info: '（查询不到建议信息）',
    cancel_follow: '取消关注',
    cancel_follow_success: '取消关注成功',
    re_follow: '重新关注',
    re_follow_success: '重新关注成功',
    view_alarm_cancel: '查看“取消关注”的告警',
    del_alarm_tip1:
      '若您是<strong>不想关注</strong>此类告警，请点击右侧【<span class="c-success">取消关注</span>】按钮。',
    del_alarm_tip2:
      '<strong>未解决的告警</strong>若手动删除，一段时间后会<strong>再出现</strong>此类告警。',
    del_alarm_tip3:
      '<strong>已解决的告警</strong>可手动删除，或一段时间内未再发现此告警，系统也会<strong>自动删除</strong>。',
    del_alarm_tip4: '将此条告警从告警列表中删除？',
    cancel_follow_tip1:
      '取消关注后，系统将<strong>不再出现此类告警信息</strong>。',
    cancel_follow_tip2:
      '点击右上方【<span class="c-success">${this.unFocusText}</span>】按钮，可<strong>重新关注</strong>“已取消关注”的告警。',
    cancel_follow_tip3: '将取消关注此类告警并从告警列表中删除？',
    re_follow_tip1: '重新关注后，系统将<strong>出现此类告警信息</strong>。',
    re_follow_tip2:
      '点击告警列表右侧【<span class="c-success">取消关注</span>】按钮，可<strong>取消关注</strong>告警。',
    re_follow_tip3: '将重新关注此类告警？',
    show_all_alarm_tip:
      '当前关注了所有的告警，可点击列表中【取消关注】按钮，添加不关注的告警。',
    // dhcp serv
    addr_server: '地址服务器',
    addr_server_tip:
      '开启DHCP服务器后，可以为网络中的设备分配IP地址，方便登录不同的设备。该功能主要用于临时调试，因此开启30分钟后会自动关闭服务器。',
    dhcp_ser_status: 'DHCP服务器开关',
    addr_list: '地址列表',
    remain_lease: '剩余租期（{type}）',
    dhcp_serv_confirm: '确认{status}DHCP服务器?',
    enable_err: '开启失败，网络中已存在DHCP服务器',
    // log
    log_explain: '日志说明',
    view_log: '查看系统日志。',
    log_list: '日志列表',
    search_cfg: '查找相关配置',
    date: '时间',
    debug_level: 'debug级别',
    module: '模块',
    log_desc: '详细',
    // net check
    net_check: '网络自检',
    repair_suggest: '修复建议',
    go_repair: '去修复',
    begin_test: '开始检测',
    check_normal: '正常',
    check_doing: '检测中',
    check_err: '异常',
    repair_confirm: '确认跳转修复页面？',
    check_know: '知道了',
    begin_check_confirm: '确认开始设备自检？',
    check_confirm_tip:
      '您当前未连接到设备内网，可能影响检测结果，建议连接到设备内网后再重新检测，继续自检请点击确定',
    re_check: '重新检测',
    server_err_check: '服务器异常，请重新自检',
    // package
    pack_check: '抓包诊断',
    interface: '接口',
    protocol: '协议名',
    master_ip: '主机IP',
    file_size_limit: '限制文件大小',
    rom_remain: '当前内存剩余',
    pack_limit: '限制报文个数',
    no_limit: '不限制',
    download_link: '下载链接',
    pcap_link: '点击这里下载pcap文件',
    file_size_f: '文件大小：',
    click_delete_file: '点击删除文件',
    realtime_pack: '实时抓包中...',
    pack_time_f: '抓包时间：',
    lack_rom: '剩余内存小于1M，无法执行抓包',
    pack_captual: '正在抓包',
    pack_begin: '开始抓包',
    pack_stop: '停止抓包',
    invalid_ip_addr: '无效IP地址',
    del_pack_confirm: '确认删除包？',
    // tech
    tech_collect: '故障收集',
    tech_collect_tip:
      '打包设备配置文件到压缩文件，需解密解压，提供给开发人员的定位故障。',
    one_collect: '一键收集',
    // net tool
    net_tool: '网络工具',
    dia_type: '诊断方式',
    ping_chat: 'PING通信',
    route_track: '路由跟踪',
    domain_search: '域名查询',
    dest_ip_domian: '目的IP/域名',
    ping_cnt: 'PING次数',
    ping_pack_size: 'PING数据包大小',
    max_ttl: '路由跟踪最大TTL',
    on_check: '正在检测',
    stop_check: '停止检测',
    check_result: '检测结果',
    dest_ip_domain_empty: '请输入目的IP/域名',
    dest_ip_domain_invalid: '请输入正确的IP或域名',
    ping_cnt_empty: '请输入PING次数',
    pack_size_empty: '请输入数据包大小',
    max_ttl_empty: '请输入最大TTL',
    ping_err_tip: 'PING通信失败，请检查网络',
    route_err_tip: '路由跟踪失败，请检查网络'
  },
  header: {
    cur_dev_info: '当前登录设备的信息',
    click_edit_dev: '（点击配置此设备）',
    unknow_projname: '项目名未配置',
    has_noc_confirm: '该网络已绑定诺客云？',
    enter_noc: '点击进入诺客云',
    scan_enter_noc_f: '还未绑定诺客云账号？试试微信扫码入云：',
    weixin_manage: '使用微信小程序快速接入诺客，随时随地管理您的网络。',
    app_tip: '扫码下载APP，全面享受易网络！',
    app_easy: '整网配置，简单！',
    app_convenient: '远程管理，方便！',
    app_intelligent: '故障诊断，智能！',
    dev_mode: '开发者模式',
    dev_mode_open_tip: '（使用完毕后建议关闭，防止被他人使用）',
    dev_mode_status: '开发者模式{status}成功',
    dev_mode_fail_f: '设置失败，原因：',
    dev_mode_ok: '当前已是开发者模式',
    dev_mode_tip:
      '开发者模式是提供给具有开发经验者使用，使用者可以通过SSH进入设备控制台进行命令下发修改配置。',
    dev_mode_warn1: '使用完毕后请手动关闭，防止被他人使用。',
    dev_mode_warn2: '设备重启后会自动关闭开发者模式。',
    enable_dev_mode: '开启开发者模式'
  },
  nei: {
    net_list: '网络列表',
    nei_tip:
      '每个网络都有各自的设备和配置，可以将“其他网络”的设备添加到“我的网络”，使配置一致。',
    nei_add_tip:
      '正在添加{ total }个设备到我的网络， 已完成添加{ has } 个设备， 剩余{ stay } 个设备正在加入...{loading}',
    my_net: '我的网络',
    new_net: '新设备列表',
    wait_add_manually: '待手动加入',
    other_net: '其他网络',
    nei_pass_tip:
      '如需加入网络，请点击”添加到我的网络“，并依据提示进行下一步操作。这个过程中需要输入被添加设备的管理密码，如忘记密码请手动重置设备后再添加。',
    merge_tip: '合并超时，已统计如下：<br/>成功数：{success}, 失败数：{fail}<br/>合并结果可能不准确，请“刷新页面”查看最新结果。',
    refresh_page: '刷新页面',
    merge_change_tip:
      '检测到当前邻居列表为空，可能本设备角色变更（合并EG的时EAP会变为从设备），刷新页面人工核对网络合并结果。',
    empty_nei: '邻居列表为空',
    know_fresh_page: '知道了，刷新页面查看',
    success_tip:
      '成功添加<strong class="c-danger"> {cnt} </strong>个设备到我的网络',
    dev_cnt: '（{cnt} 台设备）',
    add_to_mynet: '添加到我的网络',
    gateway: '网关',
    router: '路由',
    other: '其他',
    switch: '交换',
    manage_pass: '管理密码',
    input_dev_pass: '请输入网络（{netname}）的管理密码',
    dest_net: '目标网络',
    dest_net_id: '请选择目标网络ID',
    forget_pass: '忘记密码，手动重置设备',
    join_to_mynet: '加入我的网络',
    forgot: '忘记密码',
    cfg_step_f: '重置步骤：',
    dev_power_on: '设备上电。',
    dev_reset: '请使用回形针或其他类似工具，插入设备的复位孔（Reset）中。',
    dev_long_click: '长按大于5s，直到指示灯闪烁为止。',
    i_know: '我知道了',
    destnet_to_mynet: '将选中设备添加到我的网络当中',
    mynet_to_destnet: '将我的设备添加到目标网络中',
    pass_no_empty: '请输入密码',
    destnet_no_empty: '请选择目标网络',
    joindev_no_empty: '请先选中当前网络下需要进行网络合并的设备',
    devjoin_confirm: '确认将这 {cnt} 个新设备添加到我的网络中吗?',
    new_dev: '新设备',
    unname_network: '未命名的网络',
    join_err_pass: '密码错误：{pass}台，SN:',
    join_err_server: '配置失败（可能网络相关问题）：{server}台，SN:',
    join_err_timeout:
      '网络超时（可能邻居IP变更，尝试重新选择设备再进行合并操作）：{timeout}台，SN:',
    join_err_common: '合并失败{reason}：{len}台，SN:',
    join_result_tip: '合并成功：{success}台, 失败：{fail}台，原因：'
  },
  network: {
    ip: 'IP地址',
    mask: '子网掩码',
    gateway: '网关',
    mac: 'MAC地址',
    advanced: '高级设置',
    wan: {
      link_type: '联网类型',
      dhcp_user_no_required: 'DHCP动态上网无需账号密码',
      dns_service: 'DNS服务器',
      broadband_account: '宽带账号',
      broadband_password: '宽带密码',
      get_account_tip: '已获取到账号密码。再次',
      get_account_tip2: '忘记账号密码？',
      get_account_tip3: '从旧设备中获取账号密码',
      vlanid_range: '范围为2~232 或 234~4090',
      mtu_range: '范围：（576~{mtuMax}）',
      default_route_priority: '默认路由优先级',
      biger_priority_by_smaller_value: '值越小优先级越高',
      dynamic_ip: '动态IP',
      static_ip: '静态IP',
      invalid_num: '请输入有效的数值（范围{num1}~{num2}）',
      between_wan_diffren_priority: '两个WAN不能用相同值，请修改其中一个WAN让优先级不同',
      invalid_value_more_then_0: '请输入有效的数值（大于等于0的整数）',
      clash_by_lan_ip: '与LAN内网IP地址冲突',
      change_ip_required: '请勿使用预留的IP地址',
      no_use_network: '网段地址不可使用',
      broadcast_address_invalid: '广播地址不可使用',
      ip_diffrent_with_gateway: 'IP地址不可与网关地址一样',
      ip_between_gateway_diffrent_network: '网关地址与IP地址不在同一个网段',
      broadband_password_is_required: '请输入宽带密码',
      broadband_account_is_required: '请输入宽带账号',
      invalid_mac: '请输入有效的MAC地址',
      mtu_is_required: '请输入MTU',
      route_priority_is_required: '请输入路由优先级',
      is_only_link_wan: '是否专线',
      dns_is_required: '请输入DNS服务器',
      gateway_is_required: '请输入网关地址',
      mac_is_required: '请输入MAC地址'
    },
    lan_cfg: 'LAN设置',
    port_vlan: '端口VLAN',
    client_list: '客户端列表',
    static_addr_alloc: '静态地址分配',
    dhcp_cfg: 'DHCP选项',
    dns_proxy: 'DNS代理',
    wan_cfg: 'WAN设置',
    net_cfg_page: '上网配置页面',
    dns_serv: '@:sysinfo.dns_addr',
    isp_cfg: '运营商/负载设置',
    single_line: '单线路',
    double_line: '双线路',
    three_line: '三线路',
    four_line: '四线路',
    cfg_valid_err: '配置参数校验不通过，请按提示修改。',
    // client-tab
    client_info_tip: '您可以在本页面查看DHCP的客户端相关信息。',
    hostname: '主机名',
    remain_lease: '@:diagnose.remain_lease',
    addto_static: '添加到静态地址',
    static_areadly: '已添加到静态地址',
    item_static_no_empty: '请选择要添加到静态地址的表项',
    static_add_limit: '最多支持配置 {cnt} 条静态绑定',
    static_add_confirm: '确认添加到静态地址分配列表中？',
    jump_to_info: '请跳转到静态地址分配查看详情。',
    // dhcp option
    dhcp_serv_cfg: 'DHCP服务器选项设置',
    dhcp_serv_cfg_tip: 'DHCP服务器选项是所有LAN口共用的配置。',
    dhcp_serv_rule:
      '检测到已开启自组网开关，EG不支持三层组网，因此禁配置#RJ#开头',
    dhcp_serv_enable_tip: '提示：在{0}的工作模式里关闭自组网开关',
    dhcp_serv_l3_cfg_tip: '配置三层组网时（#RJ#开头）',
    dhcp_serv_l3_tip1:
      '建议保存配置后在{0}中绑定IP或到主AP上设置WAN口为静态IP地址',
    static_addr_alloc_tip: '”@:network.static_addr_alloc“',
    dhcp_serv_l3_tip2:
      '为了让整网设备比较快速的重新获取IP地址和应用option43三层组网的配置，建议在主AP上进行整网重启',
    dhcp_serv_disable_tip: 'EG不支持三层组网，请到工作模式里关闭自组网开关',
    dhcp_serv_rule_tip1: '#RJ#开头，不能包含空格',
    dhcp_serv_rule_tip2: '#RJ#开头，后面最多可配置两个IP地址',
    ip_format_err: 'IP地址格式有误',
    dhcp_serv_def_ph: '请输入数字、字母、空格或小数点。',
    dhcp_serv_43_rule: 'IP地址、16进制字符或字符串',
    dhcp_serv_43_len_rule: '超过最大长度128（中文占3个字符）',
    // dhc-proxy
    dns_proxy_cfg: 'DNS服务器代理设置',
    dns_proxy_tip:
      'DNS服务器代理设置不是必须配置，设备默认会从上联设备中获取DNS服务器地址。',
    dns_status: 'DNS代理开关',
    dns_no_empty: '请输入DNS服务器地址',
    // static-alloc
    static_alloc_cfg: '静态地址分配页面',
    static_alloc_list: '静态地址分配列表',
    // vlan-port
    vlan_port_tip:
      '请先在{0}里增加VLAN，然后在本页面里设置基于VLAN的端口配置。',
    speed_f: '速率：',
    disable: '未启用',
    enable: '启用',
    receive_power: '受电',
    supply_power: '供电',
    desc_f: '描述：',
    remark_f: '@:phrase.remark_f',
    def_vlan: '默认VLAN',
    no_join: '不加入',
    vlan_save_tip: '修改配置后请点击【保存配置】生效',
    portname_rule: '请输入中文,英文字母，数字，下划线，-，#或@',
    portname_len_rule: '端口描述不能超过28个字符，中文占3个字符',
    // vlan-tab
    vlan_tab_tip:
      '检测到LAN口存在{addr}，为保证正常上网，已将LAN口IP地址从“{last}”改为“{def}”。',
    begin_addr: '开始地址',
    alloc_ip_cnt: '分配IP数',
    addr_lease: '地址租期（分钟）',
    dhcp_serv: 'DHCP服务',
    dns_serv_modity: 'DNS服务器需要去“{dhcp}”页面修改',
    addr_conflict: '地址冲突',
    ip_cnt_int: '分配IP数必须为正整数',
    ip_cnt_range: '分配IP数的范围为1-{cnt}个',
    gateway_net_exist: '此网段已存在配置，请修改IP地址或子网掩码',
    begin_addr_gt: '开始地址不能大于{max}',
    begin_addr_lt: '开始地址不能小于{min}',
    lease_range: '地址租期范围为2~2880分钟',
    remark_len_rule: '备注为1-28个字符',
    lease_no_empty: '请输入地址租期',
    data_err_fresh: '数据异常，请确保网络已联通并刷新页面后配置。',
    cfg_no_modify: '配置未修改',
    warn: '警告',
    alloc_no_empty: '请输入分配IP数',
    baddr_no_empty: '请输入开始地址',
    has_enable: '已开启',
    has_no_enable: '未开启'
  },
  overview: {
    cur_dev: '当前登录设备',
    dev_survey: '设备概况',
    mem_usage: '内存使用率',
    online_user_cnt: '在线用户数',
    network_status_f: '联网状态：',
    online: '已联网',
    offline: '联网异常',
    sys_run_f: '系统运行：',
    sys_time_f: '系统时间：',
    check_net: '（检测网络）',
    name_f: '名称：',
    dev_mode_tip1: '模式切换后，设备IP可能发生改变。',
    dev_mode_tip2: '修改终端地址，让终端Ping通设备。',
    dev_mode_tip3: '浏览器输入新地址重新访问WEB系统。',
    dev_mode_tip4: '系统根据工作模式呈现不同的菜单项。',
    dev_mode_tip5: '工作模式切换会恢复出厂并重启设备。',
    dev_mode_tip6: '路由模式，Nat路由转发。',
    dev_mode_tip7: 'AC模式，Bridge桥转发。',
    dev_mode_tip8: 'AP模式，Bridge桥转发。',
    net_discovery: '自组网发现',
    net_discovery_tip1: '开启自组网发现，首页会显示自组网角色。',
    net_discovery_tip2: '关闭自组网发现，单台设备独立模式。',
    net_discovery_tip3: 'AC模式下，设备默认开启自组网发现。',
    rj43_exist: '检测到Option43配置了#RJ#，EG不支持三层自组网，',
    rj43_tip1: '请关闭“自组网发现”',
    rj43_tip2: '“DHCP选项”',
    rj43_tip3: '删除#RJ#',
    rj43_tip: '{tip1}，或到{tip2}页{tip3}',
    rj43_tip4: '若想开启自组网发现，请先到{tip2}页面删除#RJ#',
    rj43_tip5: '开启自组网开关，EG不支持三层自组网，',
    rj43_tip6: '因此{tip2}页面Option43将不能配置#RJ#',
    ac_status: 'AC功能开关',
    ac_tip1: '默认开启，设备具备虚拟AC功能，管理下联设备。',
    ac_tip2: '关闭时，设备需通过自组网选举为AC才能管理下联设备。',
    switch_mode: '切换模式',
    route_mode: '路由模式',
    ac_mode: 'AC模式',
    ap_mode: 'AP模式',
    mode_switch_tip:
      '检测到Option43配置了#RJ#，EG不支持三层自组网，若想开启自组网发现，请先到“DHCP选项”页面删除Option43配置',
    cfg_conflict_tip: '配置冲突提示',
    mode_switch_confirm: '工作模式切换会恢复出厂并重启设备，确认切换？',
    modify_cfg_confirm: '确认修改配置？',
    mode_switch_success_tip:
      '模式已切换，请等设备重启恢复网络后，重新登录WEB系统。',
    cfg_fresh_tip: '配置已修改，稍后将自动刷新页面。',
    cfg_no_modify: '模式未修改',
    // net-view
    whole_net_status: '全网状态（在线设备）',
    internet: '互联网',
    online_user: '在线用户',
    wireless_user: '无线用户',
    ip_not_detected: '未检测到WAN口IP信息',
    // port status
    if_info: '接口信息',
    dev_desc_info: '设备详细信息',
    // sysinfo
    netjoin_tip1: '主AP/AC：设备做为AC可以管理下联设备',
    netjoin_tip2: '从AP/设备：设备已通过自组网接入AC管理。',
    netjoin_tip3: '未知：设备未自组网成功，以普通AP运行。',
    netjoin_tip4: '独立模式：设备未参与自组网。',
    netjoin_tip5: '若角色不对，尝试按{0}页面后查看。',
    f5_fresh: 'F5刷新',
    hostname_no_empty: '请输入设备名称',
    hostname_len_rule: '设备名称不能超过64个字符，中文占3字符',
    ac_master: '主AC',
    ap_master: '主AP',
    ap_slave: '从AP',
    dev_slave: '从设备',
    // wireless
    wireless_info: '无线信息',
    wireless_net_f: '无线网络：',
    encrypt_or_not_f: '是否加密：',
    guest_wifi_f: '访客Wi-Fi：',
    slave_wifi_notedit: '从AP或公寓WiFi不可编辑',
    edit_guest_wifi: '编辑访客Wi-Fi名称',
    wifi_is_exist: '已存在该名称：{name}',
    wifi_no_empty: '请输入Wi-Fi名称',
    wifipass_no_empty: '请输入Wi-Fi密码',
    wifipass_rule: '密码至少8位，最多16位',
    wifi_limit_tip: '当前Wi-Fi已达8个，请先去删除一个才能开启访客Wi-Fi。',
    unopened_now: '暂不开启',
    delete_wifi: '去删除Wi-Fi',
    close_wifi_confirm: '是否关闭访问Wi-Fi？'
  },
  quickmacc: {
    found_dev_tip: '共发现 {total} 台设备， {newcnt} 台设备待手动加入。',
    cnt_help: '设备数量不对？点击帮助',
    confirm_dev_cnt:
      '请确认：设备数量及连线正确后，开始配置。注意：非网管交换机不会出现在列表中。',
    weixin_scan: '更多帮助，微信扫一扫，查看',
    net_name: '网络名称',
    net_name_example: '例如：XX别墅，XX企业，XX酒店等',
    net_name_ehr: '我的位置',
    net_name_example_ehr: '例如：客厅、主卧、次卧等',
    manage_pass: '@:nei.manage_pass',
    pass_example: '设置后管理该项目下的任一设备，均需输入该密码。请牢记',
    net_type: '上网方式',
    auto_set: '当前IP',
    wifi_name: 'Wi-Fi名称',
    wifi_name_f: '@:quickmacc.wifi_name：',
    manage_pass_f: '@:nei.manage_pass：',
    proj_name_f: '项目名称：',
    encrypt: '加密',
    no_encrypt: '不加密',
    wifi_pass: 'Wi-Fi密码',
    internet_fail: '互联网连接失败',
    internet_fail_reason: '设备无法访问网络，原因未知，建议排查后重新检测。',
    not_connect_internet: '暂不连接互联网',
    cfg_success: '基础配置成功，已可访问互联网',
    judge_to_whole: '自动跳转至全网配置中...',
    lan_ip_conflict: '与LAN内网IP地址冲突',
    reserved_ip_addr: '请勿使用预留的IP地址',
    wifi_is_exist: '@:overview.wifi_is_exist',
    proj_name_empty: '请输入网络名称',
    proj_name_empty_ehr: '请给网络做个标识吧',
    parlor: "客厅",
    manage_pass_empty: '请输入管理密码',
    manage_pass_rule: '密码至少8位，最多31位',
    pppoe_info: '已填入/更新为设备当前的IP信息',
    fetch_info_fail: '未获取到设备的IP信息',
    connect_fail: '检测失败，可能是设备IP地址变了，请检查确认。',
    connect_timeout:
      '检测时间结束，网络可能已联通，但还未稳定，可尝试重新检测。',
    connect_err_unknow: '检测时间结束，网络连接失败，原因未知，尝试重新检测。',
    // wechat
    scan_complete: '通过微信扫码，完成设备配置',
    scan_and_macc: '微信扫码，即可完成注册/登录诺客云平台',
    goto_eweb: '完成配置，进入EWEB首页',
    require_quick: '当前是出厂配置，需要{quick}后才可修改配置。',
    goto_quick: '前往{quick}',
    check_net_type: '检测到当前上网方式是',
    no_check_net_type: '未检测到上网方式'
  },
  systool: {
    // date
    date_cfg: '时间设置',
    date_view_cfg: '查看和设置系统时间。',
    date_cfg_tip: '（设备没有RTC模块，重启设备不保存时间。）',
    cur_time: '当前时间',
    set_time: '设置时间',
    time_by_internet: '网络获取时间',
    time_by_manual: '手动设置时间',
    date: '时间',
    select_date: '选择日期时间',
    get_host_time: '获取主机时间',
    date_no_empty: '请选择要设置的时间',
    date_cfg_confirm:
      '请确认您所设置的时间与当前网络时间一致，否则可能导致配置无法同步',
    // whole internet
    whole_manage: '整网管理',
    manage_tip:
      '注意！整网管理的操作会影响整个网络的配置！配置下发后页面可能会无响应，请尝试重新获取地址登录。',
    reboot: '系统重启',
    reboot_time: '定时重启',
    reset: '恢复出厂',
    select: '选择',
    define_dev: '指定设备',
    whole_dev: '整网设备',
    move: '移动',
    ope_able: '可操作设备',
    select_dev: '已选设备',
    search_sn: '搜索SN/设备型号',
    item: '选项',
    unbind_account: '解除用户账号绑定',
    delete_macc: '（当前账号不再拥有这些设备，云端自动删除该账号下的设备）',
    select_dev_ope: '请选择要操作的设备',
    whole_cfg_tip:
      '整网管理操作会影响整个网络的配置，配置下发后页面可能会无响应，需重新获取地址登录。确认继续操作？',
    ope_cfg_success: '操作指令下发成功。',
    // password
    dev_pass: '设备密码',
    dev_pass_tip: '修改设备密码成功后需重新登录。',
    edit_dev_pass: '修改设备密码',
    dev_pass_def: '默认密码',
    dev_pass_card_app: '（也是APP管理设备的密码）',
    dev_pass_card: '管理设备的凭证',
    dev_pass_desc:
      ' 当前设备密码是{def}！请先设置密码以管理设备。设备密码是{card}，确认修改前请牢记设备密码。',
    old_pass: '原设备密码',
    new_pass: '新设备密码',
    confirm_pass: '确认新密码',
    old_no_empty: '请输入原密码',
    old_pass_err: '原密码错误',
    new_no_empty: '请输入新密码',
    new_pass_again: '请再次输入新密码',
    pass_is_diff: '两次密码输入不一致',
    modify_pass_success: '密码修改成功',
    back_and_import: '备份与导入',
    session_time: 'WEB会话超时时间',
    session_timeout: '登录超时时间',
    session_no_empty: '请输入web登录超时时间',
    session_range: '超时时间10分钟~120分钟（600~7200）',
    online_upgrade: '在线升级',
    local_upgrade: '本地升级',
    back_diff_tip:
      '如果您导入的配置文件版本与现有版本差距过大，有可能导致配置信息丢失。',
    back_export_tip:
      '导入配置前建议先{0}再导入配置！导入配置信息后，设备将自动重启。',
    back_cfg: '备份配置',
    backup: '备份',
    back_cfg_info: '备份配置信息',
    export_cfg_info: '导入配置信息',
    file_path: '文件路径',
    select_bin: '请选择配置包',
    view: '浏览',
    import: '导入',
    uploading: '上传中...',
    restoreing: '配置恢复中...',
    require_valid_bin: '请上传正确的配置包',
    file_upgrade_fail: '文件上传失败，请重新上传',
    upload_per: '上传中（{n}%）',
    back_import_confirm: '确定导入配置并重启设备？',
    reset_cfg: '恢复出厂设置',
    export_cur_cfg: '导出当前配置',
    reset_tip:
      '恢复出厂设置，将删除当前所有配置。如果当前系统存在有用的配置，可先{export}后再恢复出厂设置。',
    reset_tip_f:
      '恢复出厂设置，将删除当前所有配置。如果当前系统存在有用的配置，可先{0}后再恢复出厂设置。',
    dev_rebooting: '设备重启中...',
    reset_confirm:
      '此操作将删除所有自定义的配置信息并重启设备，确定恢复出厂设置？',
    reset_and_reboot: '恢复出厂并重启设备中...',
    reboot_tip: '在系统重启过程中，请不要将设备断电！',
    reboot_sys: '重启系统',
    reboot_confirm: '重启设备需要重新登录，是否确认重启？',
    time_reboot_tip:
      '开启此功能将在指定时间进行定时重启，以获得更好的体验。建议定时重启时间在凌晨或无人使用网络的时间段执行。',
    time_reboot_pd: '注意：定时重启时，下联设备也会重启。',
    time_reboot_help:
      '定时功能基于系统时间工作，需要本设备的时间准确才能正常生效。',
    reboot_function: '定时重启功能',
    week: '星期',
    weekday: ['一', '二', '三', '四', '五', '六', '日'],
    select_week: '请选择星期',
    upgrade_tip1: '升级过程中请不要刷新页面或者关闭浏览器。',
    upgrade_tip2:
      '请确保在设备升级过程中，不要将设备断电，不要对页面进行刷新。升级完毕，设备将自动重启。',
    pack_path: '安装包路径',
    bin_diff_large: '（如果版本差异太大，建议不保留配置升级）',
    keep_cfg: '保留配置',
    auto_upgrade: '凌晨升级',
    auto_upgrade_tip: '为提高你的用户体验，检测到新版本时，系统将在设定的自动升级',
    auto_upgrade_open: '检测到推荐版本时，系统将在设定的时间自动更新',
    auto_upgrade_time: '升级时间',
    auto_upgrade_close: '建议开启凌晨升级，保持最新版本，获得最佳的用户体验，确定关闭？',
    upload_success: '升级包已上传，点击确认开始升级。升级过程请勿断电！',
    bin_name_f: '升级包名称：',
    bin_size_f: '升级包大小：',
    keep_cfg_upgrade: '将保留配置升级',
    clear_cfg_upgrade: '将清空配置升级',
    file_bin_size_over: '（升级包文件太大，无法升级）',
    upload_valid_pack: '请上传正确的安装包',
    pack_validing: '文件校验中',
    on_upgradeing: '正在升级设备...',
    online_upgrade_tip:
      '在线升级会保留当前配置，升级过程中会重启设备，请不要刷新或关闭浏览器，升级成功会自动跳转到登录页。',
    cur_version: '当前版本',
    on_fetch_version: '正在获取版本信息',
    new_version: '新版本号',
    new_version_explain: '新版本说明',
    oup_tip_bin: '“下载升级包”',
    oup_tip1: '1、若您的设备无法访问外网，请点击{0}保存到本地电脑。',
    oup_tip_local: '“本地升级”',
    oup_tip2: '2、接着通过{0}页面，选取升级包文件上传到设备进行升级。',
    upgrade_quick: '马上升级（推荐）',
    file_info: '文件信息'
  },
  comp: {
    clear_select: '清空重选',
    modify_pass: '密码修改',
    help_tip: '点击问小睿问题',
    help_tip1: '智能小睿哥，有问必答~',
    do_self: '自定义',
    week: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
    goTop: '返回顶部'
  },
  // Steps
  steps: {
    steps1: '1、请将旧路由和新路由插电启用',
    steps2: '2、用一根网线一头插入旧路由的WAN口，另一头插入新路由的LAN口',
    steps3: '3、点击"@:steps.get_start"',
    steps4: '正在获取，请稍后...',
    get_start: '开始获取',
    loading_response: '设备正在获取宽带账号密码，请等待结果返回...',
    get_connected_confirm: '您已根据提示连接好设备，否则获取账号将超时或异常。',
    confirm_is_required: '请确认',
    get_start_by_link: '已连接，开始获取',
    check_response: '我再检查下',
    response_wright: '已获取到账号密码并填充到页面',
    next_get: '重新获取',
    get_account_error_tip: '获取账号密码失败：',
    title: "从旧路由器获取PPPoE账号",
    stepTip: '操作步骤：',
    error1: '1、确认两个路由器的网线连接正确（按图示）',
    error2: '2、确认连接两个路由器的网线是良好的',
    error3: '3、重启“旧路由器”后，重新尝试',
    over_check_error: '检测超时或异常'
  }
};
