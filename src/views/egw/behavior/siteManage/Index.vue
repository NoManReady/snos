<script>
import Group from './Group'
import Visiter from './Visiter'
let _compMap = {
  '0': Visiter,
  '1': Group
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
