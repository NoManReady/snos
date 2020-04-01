export default {
  "authTabJson": {
    "title": "WeChat/SMS/One-Click Auth",
    "items": [
      {
        "title": "Server Type",
        "content": "This feature requires settings on MACC.",
        "frags": [
          "Connect WiFi via WeChat: Connect WiFi > Follow a WeChat public account > Access the Internet.",
          "SMS Auth: Connect WiFi > Click Access Internet on the portal page > Enter your mobile number and get a verification code > Enter the verification code > Access the Internet.",
          "One-Click Auth: Connect WiFi > Click OK on the Portal page > Access the Internet."
        ]
      },
      {
        "title": "Client Escape",
        "content": "Clients can access the Internet without authentication when there is a server error."
      }
    ]
  },
  "accountJson": {
    "title": "Account Auth",
    "items": [
      {
        "title": "Accounts",
        "content": "The number of existing accounts."
      },
      {
        "title": "Auth IP/IP Range",
        "content": "The client needs to pass authentication before accessing the Internet."
      },
      {
        "title": "Account Settings",
        "content": "An account can be used by more than one client.",
        "frags": [
          "MAC: An account can be used by up to 5 clients. These clients can access the Internet without being authenticated again."
        ]
      }
    ]
  },
  "guestAuthJson": {
    "title": "Authorized Auth",
    "items": [
      {
        "title": "Popup Message",
        "content": " The message will be displayed on the popup page."
      },
      {
        "title": "Auth IP/IP Range",
        "content": "The client needs to pass authentication before accessing the Internet."
      },
      {
        "title": "Uptime Limit",
        "content": "When the timer expires, the client will be offline and needs to be authorized again."
      },
      {
        "title": " Authorization IP/IP Range ",
        "content": "The client can authorize access to the Internet."
      }
    ]
  },
  "guestScanJson": {
    "title": "QR Code Auth",
    "items": [
      {
        "title": "Auth IP/IP Range",
        "content": "The client needs to pass authentication before accessing the Internet."
      },
      {
        "title": "Uptime Limit",
        "content": "When the timer expires, the client will be offline and needs to scan the QR code again."
      },
      {
        "title": "Dynamic QR Code",
        "content": "The dynamic QR code once changed will be invalid. "
      },
      {
        "title": " Popup Message",
        "content": "The message will be displayed on the popup page."
      }
    ]
  },
  "behaviorDateManageJson": {
    "title": "Time List",
    "desc": "You can view and manage time settings on this page.",
    "items": [
      {
        "title": "Time Name",
        "content": "Set a time name."
      },
      {
        "title": "Time Span",
        "content": "Set a managed time span.",
        "frags": [
          "Time: Select a time block on the calendar."
        ]
      }
    ]
  },
  "behaviorAddrManageJson": {
    "title": "IP Address Group List",
    "desc": "You can view and manage IP address settings on this page.",
    "items": [
      {
        "title": "Group Name",
        "content": "Customize an IP address group name."
      },
      {
        "title": "IP Range",
        "content": "Set a start IP address and an end IP address. You can click + on the page to add more IP addresses."
      }
    ]
  },
  "behaviorAppControlJson": {
    "title": "App Control",
    "desc": "You can view and manage application control settings on this page.",
    "items": [
      {
        "title": "IP Address Group",
        "content": " Set a managed IP address group."
      },
      {
        "title": "Time",
        "content": "Set a managed time span when managed clients cannot access the blocked application."
      },
      {
        "title": "Blocked List",
        "content": "Select applications to be blocked."
      },
      {
        "title": "Remark",
        "content": "Set a remark up to 64 characters long."
      },
      {
        "title": "Status",
        "content": "Enable or disable a rule."
      }
    ]
  },
  "behaviorQqbwListJson": {
    "title": "Rule List",
    "desc": "You can view and manage QQ whitelist and blacklist settings on this page.",
    "items": [
      {
        "title": "IP Address Group",
        "content": "Set a managed IP address group."
      },
      {
        "title": "Time",
        "content": "Set a managed time span."
      },
      {
        "title": "QQ",
        "content": "Set QQ numbers."
      },
      {
        "title": "Remark",
        "content": "Set a remark up to 64 characters long."
      },
      {
        "title": "Status",
        "content": "Enable or disable a rule."
      }
    ]
  },
  "behaviorSiteGroupJson": {
    "title": "Website Group",
    "desc": "You can view and manage website group settings on this page.",
    "items": [
      {
        "title": "Group Name",
        "content": "Set a unique group name up to 64 characters long."
      },
      {
        "title": "Group Member",
        "content": "Set group members. The group member can be a complete URL (example: www.baidu.com) or a domain (example: *.56.com). If you want to add a domain, please make sure that the domain starts with *."
      }
    ]
  },
  "behaviorSiteVisiterJson": {
    "title": "Rule List",
    "desc": "You can view and manage website filtering settings on this page.",
    "items": [
      {
        "title": "IP Address Group",
        "content": "Set a managed IP address group."
      },
      {
        "title": "Time",
        "content": "Set a managed time span."
      },
      {
        "title": "Control Type (Block)",
        "content": "Allow or block websites."
      },
      {
        "title": "Blocked Website Type",
        "content": "Select websites to be blocked."
      },
      {
        "title": "Remark",
        "content": "Set a remark up to 64 characters long."
      }
    ]
  },
  "accessCtrlJson": {
    "title": "ACL List",
    "desc": "You can manage and view ACL settings on this page.",
    "items": [
      {
        "title": "Rule",
        "content": "Set an ACL rule based on a MAC address or an IP address.",
        "frags": [
          "MAC: Set a source MAC address.",
          "Src IP Address: Set a source IP address and a port. A blank value indicates all IP addresses and all ports. ",
          "Dest IP Address: Set a destination IP address and a port. A blank value indicates all IP addresses and all ports.",
          "Protocol: Select a protocol type."
        ]
      },
      {
        "title": "Control Type",
        "content": "There are two types available:",
        "frags": [
          "Allow: Allow packets to pass.",
          "Block: Block packets."
        ]
      },
      {
        "title": "Active Time",
        "content": "Select or customize a time span when an ACL is active."
      },
      {
        "title": "Interface",
        "content": "Select an interface which an ACL is applied to. Default: WAN port.",
        "frags": [
          "Access control rules cannot block the traffic between the server and the client's intranet users in the interface domain of the external network. They must be in the internal network to take effect."
        ]
      },
      {
        "title": "Active",
        "content": "If the current time is within the active time span, the policy is active. If not, the policy is inactive.",
        "frags": [
          "Yes: The policy is active now. ",
          "No: The policy is inactive now."
        ]
      },
      {
        "title": "Remark",
        "content": "Set a remark up to 28 characters long."
      },
      {
        "title": "Match Order",
        "content": "The packet flow will be matched with the ACL from up to down until there is a successful match. You can move an ACL up or down."
      }
    ]
  },
  "timeLimitJson": {
    "title": "Uptime Limit",
    "desc": "You can view and manage uptime limit settings on this page.",
    "items": [
      {
        "title": "MAC",
        "content": "The MAC address of a client."
      },
      {
        "title": "Username",
        "content": "The username of a client. You can search for clients by usernames."
      },
      {
        "title": "Blocked Time",
        "content": "The time span when a client is prevented from accessing the Internet."
      },
      {
        "title": "Active",
        "content": "If the current time is within the blocked time span, the policy is inactive. If not, the policy is active."
      }
    ]
  },
  "dateJson": {
    "title": "Time Settings",
    "desc": "You can view and manage system time settings.",
    "items": [
      {
        "title": "Current Time",
        "content": "If not set or synchronized with a time server, the system time is the manufacture time."
      },
      {
        "title": "Select",
        "content": "Select a time setting mode."
      },
      {
        "title": "Time",
        "content": "Select Manually Set and set the time. You can also click Fetch Host Time to fetch the device time."
      }
    ]
  },
  "recoverJson": {
    "title": "Restore",
    "desc": "You can restore the device to factory settings on this page.",
    "items": [
      {
        "title": "Restore",
        "content": "Click Restore to restore the device."
      }
    ]
  },
  "backupJson": {
    "title": "Backup & Import",
    "desc": "You can backup or import configuration on this page.",
    "items": [
      {
        "title": "Backup Setup",
        "content": "Click Backup to export your current configuration in a file. It is recommended to do a backup before upgrade."
      },
      {
        "title": "Import Setup",
        "content": "Click Import to import a configuration file to restore your configuration."
      }
    ]
  },
  "reloadJson": {
    "title": "Reboot",
    "desc": "You can reboot the system on this page.",
    "items": [
      {
        "title": "Reboot",
        "content": "Click Reboot to reboot the system."
      }
    ]
  },
  "packageJson": {
    "title": "Packet Capture",
    "desc": "You can capture packet to generate a diagnosis file on this page.",
    "items": [
      {
        "title": "Interface",
        "content": "Select an interface."
      },
      {
        "title": "Protocol",
        "content": "Select a protocol."
      },
      {
        "title": "IP Address",
        "content": "Set a target IP address."
      },
      {
        "title": "File Size Limit",
        "content": "Limit the file size. When the file size reaches the limit, packet capture will stop and a download link will be generated."
      },
      {
        "title": "Packet Count Limit",
        "content": "Limit the packet count. When the packet count reaches the limit, packet capture will stop and a download link will be generated."
      },
      {
        "title": "Start",
        "content": "Start packet capture."
      },
      {
        "title": "Stop",
        "content": "Stop packet capture, and a download link will be generated."
      }
    ]
  },
  "wanJson": {
    "title": "WAN Settings",
    "desc": "You can view and manage WAN settings on this page.",
    "items": [
      {
        "title": "IP Assignment",
        "content": "There are three types:",
        "frags": [
          "PPPoE: Access the Internet using a broadband account provided by ISP.",
          "DHCP: Access the Internet using a dynamic IP address provided by ISP.",
          "Static IP Address: Access the Internet using a static IP address provided by ISP."
        ]
      },
      {
        "title": "IP Address/Submask/Gateway/DNS Server",
        "content": "The settings are required for static IP address."
      },
      {
        "title": "Broadband Username/Password",
        "content": "The settings are required for PPPoE."
      },
      {
        "title": "MTU",
        "content": "Set a max MTU value."
      },
      {
        "title": "MAC",
        "content": "Set a MAC address."
      },
      {
        "title": "Multi-Line",
        "content": "Some devices may not support this feature. After you select multi-line, more than one WAN settings page will be displayed and you can also enable ISP routing and load balancing."
      }
    ]
  },
  "wanMswJson": {
    "title": "MGMT IP",
    "desc": "You can manage management IP addresses on this page.",
    "items": [
      {
        "title": "IP Assignment",
        "content": " There are two types:",
        "frags": [
          "DHCP: Access the Internet using a dynamic IP address.",
          "Static IP Address: Access the Internet using a static IP address."
        ]
      },
      {
        "title": "IP Address/Submask/Gateway/DNS Server",
        "content": "The settings are required for static IP address."
      }
    ]
  },
  "vlanJson": {
    "title": "LAN Settings",
    "desc": "You can view and manage LAN settings.",
    "items": [
      {
        "title": "IP Address",
        "content": "Set a LAN IP address. It is the default gateway address of the devices in this LAN."
      },
      {
        "title": "Submask",
        "content": "Set a subnet mask."
      },
      {
        "title": "VLAN ID",
        "content": "Set a VLAN ID."
      },
      {
        "title": "DHCP",
        "content": "Enable DHCP, and the devices will obtain dynamic IP addresses."
      },
      {
        "title": "Start",
        "content": "Set a start IP address of the DHCP address pool."
      },
      {
        "title": "Allocated Count",
        "content": "Set an allocated IP address count. The count is limited by the network size and the start IP address."
      },
      {
        "title": "Lease Time",
        "content": "Set a DHCP lease time. After the timer expires, the devices will obtain IP addresses again."
      }
    ]
  },
  "vlanPortJson": {
    "title": "Port VLAN",
    "items": [
      {
        "title": "UNTAG",
        "content": "If VLAN 10 is set to untag VLAN of port 2, VLAN 10 will be the native VLAN of port 2. The packets from VLAN 10 will be forwarded over port 2 without tag VLAN 10 and all untagged packets over port 2 will be taken as the packets from VLAN 10.",
        "frags": [
          "Each port can be configured with only one untag VLAN.",
          "The native VLAN of port 1 is the default VLAN and cannot be edited."
        ]
      },
      {
        "title": "TAG",
        "content": "If both VLAN 10 and VLAN 20 are set to tag VLAN of port 2, the packets from VLAN 10 and VLAN 20 will be forwarded over port 2 with the corresponding VLAN tag."
      },
      {
        "title": "Not Join",
        "content": "If both VLAN 10 and VLAN 20 are set to Not Join port 2, port 2 will not receive or transmit packets from VLAN 10 or VLAN 20."
      }
    ]
  },
  "arpJson": {
    "title": "ARP List",
    "desc": "The device learns IP-MAC mapping of all devices connected to its interfaces.",
    "items": [
      {
        "title": "IP Address",
        "content": "The IP address of the network device."
      },
      {
        "title": "MAC",
        "content": "The MAC address of the network device."
      },
      {
        "title": "Status",
        "content": "Display the MAC binding and filtering status. You can edit the MAC binding and filtering status here.",
        "frags": [
          "Bind: Add the ARP entry to the IP-MAC binding list.",
          "Filter: Add the ARP entry to the MAC filtering list.",
          "Binded: The ARP entry is added to the IP-MAC binding list.",
          "Filtered: The ARP entry is added to the MAC filtering list."
        ]
      },
      {
        "title": "Batch Bind",
        "content": "Select more than one ARP entry and add them to the IP-MAC binding list with a click."
      },
      {
        "title": "Batch Filter",
        "content": "Select more than one ARP entry and add them to the MAC filtering list with a click."
      }
    ]
  },
  "arpJsonLite": {
    "title": "ARP List",
    "desc": "The device learns IP-MAC mapping of all devices connected to its interfaces.",
    "items": [
      {
        "title": "IP Address",
        "content": "The IP address of the network device."
      },
      {
        "title": "MAC",
        "content": "The MAC address of the network device."
      },
      {
        "title": "Status",
        "content": "Display the MAC binding status. You can edit the MAC binding status here.",
        "frags": [
          "Bind: Add the ARP entry to the IP-MAC binding list.",
          "Binded: The ARP entry is added to the IP-MAC binding list."
        ]
      },
      {
        "title": "Batch Bind",
        "content": "Select more than one ARP entry and add them to the IP-MAC binding list with a click."
      }
    ]
  },
  "arpbindJson": {
    "title": "IP-MAC Binding",
    "items": [
      {
        "title": "MAC",
        "content": "Set a MAC address. Example: 00:11:22:33:44:55:66."
      },
      {
        "title": "IP Address",
        "content": "Set an IP address."
      },
      {
        "title": "Delete",
        "content": "Delete an IP-MAC binding rule."
      },
      {
        "title": "Delete Selected",
        "content": "Select more than one IP-MAC binding rule and delete them with one click."
      }
    ]
  },
  "dhcpClientJson": {
    "title": "Client List",
    "desc": "You can view the dynamic IP addresses allocated by the DHCP server to the clients and convert dynamic IP addresses to static IP addresses on this page.",
    "items": [
      {
        "title": "Hostname",
        "content": "The client hostname."
      },
      {
        "title": "MAC",
        "content": "The client MAC address."
      },
      {
        "title": "IP Address",
        "content": "The dynamic IP address allocated by the DHCP server to the client."
      },
      {
        "title": "Remaining Lease Time",
        "content": "The remaining DHCP lease time. After the timer expires, the client will obtain an IP address again."
      },
      {
        "title": "Refresh",
        "content": "Click Refresh to refresh the DHCP client list."
      },
      {
        "title": "Convert to Static IP",
        "content": "Click Convert to Static IP to convert a dynamic IP address to a static IP address."
      }
    ]
  },
  "staticJson": {
    "title": "Static IP Address",
    "desc": "You can view and manage static IP addresses on this page.",
    "items": [
      {
        "title": "IP Address",
        "content": "Set an IP address."
      },
      {
        "title": "MAC",
        "content": "Set a MAC address."
      }
    ]
  },
  "localUpdateJson": {
    "title": "Upgrade",
    "desc": "You can upgrade the software version on this page. It is recommended to back up the setup before upgrade.",
    "items": [
      {
        "title": "Current Version",
        "content": "The current software and hardware version number."
      },
      {
        "title": "Keep Setup",
        "content": "If the target version is much later than the current version, it is recommended not to keep the setup."
      },
      {
        "title": "BIN File Path",
        "content": "Select a BIN file with the .gz extension."
      }
    ]
  },
  "passwordJson": {
    "title": "Password",
    "desc": "You can change the device password on this page.",
    "items": [
      {
        "title": "Old Password",
        "content": "Enter the old password."
      },
      {
        "title": "New Password/Confirm Password",
        "content": "Set a new password at least 6 characters long."
      }
    ]
  },
  "sessionJson": {
    "title": "Session Timeout",
    "desc": "You can set a session timeout value on this page.",
    "items": [
      {
        "title": "Session Timeout",
        "content": "Set a session timeout value."
      }
    ]
  },
  "natJson": {
    "title": "Port Mapping",
    "desc": "You can view and manage port mapping settings on this page.",
    "items": [
      {
        "title": "Rule Name",
        "content": "Set a rule name."
      },
      {
        "title": "Protocol",
        "content": "Select a protocol. ALL indicate all protocols."
      },
      {
        "title": "External IP Address",
        "content": "Set an external IP address. An external IP address is configured with only one external port."
      },
      {
        "title": "External Port",
        "content": "Set an external port. An external port is configured for only one IP address."
      },
      {
        "title": "Internal IP Address",
        "content": "Set an internal IP address."
      },
      {
        "title": "Internal Port",
        "content": "Set an internal port."
      }
    ]
  },
  "networkCheckJson": {
    "title": "Network Check",
    "desc": "You can check your network and fix the problem on this page.",
    "items": [
      {
        "title": "Start",
        "content": "Start network check."
      },
      {
        "title": "WAN",
        "content": "Check whether the WAN port is connected with a cable and configured with an IP address."
      },
      {
        "title": "Routing",
        "content": "Check whether there is a route configured and whether the route is reachable."
      },
      {
        "title": "Next Hop Connectivity",
        "content": "Check whether the next hop is reachable."
      },
      {
        "title": "DNS Server",
        "content": "Check whether there is a DNS server configured and whether the DNS server is reachable."
      },
      {
        "title": "MACC",
        "content": "Check whether the device is connected to the MACC server. "
      },
      {
        "title": "Network Status",
        "content": "Check the number of IP sessions and available dynamic IP addresses."
      }
    ]
  },
  "networkTool": {
    "title": "Network Tools",
    "desc": "You can check the network status using some tools on this page.",
    "items": [
      {
        "title": "Ping",
        "content": "Test whether a node is reachable."
      },
      {
        "title": "Traceroute",
        "content": "Count the number of hops or communication links from one point to another and the amount of time it takes for each hop."
      },
      {
        "title": "DNS Lookup",
        "content": "Resolve a domain to an IP address."
      }
    ]
  },
  "smartJson": {
    "title": "Smart Flow Control",
    "desc": "You can adjust the bandwidth allocated to each user according to the user count on this page.",
    "items": [
      {
        "title": "Smart Flow Control",
        "content": "Enable smart flow control, and you can customize flow control policies."
      },
      {
        "title": "Bandwidth",
        "content": "Set the bandwidth allocated by ISP.",
        "frags": [
          "Up: Uplink bandwidth.",
          "Down: Downlink bandwidth."
        ]
      }
    ]
  },
  "strategyJson": {
    "title": "Custom Policy",
    "desc": "You can allocate bandwidth to the specified IP address or range on this page.",
    "items": [
      {
        "title": "Policy Name",
        "content": "Set a policy name."
      },
      {
        "title": "IP/IP Range",
        "content": "Set an IP address or IP address range."
      },
      {
        "title": "Bandwidth Type",
        "content": "Shared indicates that all IP addresses share the total bandwidth. Independent indicates that the rate limit is set per IP address."
      },
      {
        "title": "Uplink Rate",
        "frags": [
          "CIR: CIR indicates the committed information rate.",
          "PIR: PIR indicates the peak information rate."
        ]
      },
      {
        "title": "Downlink Rate",
        "frags": [
          "CIR: CIR indicates the committed information rate.",
          "PIR: PIR indicates the peak information rate."
        ]
      },
      {
        "title": "Interface",
        "content": "Select a WAN port which the policy is applied to.",
        "frags": [
          "All WAN Ports: The policy is applied to all WAN ports."
        ]
      },
      {
        "title": "Status",
        "content": "Enable or disable a policy."
      },
      {
        "title": "Active",
        "content": "Whether the policy is active or not."
      },
      {
        "title": "Match Order",
        "content": " The packet flow will be matched with the policy from up to down until there is a successful match. You can move a policy up or down."
      }
    ]
  },
  "flowAppJson": {
    "title": "App Flow Control",
    "desc": "You can allocate bandwidth to the specified application on this page.",
    "items": [
      {
        "title": "",
        "content": "Set a policy name."
      },
      {
        "title": "App Name",
        "content": "Select a managed application."
      },
      {
        "title": "Uplink Rate",
        "frags": [
          "CIR: CIR indicates the committed information rate.",
          "PIR: PIR indicates the peak information rate."
        ]
      },
      {
        "title": "Downlink Rate",
        "frags": [
          "CIR: CIR indicates the committed information rate.",
          "PIR: PIR indicates the peak information rate."
        ]
      },
      {
        "title": "Status",
        "content": "Enable or disable a policy."
      },
      {
        "title": "Match Order",
        "content": "The packet flow will be matched with the policy from up to down until there is a successful match. You can move a policy up or down."
      }
    ]
  },
  "deviceListJson": {
    "title": "Device List",
    "desc": "You can view all devices of the current network on this page.",
    "items": [
      {
        "title": "Hostname",
        "content": "You can edit the hostname."
      },
      {
        "title": "IP Address",
        "content": "Click the IP address, and you will be redirected to the device management page."
      },
      {
        "title": "Status",
        "content": "",
        "frags": [
          "Online: The device has joined the network.",
          "Offline: The device has not been powered on or WAN settings error.",
          "Not Online Yet: The device added manually has not joined the network yet."
        ]
      },
      {
        "title": "Advanced Search",
        "content": "Search for devices by SN, model, version, MAC address and status and return the result in the list."
      },
      {
        "title": "List Filter",
        "content": "Filter the list column so only certain columns will appear."
      }
    ]
  },
  "managerJson": {
    "title": "Network Management",
    "desc": "You can reboot and restore all devices on this page.",
    "items": [
      {
        "title": "Action",
        "content": "Select an action.",
        "frags": [
          "Reboot: Reboot all devices or a specified device.",
          "Restore: Restore all devices to factory settings. You can also select whether to unbind the account."
        ]
      },
      {
        "title": "Select",
        "content": "Specify devices or select all devices.",
        "frags": [
          "Specified Devices: Select devices from Available Devices and click Add to add them to Selected Devices.",
          "All Devices: Select all devices."
        ]
      },
      {
        "title": "Option",
        "content": "Whether to unbind the account."
      }
    ]
  },
  "neighborJson": {
    "title": "Network List",
    "desc": "Easy Network devices are capable of Plug and Play.",
    "items": [
      {
        "title": "Description",
        "frags": [
          "In a layer-2 network, all Easy Network devices will be interconnected to set up a network (My Network) automatically. You can manage all devices in this network uniformly.",
          "The new devices added to My Network will join automatically and inherit My Network settings.",
          "When the configured devices are added to My network:",
          "(1) The configured devices will also join My Network automatically and inherit My Network settings.",
          "(2) In some cases, some configured devices fail to join My Network. Therefore, there is more than one network generated.",
          "When there is more than one network:",
          "(1) The new devices will fail to join a network.",
          "(2) You can add the new devices to My Network and they will inherit My Network settings."
        ]
      },
      {
        "title": "My Network",
        "content": "The network name and its member devices will be displayed."
      },
      {
        "title": "Expand/Collapse",
        "content": "Expand or collapse the device list."
      },
      {
        "title": "Add to My Network",
        "frags": [
          "The devices of the other networks can be added to My Network.",
          "The added devices will inherit My Network settings.",
          "If you change My Network settings, the change will be synchronized to the added devices."
        ]
      },
      {
        "title": "New Device List",
        "content": "When there is more than one network, some new devices may fail to join My Network automatically. You can add these devices to My Network manually.",
        "frags": [
          "In a layer-2 network, the new devices will be interconnected to set up My Network automatically.",
          "The configured devices will also join My Network automatically and inherit My Network settings.",
          "In some cases, some configured devices fail to join My Network. Therefore, there is more than one network generated.",
          "When there is more than one network, some devices may fail to join My Network automatically. These devices will be displayed in Other Network. You can add them to My Network manually."
        ]
      },
      {
        "title": "Other Network",
        "content": "The other networks will be displayed. The devices of the other networks can be added to My Network."
      }
    ]
  },
  "dhcpOptionJson": {
    "title": 'DCHP Option',
    "items": [
      {
        "title": 'DNS Server',
        "content": '(Optional) Set a DNS server address provided by the ISP.'
      },
      {
        "title": 'Option 43',
        "content": '(Optional) There are three formats available:',
        "frags": [
          'IP addresses, each separated by a space.',
          'A hexadecimal string. Example: 01:C0:A8:01:01. 16.',
          'Any string.'
        ]
      },
      {
        "title": 'Option 138',
        "content": '(Optional) Enter the IP address of the wireless controller.'
      }
    ]
  },
  "routeStaticJson": {
    "title": "Static Route List",
    "desc": "You can view and manage static routes on this page.",
    "items": [
      {
        "title": "Dest IP Address/Submask",
        "content": "Set a destination IP address and a subnet mask."
      },
      {
        "title": "Outbound Interface",
        "content": "Select an interface which packets are routed over."
      },
      {
        "title": "Next Hop",
        "content": "Set a next hop. If the outbound interface is PPPoE, the next hop is not required."
      },
      {
        "title": "Reachable",
        "content": "Whether the next hop is reachable."
      }
    ]
  },
  "routePolicyJson": {
    "title": "PBR List",
    "desc": "PBR is more flexible than destination-based routing.",
    "items": [
      {
        "title": "Rule Name",
        "content": "Set a rule name up to 28 characters long."
      },
      {
        "title": "Protocol Type",
        "content": "Select or customize a protocol."
      },
      {
        "title": "Protocol Number",
        "content": "Set a protocol number for the custom protocol."
      },
      {
        "title": "Src Port Range",
        "content": "Set a source port range."
      },
      {
        "title": "Dest Port Range",
        "content": "Set a destination port range."
      },
      {
        "title": "Src IP/IP Range",
        "content": "Set a source IP address or range. Default: all IP addresses."
      },
      {
        "title": "Dest IP/IP Range",
        "content": "Set a destination IP address or range. Default: all IP addresses."
      },
      {
        "title": "Outbound Interface",
        "content": "Select an interface which PPTP packets are routed over."
      },
      {
        "title": "Status",
        "content": "Enable or disable a policy."
      },
      {
        "title": "Match Order",
        "content": "The packet flow will be matched with the rule from up to down until there is a successful match. You can move a rule up or down."
      }
    ]
  },
  "macFilterJson": {
    "title": "MAC Filtering",
    "desc": "You can filter MAC addresses on this page.",
    "items": [
      {
        "title": "MAC Filtering",
        "content": "Enable MAC address filtering."
      },
      {
        "title": "Filtering Type",
        "content": "There are two types available:",
        "frags": [
          "Whitelist: Only the following hosts are allowed to access the Internet.",
          "Blacklist: The following hosts are not allowed to access the Internet."
        ]
      },
      {
        "title": "MAC",
        "content": "Set a MAC address."
      },
      {
        "title": "Remark",
        "content": "Set a remark up to 32 characters long."
      }
    ]
  },
  "dnsProxyJson": {
    "title": "DNS Proxy",
    "desc": "You can view and manage DNS proxy settings on this page.",
    "items": [
      {
        "title": "DNS Proxy",
        "content": "Enable DNS proxy."
      },
      {
        "title": "DNS Server",
        "content": "Set a DNS server address. If the DNS server address is incorrect, domain resolution will fail."
      }
    ]
  },
  "ipConnJson": {
    "title": "IP Session Limit",
    "desc": "You can set the maximum number of IP sessions on this page.",
    "items": [
      {
        "title": "Rule Name",
        "content": "Set a rule name up to 28 characters."
      },
      {
        "title": "IP Range",
        "content": "Set an IP address range."
      },
      {
        "title": "Session Count Limit",
        "content": "Set the maximum number of IP sessions."
      },
      {
        "title": "Status",
        "content": "Enable or disable a policy."
      }
    ]
  },
  "natdmzJson": {
    "title": "NAT-DMZ",
    "desc": "You can view and manage NAT-DMZ settings on this page.",
    "items": [
      {
        "title": "Rule Name",
        "content": "Set a rule name up to 28 characters."
      },
      {
        "title": "Outbound Interface",
        "content": "Select an interface which packets are routed over. An outbound interface can be configured with only one rule."
      },
      {
        "title": "Dest IP Address",
        "content": "Set a destination IP address."
      },
      {
        "title": "Status",
        "content": "Enable or disable a rule."
      }
    ]
  },
  "userOnlineJson": {
    "title": "Online Clients",
    "desc": "There is a delay of 3 minutes. After a client is offline, he will stay in the list for about 3 more minutes.",
    "items": [
      {
        "title": "Access Type",
        "content": "There are three types available: 1. Wired. 2. Wireless. 3. Unknown."
      },
      {
        "title": "Wireless Info",
        "content": "Only for wireless clients, including channel, RSCP, uptime and negotiation speed."
      },
      {
        "title": "Access Control",
        "content": "Control the Internet access behavior and the time span."
      }
    ]
  },
  "netNeighborJson": {
    "items": [
      {
        "title": "EAP is missing – EAP LED is on.",
        "frags": [
          "Solution 1: Press the Reset button to restore the AP to the factory settings.",
          "Solution 2: Power off the home router, if any.",
          "Solution 3: Check the topology to see whether the AP is in the same network. If not, change the AP settings.",
          "Solution 4: Remove the other routers, if any.",
          "Solution 5: Change the terminal IP address to DHCP.",
          "Solution 6: Enable Loop Guard on the switch."
        ]
      },
      {
        "title": "EAP is missing – EAP LED is off or blinks.",
        "frags": [
          "Solution 1: Use a cable tester to check whether the cable works properly or replace the cable.",
          "Solution 2: Turn off the Isolation button on the switch.",
          "Solution 3: Check for PoE errors. Reduce the number of PSE or replace the DC adaptor.",
          "Solution 4: Extend the gateway address pool and search for the SSID again.",
          "Solution 5: Choose Wireless > AP List to upgrade the software version.",
          "Solution 6: If the above solutions do not work, please replace the device."
        ]
      },
      {
        "title": "ES2 series switch is missing",
        "content": "",
        "frags": [
          "Solution 1: Use a cable tester to check whether the cable works properly.",
          "Solution 2: Configure network settings and upgrade all devices to the latest version."
        ]
      }
    ]
  },
  "vpnPoolJson": {
    "title": "IP Address Pool",
    "desc": "You can manage IP address pool settings on this page.",
    "items": [
      {
        "title": "Address Pool Name",
        "content": "Set an IP address pool name."
      },
      {
        "title": "Address Range",
        "content": "Set an IP address range, example: 192.168.1.2-192.168.1.100. The end IP address must be greater than the start IP address. "
      }
    ]
  },
  "vpnUserJson": {
    "title": "VPN Clients",
    "desc": "You can view L2TP/PPTP clients on this page.",
    "items": [
      {
        "title": "Username/Password",
        "content": "The username and password used for L2TP/PPTP authentication."
      },
      {
        "title": "Service Type",
        "content": "The VPN service type."
      },
      {
        "title": "Local Address",
        "content": "The virtual IP address of the local end."
      },
      {
        "title": "Address Pool",
        "content": "The IP addresses are allocated from the address pool to clients."
      },
      {
        "title": "DNS Server",
        "content": "The DNS server address allocated by the L2TP/PPTP server."
      },
      {
        "title": "Networking Mode",
        "frags": [
          "PC-to-site: PC-to-site connection is established between a PC and an endpoint.",
          "Site-to-Site: Site-to-site VPN typically creates a direct, unshared and secure connection between two endpoints."
        ]
      },
      {
        "title": "Session Count Limit",
        "content": "The maximum number of clients for each account. If the user type is set to Auto, the session count limit is the max value allowed."
      },
      {
        "title": "Peer Subnet",
        "content": "The IP address range of the peer network."
      }
    ]
  },
  "vpnSecurityJson": {
    "title": "IPSec Security Settings",
    "desc": "You can manage IPsec policy settings on this page, including mandatory and optional setting.",
    "items": [
      {
        "title": "Policy Type",
        "content": "Select whether the policy is a server-based policy or a client-based policy."
      },
      {
        "title": "Policy Name",
        "content": "Set a policy name up to 28 characters long."
      },
      {
        "title": "Peer Gateway",
        "content": "Set a peer gateway address. It can be an IP address or a domain. 0.0.0.0 indicates any IP address."
      },
      {
        "title": "Interface",
        "content": "Select a WAN port from the dropdown list."
      },
      {
        "title": "Local Subnet",
        "content": "Set an IP address range of the local subnet."
      },
      {
        "title": "Peer Subnet",
        "content": "Set an IP address range of the peer subnet."
      },
      {
        "title": "Pre-shared Key",
        "content": "Set a pre-shared key for authentication."
      }
    ]
  },
  "vpnUnionJson": {
    "title": "IPSec Connection List",
    "desc": "You can view IPSec connections on this page.",
    "items": [
      {
        "title": "Name",
        "content": "The name of an IPSec connection name is the same as the security policy name generally."
      },
      {
        "title": "SPI",
        "content": "Each IPSec connection has a different SPI (Security Parameter Index)."
      },
      {
        "title": "Direction",
        "content": "In/Out"
      },
      {
        "title": "Tunnel Endpoint",
        "content": "The gateway addresses at both ends of an IPSec connection."
      },
      {
        "title": "Flow",
        "content": "The networks at both ends of an IPSec connection."
      },
      {
        "title": "Security Protocol",
        "content": "The security protocol used by an IPSec connection."
      },
      {
        "title": "AH Authentication Algorithm ",
        "content": "The AH authentication algorithm used by an IPSec connection."
      },
      {
        "title": "ESP Authentication Algorithm ",
        "content": "The ESP authentication algorithm used by an IPSec connection."
      },
      {
        "title": "ESP Encryption Algorithm",
        "content": "The ESP encryption algorithm used by an IPSec connection."
      }
    ]
  },
  "vpnL2tpSerJson": {
    "title": "L2TP Server",
    "items": [
      {
        "title": "L2TP Hello Interval",
        "content": "The interval between hello messages on L2TP over IPSec connections."
      },
      {
        "title": "PPP Hello Interval",
        "content": "The interval between hello messages on PPP over IPSec connections."
      },
      {
        "title": "Server Port",
        "content": "L2TP server port."
      },
      {
        "title": "IPSec Encryption ",
        "content": "Whether to encrypt the tunnel or not."
      },
      {
        "title": "Pre-shared Key",
        "content": "A pre-shared key is required for IPSec encryption."
      }
    ]
  },
  "vpnL2tpCliJson": {
    "title": "L2TP Client",
    "items": [
      {
        "title": "Tunnel Name",
        "content": "L2TP tunnel name."
      },
      {
        "title": "Username/Password",
        "content": "The username and password used for L2TP authentication."
      },
      {
        "title": "Server Address",
        "content": "L2TP server address. It can be an IP address or a domain."
      },
      {
        "title": "IPSec Encryption",
        "content": "Whether to encrypt the tunnel or not."
      },
      {
        "title": "Pre-shared Key",
        "content": "A pre-shared key is required for IPSec encryption."
      },
      {
        "title": "Peer Subnet",
        "content": "The IP address range of the peer network."
      },
      {
        "title": "Work Mode",
        "frags": [
          "NAT: NAT the incoming L2TP packets (Replace the source IP address with the local virtual IP address).",
          "Router: Only route the incoming L2TP packets."
        ]
      },
      {
        "title": "Status",
        "content": "The slider in grey indicates disabled and blue indicates enabled."
      }
    ]
  },
  "vpnL2tpTunnelJson": {
    "title": "Tunnel Info List",
    "desc": "You can view L2TP tunnel settings on this page.",
    "items": [
      {
        "title": "Username",
        "content": "The username used for L2TP authentication."
      },
      {
        "title": "Server/Client",
        "content": "The local end works as a server or a client."
      },
      {
        "title": "Tunnel Name",
        "content": "L2TP tunnel name."
      },
      {
        "title": "Virtual Local IP",
        "content": "The virtual IP address of the local end."
      },
      {
        "title": "Access Server IP",
        "content": "The actual IP address of the peer end."
      },
      {
        "title": "Peer Virtual IP",
        "content": "The virtual IP address of the peer end."
      },
      {
        "title": "DNS Server",
        "content": "The DNS server address allocated by the server."
      }
    ]
  },
  "vpnPptpSerJson": {
    "title": "PPTP Server",
    "items": [
      {
        "title": "PPTP Hello Interval",
        "content": "The interval between hello messages on PPTP over IPSec connections."
      },
      {
        "title": "PPP Hello Interval",
        "content": "The interval between hello messages on PPP over IPSec connections."
      },
      {
        "title": "Server Port",
        "content": "PPTP server port."
      },
      {
        "title": "MPPE Encryption",
        "content": "Whether to encrypt the tunnel or not."
      }
    ]
  },
  "vpnPptpCliJson": {
    "title": "PPTP Client",
    "items": [
      {
        "title": "PPTP Hello Interval",
        "content": "The interval between hello messages on PPTP over IPSec connections."
      },
      {
        "title": "PPP Hello Interval",
        "content": "The interval between hello messages on PPP over IPSec connections."
      },
      {
        "title": "Tunnel Name",
        "content": "PPTP tunnel name."
      },
      {
        "title": "Username/Password",
        "content": "The username and password used for PPTP authentication."
      },
      {
        "title": "Outbound Interface",
        "content": "The interface which PPTP packets are routed over."
      },
      {
        "title": "Server Address",
        "content": "PPTP server address. It can be an IP address or a domain."
      },
      {
        "title": "MPPE Encryption",
        "content": "Whether to encrypt the tunnel or not."
      },
      {
        "title": "Peer Subnet",
        "content": "The IP address range of the peer network."
      },
      {
        "title": "Uplink/Downlink Rate",
        "content": "The device performs load balancing according to uplink and downlink rate."
      },
      {
        "title": "Work Mode",
        "frags": [
          "NAT: NAT the incoming PPTP packets (Replace the source IP address with the local virtual IP address).",
          "Bridge: Only route the incoming PPTP packets."
        ]
      },
      {
        "title": "Online Test",
        "content": "Test whether the interface is up via Ping and DNS lookup.",
        "frags": [
          "Auto: Automatically set a destination IP address for Ping (gateway address) or DNS lookup (DNS server address)",
          "Skip: Skip the test and the interface is always online.",
          "Manual: Manually set a destination IP address for Ping or DNS lookup."
        ]
      }
    ]
  },
  "vpnPptpTunnelJson": {
    "title": "Tunnel Info List",
    "desc": "You can view PPPTP tunnel settings on this page.",
    "items": [
      {
        "title": "Username",
        "content": "The username used for PPTP authentication."
      },
      {
        "title": "Server/Client",
        "content": "The local end works as a server or a client."
      },
      {
        "title": "Tunnel Name",
        "content": "PPTP tunnel name."
      },
      {
        "title": "Virtual Local IP",
        "content": "The virtual IP address of the local end."
      },
      {
        "title": "Access Server IP",
        "content": "The actual IP address of the peer end."
      },
      {
        "title": "Peer Virtual IP",
        "content": "The virtual IP address of the peer end."
      },
      {
        "title": "DNS Server",
        "content": "The DNS server address allocated by the server."
      }
    ]
  },
  "apListJson": {
    "title": "AP Settings",
    "desc": "You can view AP devices on this page.",
    "items": [
      {
        "title": "Hostname",
        "content": "You can edit the hostname."
      },
      {
        "title": "IP Address",
        "content": "Click the IP address, and you will be redirected to the device management page."
      },
      {
        "title": "Status",
        "content": "",
        "frags": [
          "Online: The device has joined the network.",
          "Offline: The device has not been powered on or WAN settings error.",
          "Not Online Yet: The device added manually has not joined the network yet."
        ]
      },
      {
        "title": "Software Version",
        "content": "The device will check whether there is a later version available.",
        "frags": [
          "If a later version is available, a little New icon will be displayed on the upper right. Hover the mouse cursor over it, and the later version number will be displayed.",
          "If there is no later version, the current version number will be displayed.",
          "The target version is released on the cloud."
        ]
      },
      {
        "title": "Advanced Search",
        "content": "Search for devices by SN, model, version, MAC address and status and return the result in the list."
      },
      {
        "title": "List Filter",
        "content": "Filter the list column so only certain columns will appear."
      },
      {
        "title": "Upgrade Device",
        "content": "If there is a later version available, click Batch Action > Upgrade to upgrade devices.",
        "frags": [
          "Fetch the target version from the cloud.",
          "Please do not repeat the upgrade process. The device will join the network again after being upgraded."
        ]
      },
      {
        "title": "Group",
        "content": "A network may contain many devices. The devices can be divided into some groups. Each device belongs to only one group and each group is managed separately.",
        "frags": [
          "Default Group: Each network has only one default group.",
          "Group: The group that the AP belongs to.",
          "Expand/Collapse: Expand or collapse group management.",
          "Group Settings: Each group is managed separately. All devices of this group inherit the group settings.",
          "Example: Divide a network containing 10 APs into a staff group (5 APs) and a guest group (5 APs). Configure the staff group with a hidden SSID and enable authentication. Configure the guest group with a broadcast SSID and disable authentication."
        ]
      },
      {
        "title": "Action",
        "content": "Add Group/Change Group/Delete Group",
        "frags": [
          "Add Group: Create a group and set a group name.",
          "Change Group: Move a device from one group to another.",
          "Delete Group: After a group is deleted, the devices of this group are moved to the default group automatically."
        ]
      }
    ]
  },
  "wifiJson": {
    "title": "WiFi Settings",
    "desc": "You can manage basic WiFi settings on this page.",
    "items": [
      {
        "title": "SSID",
        "content": "Set a WiFi network name."
      },
      {
        "title": "SSID Encoding",
        "content": "If the SSID does not contain Chinese, this item will be hidden. If the SSID contains Chinese, this item will be displayed. You can select UTF-8 or GBK."
      },
      {
        "title": "Frequency",
        "content": "Select a frequency."
      },
      {
        "title": "Encryption",
        "content": "There are three types available:",
        "frags": [
          "Open: Clients will access WiFi without a password.",
          "WPA-PSK/WPA2-PSK: Radius server settings are required.",
          "WPA_WPA2-PSK(Recommended): No Radius server settings are required."
        ]
      },
      {
        "title": "Password",
        "content": "Set a WiFi password 8-16 characters long."
      },
      {
        "title": "Active Time",
        "content": "Select a time span when the WiFi network is disabled. You can click Other Time to select a configured time span or customize a time span."
      },
      {
        "title": "Forwarding Type",
        "content": "There are two types available:",
        "frags": [
          "Bridge: The terminal obtains an IP address from the DHCP server of the uplink device.",
          "NAT: The terminal obtains an IP address from the DHCP server of the local device."
        ]
      },
      {
        "title": "VLAN",
        "content": "If the forwarding type is set to bridge, you can add a VLAN."
      },
      {
        "title": "Client Isolation",
        "content": "Isolate clients associated with an AP to increase security. It is enabled for guest  WiFi by default and cannot be edited."
      }
    ]
  },
  "wifiHealthyJson": {
    "title": "Healthy Mode",
    "desc": "You can manage healthy mode settings on this page.",
    "items": [
      {
        "title": "Healthy Mode",
        "content": "Enable the healthy mode, and the device will work with a low power. Disable the healthy mode, and the device will work with a power configured on the Channel Power page."
      },
      {
        "title": "Active Time",
        "content": "Select a time span when the healthy mode is active. It is recommended to select a network idle time."
      }
    ]
  },
  "wifiRadioJson": {
    "title": "Advanced Settings",
    "desc": "You can manage WiFi advanced settings on this page.",
    "items": [
      {
        "title": "Client Count Limit",
        "content": "Set a maximum number of WiFi clients. The actual client count is limited by the AP capacity."
      },
      {
        "title": "Channel Width",
        "content": "Set a channel width. If there is little WiFi interference, it is recommended to set a great channel width to increase data transfer rate. If there is much WiFi interference, it is recommended to set a small channel width to ensure stability."
      }
    ]
  },
  "macBwlist": {
    "title": "Blacklist/Whitelist",
    "desc": "You can control clients' access to the Internet.",
    "items": [
      {
        "title": "Blacklist Mode",
        "content": "All clients except blacklisted clients are allowed to access WiFi. After client connection is switched over to the whitelist mode:",
        "frags": [
          "1. The blacklist is empty by default.",
          "2. You can add or delete a MAC address manually.",
          "3. You can also blacklist a client on the Clients page (add a client to the blacklist)."
        ]
      },
      {
        "title": "Whitelist Mode",
        "content": "Only the whitelisted clients are allowed to access WiFi. After client connection is switched over to the whitelist mode:",
        "frags": [
          "1. All online clients will be included into the whitelist by default.",
          "2. You can add or delete a MAC address manually.",
          "3. You can also blacklist a client on the Clients page (remove a client from the whitelist)."
        ]
      }
    ]
  },
  "pppoeGlobalJson": {
        "title": 'Global Settings',
        "desc": 'You can configure PPPoE server settings on this page.',
        "items": [
          {
            "title": 'PPPoE Server',
            "frags": [
              'Enable or disable the PPPoE server.'
            ]
          },
          {
            "title": 'Mandatory PPPoE Dialup',
            "frags": [
              'Enable or disable mandatory PPPoE dialup.',
              'After you enable this function, only dialup users and exceptional clients can access the Internet. If you want to configure exceptional IP addresses, please choose Exceptional IP Address.'
            ]
          },
          {
            "title": '拨号用户互访',
            "frags": [
              '您可以勾选此项，选择是否开启拨号用户互访功能。拨号用户互访功能允许拨号用户之间互相通信。',
            ]
          },
          {
            "title": 'Primary/Secondary DNS Server',
            "frags": [
              'Set a primary and a secondary DNS server. No DNS server is configured by default.',
            ]
          },
          {
            "title": 'Session Limit',
            "frags": [
              'Set a max number of sessions.',
            ]
          },
          {
            "title": 'Unanswered LCP Packet Limit',
            "frags": [
              'When the number of unanswered LCP packets exceeds the limit, the session will be disconnected automatically. Default: 10.',
            ]
          },
          {
            "title": 'Idle Timeout',
            "frags": [
              'Range: 0-10080. Default: 30. 0 indicates no timeout.',
            ]
          },
          {
            "title": 'Auth Mode',
            "frags": [
              'There are four authentication modes available.',
            ]
          }
        ]
      },
      "pppoeManageJson": {
        "title": 'Account Settings',
        "desc": 'You can view and manage account settings on this page.',
        "items": [
          {
            "title": 'Username',
            "frags": [
              'Set a username.'
            ]
          },
          {
            "title": 'Password',
            "frags": [
              'Set a password.',
            ]
          },
          {
            "title": 'Address Pool',
            "frags": [
              'The server allocates IP addresses from the address pool to clients.',
            ]
          },
          {
            "title": 'Expire Date',
            "frags": [
              'Set an expire date for the account. Max date: 2099-01-01.',
            ]
          },
          {
            "title": 'Remark',
            "frags": [
              'Set a remark up to 50 characters long.',
            ]
          },
          {
            "title": 'Status',
            "frags": [
              'Enable or disable a policy.',
            ]
          }
        ]
      },
      "pppoeExceptipJson": {
        "title": 'Exceptional IP Address',
        "desc": 'You can view and manage exceptional IP address settings on this page.',
        "items": [
          {
            "title": 'Start IP Address',
            "frags": [
              'Set a start IP address. The start IP address cannot be greater than the end IP address.'
            ]
          },
          {
            "title": 'End IP Address',
            "frags": [
              'Set an end IP address. The end IP address cannot be smaller than the start IP address.',
            ]
          },
          {
            "title": 'Remark',
            "frags": [
              'Set a remark.',
            ]
          },
          {
            "title": 'Status',
            "frags": [
              'Enable or disable a policy.',
            ]
          }
        ]
      },
      "pppoeUserinfoJson": {
        "title": 'Online Clients',
    "desc": 'You can view online clients on this page.',
        "items": [
          {
            "title": 'Username',
            "frags": [
              'The username of the client.'
            ]
          },
          {
            "title": 'Status',
            "frags": [
              'The status of the client. An account is allowed to log in elsewhere.',
            ]
          },
          {
            "title": 'IP Address',
            "frags": [
              'The IP address of the client.',
            ]
          },
          {
            "title": 'MAC',
            "frags": [
              'The MAC address of the client.',
            ]
          },
          {
            "title": 'Up on',
            "frags": [
              'The time when the client goes online.',
            ]
          },
          {
            "title": 'Remark',
            "frags": [
              'The remark of the client.',
            ]
          },
          {
            "title": 'Disconnect',
            "frags": [
              'Disconnect the session of the client.',
            ]
          }
        ]
      },
      "acNetJson": {
        "title": 'Network Security',
        "items": [
          {
            "title": 'Rate Limiting',
            "frags": [
              'Enable ARP rate limiting, broadcast rate limiting and multicast rate limiting.'
            ]
          },
          {
            "title": 'ARP Rate Limit',
            "frags": [
              'Set a max number of ARP packets received per second.'
            ]
          },
          {
            "title": 'Broadcast Rate Limit',
            "frags": [
              'Set a max number of broadcast packets received per second.'
            ]
          },
          {
            "title": 'Multicast Rate Limit',
            "frags": [
              'Set a max number of multicast packets received per second. It is recommended to set to 0 or a great value for a video scenario.'
            ]
          }
        ]
      },
      "attackJson": {
        "title": 'Firewall',
        "items": [
          {
            "title": 'New Session Limit',
            "frags": [
              'Limit the number of new sessions per second.'
            ]
          },
          {
            "title": 'NFPP',
            "frags": [
              'Enable NFPP to reduce CPU load caused by attacks.'
            ]
          },
          {
            "title": 'Admin IP Address',
            "frags": [
              'The administrator IP address will not be rate-limited.'
            ]
          }
        ]
      },
      "dhcpSecurityJson": {
        "title": 'DHCP Security',
        "items": [
          {
            "title": 'IP Check',
            "frags": [
              'Enable IP check to filter invalid IP packets.'
            ]
          },
          {
            "title": 'ARP Check',
            "frags": [
              'Enable ARP check to filter invalid ARP packets.'
            ]
          },
          {
            "title": 'Escape Time',
            "frags": [
              'The device will start IP or ARP check after running a period of time.'
            ]
          },
          {
            "title": 'Trusted DHCP Server',
            "frags": [
              'Each VLAN can be configured with a trusted DHCP server.'
            ]
          },
          {
            "title": 'Security VLAN',
            "frags": [
              'The device will check DHCP packets, ARP packets and IP packets received by the WiFi interface in the VLAN.'
            ]
          },
          {
            "title": 'Static DHCP Client',
            "frags": [
              'The packets from static DHCP clients are all valid packets.'
            ]
          }
        ]
      }
}
