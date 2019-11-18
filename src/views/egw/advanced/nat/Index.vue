<script>
import PortMapping from './PortMapping'
import Dmz from './Dmz'
let _compMap = {
  '0': PortMapping,
  '1': Dmz
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
