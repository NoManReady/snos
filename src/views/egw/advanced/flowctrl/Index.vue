<script>
import SmartTab from './SmartTab'
import StrategyTab from './StrategyTab'
import FlowAppTab from './FlowAppTab'
let _compMap = {
  '0': SmartTab,
  '1': StrategyTab,
  '2': FlowAppTab
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
