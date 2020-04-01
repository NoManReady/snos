export default {
  arp: {
    list: 'ARP List',
    arp_tip:
      'The device learns IP-MAC mapping of all devices connected to its interfaces. You can bind or filter MAC addresses.',
    mac_bind: 'Bind',
    mac_filter: 'Filter',
    arp_help: 'You can cancel IP-MAC binding in batches on the {bind} page.',
    arp_help1: 'You can delete filtering rules in batches on the {filter} page.',
    arp_bind_tip1:
      ' The binded and filtered MAC addresses in the ARP list cannot be selected for Batch Bind or Batch Filter operation.',
    arp_bind_tip2: 'The binded MAC addresses in the ARP list cannot be selected for Batch Bind operation.',
    search_by_ipmac: 'Search by IP/MAC',
    patch_bind: 'Batch Bind',
    patch_filter: 'Batch Filter',
    add_to_bind: 'Add to IP-MAC binding list.',
    had_bind: 'Binded',
    add_to_filter: 'Add to MAC filtering list.',
    has_filter: 'Filtered',
    select_ip_mac_bind: ' Please select at least one entry.',
    ip_mac_binded: 'The IP-MAC binding already exists.',
    bind_limit: 'Up to {max} IP-MAC bindings can be added. You have added ${has} entries and you can add ${stay} entries more.',
    bind_confirm: 'Are you sure you want to add the entry to the IP-MAC binding list?',
    select_mac_filter: 'Please select at least one entry.',
    filter_confirm: 'Are you sure you want to add the entry to the filtering rule list?'
  },
  arp_bind: {
    mac_ip: 'MAC Binding',
    bind_tip:
      'Enable ARP guard and configure IP-MAC binding to improve network security.',
    arp_prot: 'ARP Guard',
    prot_tip: 'Only the devices configured with IP-MAC binding are allowed to access the Internet.',
    ip_mac_list: 'IP-MAC Binding List',
    bind_limit: 'Up to {max} IP-MAC bindings can be added.',
    select_ip: 'Enter or select an IP address.',
    select_mac: 'Enter or select a MAC address.',
    ip_exist: 'The IP address already exists.',
    mac_exist: 'The MAC address already exists.',
    add_limit: 'Up to {max} entries can be added to {name}.',
    arp_bind_confirm: 'Are you sure you want to {status} ARP guard?'
  },
  arp_filter: {
    mac_filter: 'MAC Filtering',
    filter_tip: 'Enable MAC address filtering and configure the filtering type to control the host\'s access to the Internet.',
    enable_tip: 'Click to enable MAC address filtering.',
    allow_list: 'Only the following hosts are allowed to access the Internet.',
    forbid_list: 'The following hosts are not allowed to access the Internet.',
    filter_type: 'Filtering Type',
    black_list: 'Blacklist',
    white_list: 'Whitelist',
    rule_list: 'Filtering Rule List',
    filter_limit: 'Up to {max} rules can be added.',
    remark_rule: 'The remark cannot be longer than 32 characters.'
  }
};