<template>
  <el-autocomplete class="component_arp-input" :class="clazz" v-model="val" :valueKey="valueKey" popper-class="arp-popper" :fetch-suggestions="arpFetch" :placeholder="placeholder" @select="onSelect">
    <i class="el-icon-error el-input__icon clear-icon" slot="suffix" v-show="value" title="清空重选" @click="onClear">
    </i>
    <template slot-scope="scope">
      <slot :item="scope.item">
        <template v-if="valueKey === 'mac'">
          <span class="strong">{{ scope.item.mac }}</span>
          <span class="ml10 fr">({{ scope.item.ip }})</span>
        </template>
        <template v-else>
          <span class="strong">{{ scope.item.ip }}</span>
          <span class="ml10 fr" v-if="scope.item.mac">({{ scope.item.mac }})</span>
        </template>
      </slot>
    </template>
  </el-autocomplete>
</template>
<script>
export default {
  name: 'ComponentArpInput',
  props: {
    placeholder: String,
    value: String,
    clazz: {
      type: String,
      default: 'w260'
    },
    dataSource: Array,
    valueKey: {
      type: String,
      default: 'ip'
    },
    filter: {
      type: Function,
      default: lis => lis
    },
    filterType: {
      type: String,
      default: 'all'  // all | lan | wan
    }
  },
  data() {
    return {
      val: '',
      arpList: []
    }
  },
  async created() {
    if (!this.dataSource) {
      await this._loadArpList()
    } else {
      this.arpList = this.dataSource
    }
    this.val = this.value
  },
  watch: {
    value() {
      this.val = this.value
    },
    val(v) {
      this.$emit('input', v)
    }
  },
  methods: {
    // 获取arp列表
    async _loadArpList() {
      let _result = await this.$api.getArpTable()
      if (this.filterType !== 'all') {
        _result = _result.filter(o => o.device.includes(this.filterType.toLocaleUpperCase()))
      }
      this.arpList = Object.freeze(
        this.filter(Array.isArray(_result) ? _result : [])
      )
    },
    // filter获取arp列表
    arpFetch(str, cb) {
      const _result = this.arpList.filter(arp => {
        return arp.ip.indexOf(str) > -1 || arp.mac.indexOf(str) > -1
      })
      cb(_result)
    },
    onSelect(item) {
      this.$emit('select', item)
    },
    onClear(item) {
      this.val = ''
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
