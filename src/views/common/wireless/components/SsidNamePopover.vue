<template>
  <div class="ssidname-popover">
    <el-popover placement="top" ref="ssidNamepopoverRef" trigger="click" v-model="ssidNamePopoverShow" width="200">
      <el-form :model="baseModel" :rules="baseRules" @submit.native.prevent ref="baseForm" size="small">
        <el-form-item prop="ssidName">
          <p class="tc fs15">{{$t('wifi_comm.edit_wifi_name')}}</p>
          <el-input :title="baseModel.ssidName" @keydown.enter.native="onSsidNameSubmit" v-model="baseModel.ssidName"></el-input>
        </el-form-item>
      </el-form>
      <div class="tc">
        <el-button @click="ssidNamePopoverShow = false" plain size="small">{{$t('action.cancel')}}</el-button>
        <el-button @click="onSsidNameSubmit" size="small" type="primary">{{$t('action.confirm')}}</el-button>
      </div>
    </el-popover>
    <label class="eweb-static-form--label pointer ssidname" v-popover:ssidNamepopoverRef>
      <a class="c-success" href="javascript:;">{{ssid}}</a>
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
import { existValidate } from '@/utils/rulesUtils'
export default {
  name: 'ComponentSsidNamePopover',
  props: {
    ssid: String,
    ssidNames: Array
  },
  data() {
    const ssidNameUniValidator = (rule, value, cb) => {
      if (existValidate(this.ssidNames, value, this.ssid)) {
        return cb(new Error(I18N.t('overview.wifi_is_exist', { name: value })))
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
          {
            required: true,
            message: I18N.t('overview.wifi_no_empty'),
            whitespace: true
          },
          { validator: wifiNameValidator },
          { validator: ssidNameValidator, size: 32 },
          { validator: ssidNameUniValidator }
        ]
      }
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