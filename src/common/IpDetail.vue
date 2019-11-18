<template>
  <div>
      <div v-if="!row.ip_group">
        <p v-for="ip of row.ip_slots" :key="ip">{{ip}}</p>
      </div>
      <template v-else>
        <span v-if="ipGroups.length">
          {{_getIpgroupName(row.ip_group)}}
          <el-tooltip placement="right">
            <i class="el-icon-info fs14 f-theme"></i>
            <div slot="content">
              <p v-for="ip of _getIpgroupIp(row.ip_group)" :key="ip">{{ip}}</p>
            </div>
          </el-tooltip>
        </span>
        <i class="el-icon-loading fs14 f-theme" v-else></i>
      </template>
  </div>
</template>
<script>
export default {
  name: 'ComponentIpDetail',
  props: {
    ipGroups: {
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
    async _loadIpGroupList() {
      // this.ipGroupsData = await this.$api.getAddrManage(true)
    },
    // 获取ipGroup名称
    _getIpgroupName(group) {
      let _ip = this.ipGroups.find(ip => ip.ip_group === group)
      return _ip ? _ip.name : group || '--'
    },
    // 获取ipGroup具体ip
    _getIpgroupIp(group) {
      let _ip = this.ipGroups.find(ip => ip.ip_group === group)
      return _ip ? _ip.ip : []
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
