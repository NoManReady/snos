<template>
  <el-dialog :visible.sync="visible" center width="550px">
    <span class="c-success fs20" slot="title">密码修改</span>
    <password :first-init="true" :show-header="false" @after-change="afterChange" />
  </el-dialog>
</template>
<script>
import Password from '@/views/common/systool/Password'
import bus from '@/utils/bus'
export default {
  name: 'CommonModifyPassword',
  data() {
    return {
      visible: false,
      el: null
    }
  },
  components: {
    Password
  },
  methods: {
    afterChange(isOk) {
      bus.$emit('auth-callback', { isOk, el: this.el })
      this.visible = false
    }
  }
}
</script>
<style lang="scss" scoped>
</style>