<template>
  <div class="vlan-base">
    <vlan-setting />
    <vlan-port />
  </div>
</template>
<script>
import Setting from './Setting'
import Port from './Port'
export default {
  name: 'vlan-base',
  components: {
    [Setting.name]: Setting,
    [Port.name]: Port
  }
}
</script>

