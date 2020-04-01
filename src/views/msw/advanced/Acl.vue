<template>
  <div class="advanced-acl">
    <common-tabs :tabs="tabs"></common-tabs>
  </div>
</template>
<script>
import Tabs from '@/common/Tabs'
import * as acl from './acl/index'
export default {
  name: 'advanced-acl',
  components: {
    [Tabs.name]: Tabs
  },
  data() {
    return {
      tabs: Object.freeze([
        {
          label: I18N.t('msw.acl.acl_list'),
          value: '0',
          comp: acl.Acl
        },
        // {
        //   label: I18N.t('msw.acl.alc_date'),
        //   value: '1',
        //   comp: acl.Date
        // },
        {
          label: I18N.t('msw.acl.apply_acl'),
          value: '2',
          comp: acl.Port
        }
      ])
    }
  }
}
</script>
