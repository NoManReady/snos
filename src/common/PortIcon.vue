<template>
  <div class="port-icon">
    <slot name="before"></slot>
    <div :class="{'vm':direct==='h','pointer':hover,'disabled':disabled}" class="icon">
      <i :class="classArr" :style="iconStyl"></i>
      <slot name="inner">
        <span :class="[textClazz]" v-if="text">{{text}}</span>
        <i :class="`rjucd-${innerIcon}`" class="inner-icon" v-if="innerIcon"></i>
      </slot>
    </div>
    <slot name="after"></slot>
  </div>
</template>
<script>
const types = ['info', 'error', 'success', 'warning', 'closed']
export default {
  name: 'port-icon',
  inject: {
    textClazz: {
      default: () => ['subscript']
    }
  },
  props: {
    hover: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    direct: {
      type: String,
      default: 'v'
    },
    innerIcon: String,
    text: String | Number,
    port: Object,
    label: String,
    rotate: {
      type: Boolean,
      default: false
    },
    type: {
      validator(v) {
        return types.indexOf(v) > -1
      },
      default: 'info'
    },
    icon: {
      type: String,
      default: 'electric'
    },
    size: {
      type: Number,
      default: 32
    }
  },
  computed: {
    classArr() {
      let _clazz = []
      _clazz.push(`rjucd-${this.icon}`)
      if (this.rotate) {
        _clazz.push('rotate')
      }
      _clazz.push(this.type)
      return _clazz
    },
    iconStyl() {
      return { 'font-size': `${this.size}px` }
    }
  },
  data() {
    return {}
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/variable';
@import '~@/style/utils/mixins';
.port-icon {
  margin: auto;
  text-align: center;
  vertical-align: middle;
  display: inline-block;
  white-space: nowrap;
  .disabled {
    cursor: not-allowed;
  }
  .label {
    font-size: 12px;
  }
  .icon {
    position: relative;
    > i {
      display: inline-block;
      line-height: 1;
    }
    > span,
    > i.inner-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      display: inline-block;
      font-size: 12px;
      color: #fff;
      transform-origin: center center;
      transform: translate(-50%, -50%) scale(0.8);
    }
    > span.subscript {
      top: 100%;
      left: 100%;
      background: $--color-info;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      transform: translate(-80%, -90%) scale(0.8);
    }
  }
  /deep/ .icon {
    .info {
      color: #e6e6e6;
      & ~ .subscript {
        background-color: #e6e6e6;
      }
    }
    .closed {
      color: #595959;
      & ~ .subscript {
        background-color: #595959;
      }
    }
    .error {
      color: $--color-danger;
      & ~ .subscript {
        background-color: $--color-danger;
      }
    }
    .good,
    .success {
      color: $--color-success;
      & ~ .subscript {
        background-color: $--color-success;
      }
    }
    .normal,
    .warning {
      color: $--color-warning;
      & ~ .subscript {
        background-color: $--color-warning;
      }
    }
    .rotate {
      transform: rotate(180deg);
    }
  }
}
</style>
