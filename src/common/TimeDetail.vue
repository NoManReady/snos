<template>
  <div>
    <template v-if="row.tr_group">
      <span>{{row.tr_group}}</span>
      <i v-if="row.tr_group" class="el-icon-date f-theme pointer" @click="_onOpenTimeSelection(_getTimegroupTime(row.tr_group),false)"></i>
    </template>
    <template v-else>
      <span>自定义</span>
      <i class="el-icon-date f-theme pointer" @click="_onOpenTimeSelection(row.tr_slots,false)"></i>
    </template>
  </div>
</template>
<script>
import timeSelection from '@/utils/timeSelection'
export default {
  name: 'ComponentTimeDetail',
  props: {
    timeGroups: {
      type: Array,
      default: () => []
    },
    row: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    // 加载ip地址列表
    async _loadTimeGroupList() {
      // this.timeGroupsData = await this.$api.getDateManage(true)
    },
    // 获取timeGroup具体time
    _getTimegroupTime(group) {
      let _time = this.timeGroups.find(time => time.tmngtName === group)
      return _time ? _time.time : {}
    },
    // 打开时间范围控件
    _onOpenTimeSelection(selections, enable) {
      timeSelection({
        selections,
        enable
      })
    }
  }
}
</script>
<style lang="scss">
@import '../theme/theme.scss';
.arp-popper {
  width: auto !important;
  .strong {
    font-weight: bold;
  }
}
.clear-icon {
  color: $--color-info-light;
}
.clear-icon:hover {
  color: $--color-info;
}
</style>
