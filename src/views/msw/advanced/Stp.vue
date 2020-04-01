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
          label: I18N.t('msw.stp.stp_cfg'),
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
          label: I18N.t('msw.stp.apply_stp'),
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
