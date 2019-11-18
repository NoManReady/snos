<template>
<div class="common-port" @click="onClick">
    <span>
      <slot name="top" :port="port"></slot>
    </span>
    <i class="rjucd-upport" :class="icnClass"></i>
    <span>
      <slot name="bottom" :port="port"></slot>
    </span>
</div>
</template>
<script>
export default {
  name: 'common-port',
  props: {
    port: {
      type: Object,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    icnClass() {
      let clazz = []
      const _classMap = {
        'off-off': 'disable off',
        'off-on': 'disable on',
        'on-off': 'enable off',
        'on-on': 'enable on'
      }
      return _classMap[this.port._status]
    }
  },
  methods: {
    onClick() {
      this.$emit('on-click', this.port)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../style/utils/_variable.scss';
.common-port {
  & + & {
    margin-left: 5px;
  }
  display: inline-block;
  > span {
    line-height: 2;
    display: block;
    text-align: center;
    font-size: 13px;
    color: #666;
  }
  > i {
    padding: 4px;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: $--border-radius-base;
    font-size: 26px;
    &.enable {
      border-color: $--color-primary;
    }
  }

  @media screen and (min-width: 768px) {
    & + & {
      margin-left: 8px;
    }
    & > i {
      font-size: 28px;
    }
  }
  @media screen and (min-width: 992px) {
    & + & {
      margin-left: 12px;
    }
    & > i {
      font-size: 34px;
    }
  }
  @media screen and (min-width: 1200px) {
    & + & {
      margin-left: 16px;
    }
    & > i {
      font-size: 46px;
    }
  }
}
</style>
