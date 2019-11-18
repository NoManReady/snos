<template>
  <div class="ssidname-popover">
    <el-popover ref="ssidNamepopoverRef" placement="top" trigger="click" width="200" v-model="ssidNamePopoverShow">
      <el-form ref="baseForm" :model="baseModel" :rules="baseRules" size="mini" @submit.native.prevent>
        <el-form-item prop="ssidName">
          <p class="tc fs15">修改Wi-Fi名称</p>
          <el-input v-model="baseModel.ssidName" :title="baseModel.ssidName" @keydown.enter.native="onSsidNameSubmit"></el-input>
        </el-form-item>
      </el-form>
      <div class="tc">
        <el-button size="mini" type="text" @click="ssidNamePopoverShow = false">取消</el-button>
        <el-button type="primary" size="mini" @click="onSsidNameSubmit">确定</el-button>
      </div>
    </el-popover>
    <label v-popover:ssidNamepopoverRef class="eweb-static-form--label pointer ssidname">
      <a href="javascript:;" class="c-success">{{ssid}}</a>
      <i class="el-icon-edit fs16 c-success ml5"></i>
    </label>
  </div>
</template>
<script>
import {
  quoteValidator,
  ssidNameValidator,
  wifiNameValidator
} from '@/utils/rules'
export default {
  name: 'ComponentSsidNamePopover',
  props: {
    ssid: String,
    ssidNames: Array,
    indexs: Number
  },
  data() {
    const ssidNameUniValidator = (rule, value, cb) => {
      if (this.includeChinese) {
        return cb()
      }
      if (
        this.ssidNames.filter((name, i) => i !== this.indexs).includes(value)
      ) {
        cb(new Error(`已存在该名称：${value}`))
      }
      cb()
    }
    return {
      ssidNamePopoverShow: false,
      baseModel: {
        ssidName: ''
      },
      baseRules: {
        ssidName: [
          { required: true, message: '请输入Wi-Fi名称', whitespace: true },
          { validator: wifiNameValidator },
          { validator: ssidNameValidator, size: 32 },
          { validator: ssidNameUniValidator }
        ]
      }
    }
  },
  computed: {
    includeChinese() {
      return /[\u4e00-\u9fa5]/.test(this.baseModel.ssidName)
    }
  },
  watch: {
    ssid: {
      handler() {
        this.baseModel.ssidName = this.ssid
      },
      immediate: true
    },
    ssidNamePopoverShow(v) {
      if (v) {
        this.baseModel.ssidName = this.ssid
      } else {
        this.baseModel.ssidName = ''
        this.$nextTick(() => {
          this.$refs.baseForm.clearValidate()
        })
      }
    }
  },
  methods: {
    // 提交hostname
    onSsidNameSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.$emit('submit', this.baseModel.ssidName)
          this.ssidNamePopoverShow = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.ssidname-popover {
  .ssidname:hover > .el-icon-edit {
    display: inline;
  }
  .el-icon-edit {
    display: none;
  }
}
</style>