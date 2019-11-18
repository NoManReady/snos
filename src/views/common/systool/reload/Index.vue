<script>
import ReloadTab from './ReloadTab'
import TimeReloadTab from './TimeReloadTab'
let _compMap = {
  '0': ReloadTab,
  '1': TimeReloadTab
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
