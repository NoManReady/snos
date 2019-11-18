<template>
  <div class="advanced-stp">
    <common-tabs :tabs="tabs"></common-tabs>
  </div>
</template>
<script>
import Tabs from '@/common/Tabs'
import * as stp from './stp/index'
import bus from '@/utils/bus'
export default {
  name: 'advanced-stp',
  components: {
    [Tabs.name]: Tabs
  },
  data() {
    return {
      tabs: [
        {
          label: 'STP配置',
          value: '0',
          comp: stp.Base
        }
      ]
    }
  },
  created() {
    bus.$on('stp-status-change', ({ value }) => {
      if (value) {
        this.tabs.splice(1, 1, {
          label: '应用STP',
          value: '1',
          comp: stp.Port
        })
      } else {
        this.tabs.splice(1, 1)
      }
    })
  }
}
</script>
