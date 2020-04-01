<template>
  <div class="tc">
    <p>您访问的页面走丢了...</p>
    <p>也许研发正在加班开发哦～</p>
    <a @click="onToHome">返回首页</a>
  </div>
</template>
<script>
export default {
  name: 'NotFound',
  methods: {
    onToHome() {
      this.$emit('post', { menuId: 'back homepage' })
    }
  }
}
</script>
