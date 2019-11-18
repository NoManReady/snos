<script>
import Rule from './Rule'
import TimeLimit from './TimeLimit'
let _compMap = {
  '0': Rule,
  '1': TimeLimit
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
