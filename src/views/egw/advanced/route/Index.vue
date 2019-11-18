<script>
import RoutePolicy from './RoutePolicy'
import RouteStatic from './RouteStatic'
let _compMap = {
  '0': RoutePolicy,
  '1': RouteStatic
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
