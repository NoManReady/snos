<script>
import Local from './Local'
import Online from './Online'
let _compMap = {
  '0': Online,
  '1': Local
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
