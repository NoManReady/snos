<script>
import VlanTab from './VlanTab'
import ClientTab from './ClientTab'
import StaticTab from './StaticTab'
import DhcpOptionTab from './DhcpOptionTab'
import DnsProxyTab from './DnsProxyTab'
import VlanPortTab from './VlanPortTab'
let _compMap = {
  '0': VlanTab,
  '1': ClientTab,
  '2': StaticTab,
  '3': DhcpOptionTab,
  '4': DnsProxyTab,
  '5': VlanPortTab
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
