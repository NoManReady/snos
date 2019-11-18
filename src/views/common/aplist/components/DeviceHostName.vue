<template>
  <div class="device-hostname">
    <el-input ref="hostNameInput" size="mini" v-model="value"></el-input>
    <el-button @click="onSave()" size="mini" type="text">保存</el-button>
    <el-button @click="$emit('cancel')" size="mini" type="text">取消</el-button>
  </div>
</template>
<script>
import { hostnameRegexp, lengthValidate } from '@/utils/rulesUtils'
export default {
  name: 'DeviceHostname',
  props: {
    row: {
      default: {},
      type: Object
    },
    maxLen: {
      default: 64,
      type: Number
    }
  },
  data() {
    return {
      value: '',
      sn: ''
    }
  },
  created() {
    this.value = this.row.hostName
    this.sn = this.row.serialNumber
  },
  methods: {
    onSave() {
      if (!hostnameRegexp.test(this.value)) {
        return this.message('请输入中文,英文字母，数字，下划线，-，#或@')
      } else if (!lengthValidate(this.value, 0, this.maxLen)) {
        return this.message(
          `设备名称不能超过${this.maxLen}个字符，中文占3个字符`
        )
      }
      this.$emit('save', this.row, {
        name: this.value,
        sn: [this.sn]
      })
    },
    message(text) {
      this.$message({
        message: text,
        type: 'warning'
      })
    }
  }
}
</script>
<style lang="scss">
</style>
