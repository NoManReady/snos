export default {
  mac: {
    mac_addr: 'MAC',
    ip_addr: 'IP Address',
    mac_addr_list: 'MAC List',
    static_mac_addr: 'Static MAC',
    dynamic_mac_addr: 'Dynamic MAC',
    filter_mac_addr: 'Filter MAC',
    mac_cfg: 'Aging Time',
    arp_addr_list: 'ARP List',
    // list
    search_by_mac: 'Search by MAC',
    search_by_vlan: 'Search by VLAN',
    search_by_port: 'Search by Port',
    static: 'Static',
    dynamic: 'Dynamic',
    filter: 'Filter',
    // static
    static_notice_tip: '{0} The switch forwards packets based on the MAC address table. Bind a static MAC address with a port, and the packet destined for this address will be forwarded to the port. You can configure MAC address binding for a port enabled with 802.1x authentication.',
    static_add_tip: 'Add Static MAC',
    no_pc_mac: '{mac} is a device MAC address and cannot be added.',
    static_limit_over: 'The number of static MAC addresses has reached the limit.',
    cfg_is_exist: 'The MAC address already exists.',
    // dynamic
    clear_by_mac: 'Clear by MAC',
    clear_by_port: 'Clear by Port',
    clear_by_vlan: 'Clear by VLAN',
    // filter
    filter_notice_tip: '{0} The switch forwards packets based on the MAC address table. If a packet containing the filter MAC address reaches the VLAN, the packet will be discarded. You can configure the filter MAC address to guard against an ARP attack.',
    filter_add_tip: 'Add Filter MAC',
    filter_limit_over:'The number of filter MAC addresses has reached the limit.',
    // base
    mac_agetime:'Aging Time',
    agetime_f:'Aging Time (Sec):',
    agetime_range:'Range: 10-630',
    agetime_tip:' Range: 10-630. 0 indicates never aging.',
    agetime_no_empty:'Please enter an aging time.',
    // arp
    arp_notice_tip:'The device learns IP-MAC mapping of all devices connected to its interfaces.',
    search_by_ipmac:'Search by IP/MAC address'
  }
}
