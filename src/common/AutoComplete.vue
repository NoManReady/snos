<template>
  <el-autocomplete class="component_autocomplete" :class="clazz" v-model="val" :valueKey="valueKey" popper-class="eweb-popper" :fetch-suggestions="onFetch" :placeholder="placeholder" @select="onSelect">
    <i class="el-icon-error el-input__icon clear-icon" slot="suffix" v-show="value" title="清空重选" @click="onClear">
    </i>
    <template slot-scope="{item}">
      <slot :item="item">
        <span>{{item[valueKey]}}</span>
        <span v-if="item.desc" class="c-info">（{{item.desc}}）</span>
      </slot>
    </template>
  </el-autocomplete>
</template>
<script>
export default {
  name: 'ComponentAutocomplete',
  props: {
    placeholder: String,
    value: String,
    clazz: String,
    dataSource: {
      type: Array,
      default: () => []
    },
    valueKey: {
      type: String,
      default: 'value'
    }
  },
  data() {
    return {
      val: ''
    }
  },
  created() {
    this.val = this.value
  },
  computed: {
    list() {
      return this.dataSource
    }
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
    onFetch(str, cb) {
      const _result = this.list.filter(item => {
        return JSON.stringify(item).indexOf(str) > -1
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
</style>
