<template>
  <div :class="{'vm':isInline}" class="common-popover">
    <el-popover :width="pwidth" placement="top" ref="commonPopoverRef" trigger="click" v-model="commonPopoverShow">
      <el-form :model="baseModel" :rules="baseRules" @submit.native.prevent ref="baseForm" size="small">
        <el-form-item prop="cValue">
          <p class="tc fs15">{{title}}</p>
          <template v-if="type==='input'">
            <el-input :title="baseModel.cValue" @keydown.enter.native="onSubmit" clearable v-model="baseModel.cValue"></el-input>
          </template>
          <template v-if="type==='select'">
            <el-select :title="baseModel.cValue" v-model="baseModel.cValue">
              <el-option :key="opt.value" :label="opt.label" :value="opt.value" v-for="opt in options"></el-option>
            </el-select>
          </template>
        </el-form-item>
      </el-form>
      <div :style="styl" class="tc">
        <el-button @click="commonPopoverShow = false" plain size="small">{{$t('action.cancel')}}</el-button>
        <el-button @click="onSubmit" size="small" type="primary">{{$t('action.confirm')}}</el-button>
      </div>
    </el-popover>
    <label
      :class="{'common-popover-disabled':disabled,'pointer':!disabled}"
      @click.stop
      class="target"
      v-popover:commonPopoverRef
    >
      <slot>
        <a class="c-success" href="javascript:;">{{baseModel.cValue}}</a>
        <i class="el-icon-edit fs16 c-success ml5"></i>
      </slot>
    </label>
  </div>
</template>
<script>
export default {
  name: 'CommonPopover',
  props: {
    value: String,
    rules: Array,
    title: String,
    type: {
      type: String,
      default: 'input'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    options: {
      type: Array,
      default: () => []
    },
    pwidth: {
      type: Number | String,
      default: 250
    },
    isInline: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      commonPopoverShow: false,
      baseModel: {
        cValue: ''
      },
      baseRules: {
        cValue: this.rules
      }
    }
  },
  computed: {
    styl() {
      return this.$store.getters.lang === 'en' ? { 'margin-top': '28px' } : {}
    }
  },
  watch: {
    value: {
      handler() {
        this.baseModel.cValue = this.value
      },
      immediate: true
    },
    commonPopoverShow(v) {
      if (v) {
        this.baseModel.cValue = this.value
      } else {
        this.baseModel.cValue = ''
      }
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    }
  },
  methods: {
    // 提交hostname
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          if (this.baseModel.cValue !== this.value) {
            this.$emit('submit', this.baseModel.cValue)
            this.$emit('input', this.baseModel.cValue)
          }
          this.commonPopoverShow = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.common-popover {
  .commong {
    position: relative;
  }
  &-disabled {
    pointer-events: none;
    cursor: default;
  }
}
</style>
