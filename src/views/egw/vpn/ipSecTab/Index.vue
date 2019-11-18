<script>
import Strategy from './Strategy'
import Union from './Union'
let _compMap = {
  '0': Strategy,
  '1': Union
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
