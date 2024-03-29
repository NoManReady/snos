export default {
  // 操作类(动作)
  action: {
    patch_add: 'Batch Add',
    patch_convert: 'Batch Convert',
    patch_delete: 'Delete Selected',
    patch_edit: 'Batch Edit',
    patch_clear: 'Batch Clear',
    clear_all: 'Clear All',
    add: 'Add',
    edit: 'Edit',
    edit1: ' Edit',
    delete: 'Delete',
    clear: 'Clear',
    refresh: 'Refresh',
    ope: 'Action',
    expand: 'Expand',
    shrink: 'Collapse',
    confirm: 'OK',
    editing: 'Editing',
    config: 'Setup',
    save_edit: 'Save',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    select: 'Select',
    click_to_handle: 'Manage.',
    upload: 'Upload',
  },
  // 短语
  phrase: {
    suggest: 'Suggestion',
    remark: 'Remark',
    local: 'Local',
    notice: 'Note',
    help: 'Help',
    explain: 'Description',
    tip: 'Tip',
    notice_f: '@:phrase.notice:',
    remark_f: '@:phrase.remark:',
    explain_f: '@:phrase.explain:',
    tip_f: '@:phrase.tip:',
    auto: 'Auto',
    unknow: 'Unknown',
    enable: 'Enable',
    disable: 'Disable',
    close: 'Off',
    open: 'On',
    close_btn: 'Close',
    status: 'Status',
    effective: 'Active',
    ineffective: 'Inactive',
    serial: 'No.',
    alltime: 'All Time',
    all: 'All',
    search: 'Search',
    searching: 'Searching',
    type: 'Type',
    yes: 'Yes',
    no: 'No',
    high: 'High',
    middle: 'Medium',
    low: 'Low',
    connection: 'Connected',
    disconnection: 'Disconnected',
    online: 'Online',
    offline: 'Offline',
    never_on: 'Not Online Yet'
  },
  // 操作提示
  tip: {
    add_success: 'Add operation succeeded.',
    del_success: 'Delete operation succeeded.',
    remove_success: 'Clear operation succeeded.',
    edit_success: 'Edit operation succeeded.',
    edit1_success: 'Operation succeeded.',
    ope_success: 'Operation succeeded.',
    confirm_delete: 'Are you sure you want to delete the entry?',
    select_del_item: 'Please select at least one entry.',
    max_limit: 'Up to {cnt} entries can be added.',
    max_limit_f: 'Up to {0} entries can be added.'
  },
  // 符号
  symbol: {
    semic: ':',
    comma: ',',
    period: '.'
  },
  // 时间
  time: {
    year: 'Year',
    month: ' Month',
    day: 'Day',
    time: 'Day',
    hour: 'Hr',
    minute: 'Min',
    second: 'Sec'
  },
  // wan config
  wan: {
    ip_addr_f: '@:sysinfo.ip_addr:',
    mac_addr_f: '@:sysinfo.mac_addr:',
    mask_addr_f: '@:sysinfo.mask:',
    gateway_addr_f: '@:sysinfo.gateway_addr:',
    dns_addr_f: '@:sysinfo.dns_addr:',
    ip_example: 'Example: 1.1.1.1',
    mac_example: 'Example: 00:11:22:33:44:55',
    mask_example: 'Example: 255.255.255.0',
    dns_example: 'Example: 114.114.114.114',
    ip_range_example: 'Example: 192.168.1.2-192.168.1.100',
    net_addr: 'Please do not use the network address.',
    cast_addr: 'Please do not use the broadcast address.',
    ip_gateway_same: 'The IP address must be different from the gateway address.',
    ip_gateway_net_diff: 'The IP address must be in the same network as the gateway address.',
    invalid_ip_addr: 'Please enter a valid IP address.',
    invalid_mac_addr: 'Please enter a valid MAC address.',
    invalid_mask_addr: 'Please enter a valid subnet mask.',
    invalid_dns_addr: 'Please enter a valid DNS server address or DNS server addresses, each separated by a space.',
    invalid_vlan_id: 'Please enter a valid VLAN ID.',
    ip_no_empty: 'Please enter an IP address.',
    vid_no_empty: 'Please enter a VLAN ID.',
    mac_no_empty: 'Please enter a MAC address.',
    mask_no_empty: 'Please enter a subnet mask.',
    dns_no_empty: 'Please enter a DNS server address.',
    gateway_no_empty: 'Please enter a gateway address.',
    static_ip: 'Static IP Address',
    dynamic_ip: ' DHCP',
    pppoe:'PPPoE',
    net_protocol: 'IP Assignment',
    net_protocol_f: '@:wan.net_protocol:'
  },
  sysinfo: {
    sys_info: 'System Info',
    sys_upgrade: 'Upgrade',
    ip_addr: 'IP Address',
    mac_addr: 'MAC',
    mask: 'Submask',
    gateway_addr: 'Gateway',
    dns_addr: 'DNS Server',
    dev_type: 'Model',
    dev_name: 'Hostname',
    dev_name_modify: 'Edit Hostname',
    sn_num: 'SN',
    soft_version: 'Software Version',
    dev_mode: 'Work Mode',
    hard_version: 'Hardware Version',
    net_role:'Role',
    net_role_f:'@:sysinfo.net_role:',
    hard_version_f: '@:sysinfo.hard_version:',
    dev_mode_f: '@:sysinfo.dev_mode:',
    dev_type_f: '@:sysinfo.dev_type:',
    dev_name_f: '@:sysinfo.dev_name:',
    sn_num_f: '@:sysinfo.sn_num:',
    mac_addr_f: '@:sysinfo.mac_addr:',
    soft_version_f: '@:sysinfo.soft_version:'
  }
}
