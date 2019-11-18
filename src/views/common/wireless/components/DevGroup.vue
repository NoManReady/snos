<template>
  <div class="dev-group ml10 vm" v-show="!hideGroup">
    <span class="vm">设备分组：</span>
    <el-select size="mini" class="vm w120" v-model="groupId" @change='_onChangeGroup'>
      <el-option v-for="group in networkGroups" :key="group.groupId" :value="group.groupId" :label="group.groupName"></el-option>
    </el-select>
    <strong class="c-warning" v-if="existIndepend">不支持修改公寓Wi-Fi的配置， 去<a class="c-success" href="https://noc.ruijie.com.cn/nocindex/" target="_blank">诺客</a>修订</strong>
  </div>
</template>
<script>
export default {
  name: 'DevGroup',
  props: {
    existIndepend: {
      type: Boolean,
      default: false
    },
    hideGroup: {
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
  created () {
    this._getDefaultGroup()
  },
  methods: {
    // 获取当前设备网络
    async _loadNetworkId() {
      let _result = await this.$api.getNetworkId()
      return _result
    },
    // 加载网络分组
    async _loadNetworkGroup(loading) {
      let _result = await this.$api.getNetworkGroup({
        isSilence: !loading
      })
      let _networkGroups = _result.groupInfo || []
      let _defaultGroup = _networkGroups.find(group => {
        return group.isDefault === 'true'
      })
      return {
        list: _networkGroups,
        current: _defaultGroup || {}
      }
    },
    // 获取分组信息
    async _getDefaultGroup() {
      let _defaultGroup = null
      if (!this.hideGroup) {
        let { list, current } = await this._loadNetworkGroup(false)
        _defaultGroup = current
        list.forEach((o) => {
          if (o.isDefault === "true") {
            o.groupName = "默认组"
          }
        })
        this.networkGroups = Object.freeze(list)

        if (this.$dev() == 'eap') { // 主AP的EAP可能不在默认分组中，要获取当前分组信息
          _defaultGroup = await this._loadNetworkId()
          // this.networkGroups = [_defaultGroup]
        }
      }
      this.groupId = _defaultGroup.groupId
    },
    _onChangeGroup(v) {
      this.$emit('change-group', v)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>