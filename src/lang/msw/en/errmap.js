export default {
  errmap: {
    // lua错误码及通用错误码表  范围：201-250
    201: 'The parameter is invalid.',
    202: 'Write error.',
    203: 'The file does not exist.',
    204: 'Failed to connect to ubus.',
    205: 'Failed to allocate memory.',
    206: 'Parameter type error..',
    // 端口配置错误码表  范围：251-310
    251: 'Failed to identify the aggregate port.',
    252: 'Failed to fetch the port status.',
    253: 'Failed to configure the port.',
    254: 'Failed to fetch the duplex mode.',
    255: 'Failed to configure the duplex mode.',
    256: 'Failed to fetch the port speed.',
    257: 'Failed to configure the port speed.',
    258: 'Failed to fetch the flow control data.',
    259: 'Failed to configure the flow control.',
    260: 'Failed to fetch the port attribute.',
    261: 'Failed to configure the port attribute.',
    262: 'Failed to fetch the port MTU.',
    263: 'Failed to configure the port MTU.',
    264: 'Failed to fetch the port EEE.',
    265: 'Failed to configure the port EEE.',
    266: 'Failed to fetch the port description.',
    267: 'Failed to configure the port description.',
    268: 'Failed to fetch the link.',
    269: 'Failed to fetch the error.',
    // 端口风暴控制错误码表  范围：311-320
    311: 'Failed to configure the storm control.',
    312: 'Failed to configure unicast storm control.',
    313: 'Failed to configure multicast storm control.',
    314: 'Failed to configure broadcast storm control.',
    315: 'Failed to configure the storm control mode.',
    // 端口保护错误码表  范围：321-330
    321: 'Failed to fetch the port protection status.',
    322: 'Failed to configure port protection.',
    // 聚合口错误码表  范围：331-360
    331: 'Failed to delete the aggregate port.',
    332: 'Failed to fetch the member port.',
    333: 'Failed to configure the member port.',
    334: 'Failed to fetch load balancing status.',
    335: 'Failed to configure load balancing.',
    // 线缆检测错误码表  范围：361-370
    361: 'Cable diagnostics error.',
    // 端口限速错误码表  范围：371-380
    371: 'Input rate limiting error.',
    372: 'Output rate limiting error.',
    // 流量日志错误码表  范围：381-390
    391: 'Flow reset error.',
    // acl错误码表  范围：391-450
    // vlan错误码表  范围：451-600
    451: 'Failed to fetch the VLAN description.',
    452: 'Failed to create the VLAN.',
    453: 'Failed to delete the VLAN.',
    454: 'Failed to edit the VLAN.',
    455: 'The VLAN is invalid.',
    456: 'The VLAN does not exist.',
    457: 'The VLAN description already exists.',
    458: 'Failed to fetch the VLAN list.',
    459: 'Failed to fetch the VLAN count.',
    460: 'Failed to fetch the VLAN configuration.',
    461: 'The VLAN is in use.',
    462: 'Port mode error.',
    463: 'Failed to configure the port mode.',
    464: 'Failed to fetch port mode configuration.',
    465: 'Failed to configure the Access VLAN or Native VLAN.',
    467: 'Failed to fetch the PVID of the VLAN.',
    468: 'Failed to configure the permitted VLAN.',
    469: 'Failed to fetch the permitted VLAN.',
    // mac错误码表  范围：601-650
    601: 'Failed to fetch the CPU MAC address.',
    602: 'The MAC address is invalid.',
    603: 'The port is invalid.',
    604: 'Failed to add the static MAC address.',
    605: 'Failed to delete the static MAC address.',
    606: 'Failed to fetch the static MAC address.',
    607: 'Failed to add the filter MAC address.',
    608: 'Failed to delete the filter MAC address.',
    609: 'Failed to fetch the filter MAC address.',
    610: 'Failed to clear the dynamic MAC address.',
    611: 'Failed to delete the dynamic MAC address according to the VLAN.',
    612: 'Failed to clear the dynamic MAC address according to the port.',
    613: 'Failed to clear the dynamic MAC address according to the MAC address.',
    614: 'Failed to fetch the dynamic MAC address count.',
    615: 'Failed to fetch the dynamic MAC address.',
    616: 'Failed to configure the aging time.',
    617: 'Failed to fetch the aging time.',
    618: 'Failed to search the MAC address.',
    619: 'Failed to fetch the MAC address count.',
    620: 'Failed to fetch the MAC address.',
    // stp错误码表。 范围：651-700
    651: 'Failed to fetch STP configuration.',
    652: 'Failed to configure STP globally.',
    653: 'Failed to configure the STP mode.',
    654: 'Failed to configure the STP forward delay.',
    655: 'Failed to configure the STP hello time.',
    656: 'Failed to configure the STP max age.',
    657: 'Failed to configure the global priority.',
    658: 'Failed to fetch the global priority.',
    659: 'Failed to configure the recovery time of the STP port.',
    660: 'Failed to fetch the recovery time of the STP port.',
    661: 'Failed to configure the priority of the STP port.',
    662: 'Failed to fetch the priority of the STP port.',
    663: 'The priority of the STP port is invalid.',
    664: 'Failed to configure the STP connection type.',
    665: 'Failed to fetch the STP connection type.',
    666: 'STP connection type error.',
    667: 'Failed to configure fastport of the STP port.',
    668: 'Failed to fetch fastport of the STP port.',
    669: 'Failed to configure bpdu_guard of the STP port.',
    670: 'Failed to fetch bpdu_guard of the STP port.',
    671: 'Failed to fetch the STP port information.',
    672: 'Failed to fetch the STP mst information.',
    // lldp错误码表。 范围：701-730
    701: 'Failed to fetch global LLDP status.',
    702: 'Failed to configure LLDP globally.',
    703: 'Failed to fetch the LLDP hold multiplier.',
    704: 'Failed to fetch the LLDP transmit interval.',
    705: 'Failed to fetch the LLDP forward delay.',
    706: 'Failed to fetch the LLDP transmit interval, forward delay and hold multiplier.',
    707: 'Failed to fetch the LLDP reinitialization delay.',
    708: 'Failed to configure the LLDP reinitialization delay.',
    709: 'Failed to fetch the LLDP fast count.',
    710: 'Failed to configure the LLDP fast count.',
    711: 'Failed to fetch Tx/Rx LLDPDU.',
    712: 'Failed to configure Tx/Rx LLDPDU.',
    713: 'Failed to fetch the LLDP-MED status.',
    714: 'Failed to configure the LLDP-MED.',
    715: 'Failed to fetch the MAC address.',
    716: 'Failed to fetch the local device information.',
    717: 'Failed to fetch neighboring device information.',
    // dhcp_snooping错误码表。 范围：731-750
    731: 'Failed to configure DHCP Snooping.',
    732: 'Failed to fetch DHCP Snooping status.',
    733: 'Failed to configure the trusted port.',
    734: 'Failed to fetch the trusted port.',
    735: 'Failed to configure DHCP Snooping Option 82.',
    736: 'Failed to fetch DHCP Snooping Option 82 status.',
    // mirror错误码表。 范围：751-780
    751: 'Failed to delete the mirroring group record.',
    752: 'Failed to fetch the status of the mirroring group record.',
    753: 'Failed to fetch the source port.',
    754: 'Failed to configure the source port.',
    755: 'Failed to fetch the destination port.',
    756: 'Failed to configure the destination port.',
    757: 'Failed to fetch the packet receiving status of the destination port.',
    758: 'The packet type on the source port is invalid.'
  }
}