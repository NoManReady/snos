<script>
import L3interface from './L3interface'
import RouteStatic from './RouteStatic'
import Arp from './Arp'
let _compMap = {
  '0': L3interface,
  '1': RouteStatic,
  '2': Arp
}
export default {
  functional: true,
  render(h, context) {
    let _type = context.props.type
    return h(_compMap[_type], context.data, context.children)
  }
}
</script>
