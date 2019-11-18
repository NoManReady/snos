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
          label: 'ACL列表',
          value: '0',
          comp: acl.Acl
        },
        // {
        //   label: 'ACL时间',
        //   value: '1',
        //   comp: acl.Date
        // },
        {
          label: '应用ACL',
          value: '2',
          comp: acl.Port
        }
      ])
    }
  }
}
</script>
