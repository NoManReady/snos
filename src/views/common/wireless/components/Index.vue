<script>
import MasterTab from './MasterTab'
import VisitorTab from './VisitorTab'
import HealthyTab from './HealthyTab'
import WifiTab from './WifiTab'
import SsidRadioTab from './SsidRadioTab'
import MacBwList from './MacBwList'
let _compMap = {
  '0': MasterTab,
  '1': VisitorTab,
  '2': WifiTab,
  '3': HealthyTab,
  '5': MacBwList,
  '4': SsidRadioTab
}
export default {
  name: 'wifi-tab',
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
