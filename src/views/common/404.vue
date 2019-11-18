<template>
  <div class="error 404">
    <div class="error-inner">
      <i class="el-icon-info"></i>
      <p class="error-msg fs20">主人，您的页面走丢了...</p>
      <p class="error-msg fs20">
        请尝试点击
        <a @click="_onToIndex" class="c-success pointer" type="text">首页</a>
        返回吧。
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'err404',
  title: '404页面',
  data() {
    return {}
  },
  methods: {
    _onToIndex() {
      window.top.location.href = location.origin
      // this.$router.push({ name: `admin/` })
    }
  }
}
</script>
<style lang="scss" scoped>
.error {
  color: #666;
  text-align: center;
  .el-icon-info {
    font-size: 56px;
  }
  .error-msg {
    margin-top: 15px;
  }
  .error-inner {
    display: inline-block;
    margin: 10% auto 0;
  }
}
</style>