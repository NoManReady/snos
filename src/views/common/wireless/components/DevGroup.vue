<template>
  <div class="dev-group ml10 vm">
    <span class="fs14 vm">{{$t('wifi_comm.dev_group_f')}}</span>
    <el-select @change="_onChangeGroup" class="vm w100" size="mini" v-model="groupId">
      <el-option
        :key="o.groupId"
        :label="o.isDefault === 'true' ? $t('devlist.def_group') : o.groupName"
        :value="o.groupId"
        v-for="o in networkGroups"
      ></el-option>
    </el-select>
    <strong class="c-warning" v-if="existIndepend">
      <i18n path="wifi_comm.unsupport_tocfg" tag="span">
        <a class="c-success" href="https://noc.ruijie.com.cn/nocindex/" target="_blank">{{$t('wifi_comm.noc')}}</a>
      </i18n>
    </strong>
  </div>
</template>
<script>
export default {
  name: 'DevGroup',
  props: {
    existIndepend: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      groupId: '0',
      networkGroups: []
    }
  },
  computed: {
    curSn() {
      return top.APP_SYSINFO.serial_num
    }
  },
  created() {
    this._getDefaultGroup()
  },
  methods: {
    // 获取当前设备网络
    async _loadNetworkId() {
      let _result = await this.$api.getNetworkId()
      return _result
    },
    // 获取分组信息
    async _getDefaultGroup() {
      let _res = await this.$api.getNetworkGroup({
        isSilence: true
      })
      let _groupInfo = _res.groupInfo || []
      _groupInfo.forEach(o => {
        if (o.deviceList) {
          o.deviceList.forEach(dev => {
            if (dev.devSN === this.curSn) {
              this.groupId = o.groupId
            }
          })
        }
      })
      this.networkGroups = Object.freeze(
        _groupInfo.sort((a, b) => +a.groupId - b.groupId)
      )
      this._onChangeGroup(this.groupId)
    },
    _onChangeGroup(v) {
      this.$emit('change-group', v)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>