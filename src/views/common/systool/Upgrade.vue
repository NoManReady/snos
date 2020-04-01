<template>
  <div class="systool-upgrade">
    <common-tabs :tabs="tabs"></common-tabs>
  </div>
</template>
<script>
import Tabs from '@/common/Tabs'
import * as upgrade from './upgrade/index'
export default {
  name: 'systool-upgrade',
  components: {
    [Tabs.name]: Tabs
  },
  data() {
    return {
      tabs: Object.freeze([
        {
          label: I18N.t('systool.online_upgrade'),
          value: '0',
          comp: upgrade.Online
        },
        {
          label: I18N.t('systool.local_upgrade'),
          value: '1',
          comp: upgrade.Local
        }
      ])
    }
  }
}
</script>

