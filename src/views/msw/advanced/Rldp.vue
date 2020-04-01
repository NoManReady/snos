<template>
  <div class="advanced-rldp">
    <common-tabs :tabs="tabs"></common-tabs>
  </div>
</template>
<script>
import Tabs from '@/common/Tabs'
import * as rldp from './rldp/index'
import bus from '@/utils/bus'
export default {
  name: 'advanced-rldp',
  components: {
    [Tabs.name]: Tabs
  },
  data() {
    return {
      tabs: [
        {
          label: I18N.t('msw.rldp.rldp_cfg'),
          value: '0',
          comp: rldp.Base
        }
      ]
    }
  },
  created() {
    bus.$on('rldp-status-change', ({ value }) => {
      if (value) {
        this.tabs.splice(
          1,
          2,
          {
            label: I18N.t('msw.rldp.apply_rldp'),
            value: '2',
            comp: rldp.Port
          },
          {
            label: I18N.t('msw.rldp.rldp_info'),
            value: '3',
            comp: rldp.Info
          }
        )
      } else {
        this.tabs.splice(1, 2)
      }
    })
  }
}
</script>
