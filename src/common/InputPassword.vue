<template>
  <el-input
    :type="typ"
    class="component_input-password"
    :class="clazz"
    v-model="val"
    :placeholder="placeholder"
  >
    <el-button
      class="el-input__icon suffix-icon pointer"
      slot="append"
      :icon="typ === 'text' ? 'rjucd-visible' : 'rjucd-unvisible'"
      @click="onClick"
    ></el-button>
  </el-input>
</template>
<script>
export default {
  name: 'EwebInputPassword',
  props: {
    placeholder: String,
    value: String,
    clazz: String,
    type: {
      type: String,
      default: 'password' // password | text
    }
  },
  data() {
    return {
      val: '',
      typ: 'password'
    }
  },
  created() {
    this.val = this.value
    this.typ = this.type
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
    onClick(item) {
      this.typ = this.typ === 'text' ? 'password' : 'text'
    }
  }
}
</script>
<style lang="scss">
@import '../theme/theme.scss';
.component_input-password {
  .suffix-icon {
    text-indent: -4px;
    font-size: 18px;
  }
  .suffix-icon:hover {
    color: $--color-primary-light-4;
  }
  .eweb-eye-show {
    color: $--color-primary;
  }
}
</style>
