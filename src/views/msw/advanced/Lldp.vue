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
          label: I18N.t('msw.lldp.lldp_cfg'),
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
            label: I18N.t('msw.lldp.apply_lldp'),
            value: '2',
            comp: lldp.Port
          },
          {
            label: I18N.t('msw.lldp.lldp_info'),
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
