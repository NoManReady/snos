<template>
  <div class="monitor-pdmanage">
    <common-tabs :tabs="tabs"></common-tabs>
  </div>
</template>
<script>
import Tabs from '@/common/Tabs'
import * as pdmanage from './pdmanage/index'
export default {
  name: 'monitor-pdmanage',
  components: {
    [Tabs.name]: Tabs
  },
  data() {
    return {
      tabs: Object.freeze([
        {
          label: I18N.t('msw.mac.mac_addr_list'),
          value: '0',
          comp: pdmanage.List
        },
        {
          label: I18N.t('msw.mac.static_mac_addr'),
          value: '1',
          comp: pdmanage.Static
        },
        {
          label: I18N.t('msw.mac.dynamic_mac_addr'),
          value: '2',
          comp: pdmanage.Dynamic
        },
        {
          label: I18N.t('msw.mac.filter_mac_addr'),
          value: '3',
          comp: pdmanage.Filter
        },
        {
          label: I18N.t('msw.mac.mac_cfg'),
          value: '4',
          comp: pdmanage.Base
        },
        {
          label: I18N.t('msw.mac.arp_addr_list'),
          value: '5',
          comp: pdmanage.Arpstatic
        }
      ])
    }
  }
}
</script>
