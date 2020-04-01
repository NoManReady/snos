<script>
import Password from './Password'
import SessionTime from './SessionTime'
let _compMap = {
  '0': Password,
  '1': SessionTime
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
