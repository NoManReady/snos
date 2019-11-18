<template>
  <div class="advanced-lldp">
    <common-tabs :tabs="tabs"></common-tabs>
  </div>
</template>
<script>
import Tabs from '@/common/Tabs'
import * as lldp from './lldp/index'
import bus from '@/utils/bus'
export default {
  name: 'advanced-lldp',
  components: {
    [Tabs.name]: Tabs
  },
  data() {
    return {
      tabs: [
        {
          label: 'LLDP配置',
          value: '0',
          comp: lldp.Base
        }
      ]
    }
  },
  created() {
    bus.$on('lldp-status-change', ({ value }) => {
      if (value) {
        this.tabs.splice(
          1,
          2,
          {
            label: '应用LLDP',
            value: '2',
            comp: lldp.Port
          },
          {
            label: 'LLDP信息',
            value: '3',
            comp: lldp.Info
          }
        )
      } else {
        this.tabs.splice(1, 2)
      }
    })
  }
}
</script>
