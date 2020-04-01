<template>
  <div>
    <form class="hide">
      <input autocomplete="on" name="loginPass" type="password" />
      <input autocomplete="on" name="ewebInputPassword" type="password" />
    </form>
    <el-input
      :class="clazz"
      :placeholder="placeholder"
      :type="typ"
      autocomplete="off"
      class="component_input-password"
      name="ewebInputPassword"
      size="medium"
      v-model="val"
    >
      <el-button :icon="typ === 'text' ? 'rjucd-visible' : 'rjucd-unvisible'" @click="onClick" class="pointer" slot="append"></el-button>
    </el-input>
  </div>
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
.hide {
  visibility: hidden;
  width: 0;
  height: 0;
}
.component_input-password {
  i {
    font-size: 22px;
    &:hover {
      color: $--color-primary-light-4;
    }
    &.rjucd-visible {
      color: $--color-primary;
    }
  }
}
</style>
