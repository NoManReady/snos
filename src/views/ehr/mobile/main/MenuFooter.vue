<template>
  <ul class="menu tc">
    <li :class="{'c-success': menu.idx === curIdx}" :key="menu.icon" @click="onMenuClick(menu)" v-for="menu in menuDate">
      <i :class="menu.icon" class="fs22"></i>
      <label>{{menu.title}}</label>
    </li>
  </ul>
</template>
<script>
export default {
  name: 'MenuFooter',
  data() {
    const MENU_DATA = [
      {
        idx: 0,
        title: '网络',
        label: '网络状态',
        icon: 'rjucd-project'
      },
      {
        idx: 1,
        title: '用户',
        label: '用户管理',
        icon: 'rjucd-user'
      },
      {
        idx: 2,
        title: '上网',
        label: '上网设置',
        icon: 'rjucd-network'
      },
      {
        idx: 3,
        title: 'Wi-Fi',
        label: 'Wi-Fi配置',
        icon: 'rjucd-wifi'
      },
      {
        idx: 4,
        title: '更多',
        label: '更多设置',
        icon: 'rjucd-systemset'
      }
    ]
    return {
      curIdx: 0,
      menuDate: MENU_DATA
    }
  },
  methods: {
    onMenuClick(menu) {
      this.curIdx = menu.idx
      this.$emit('clickMenu', { idx: menu.idx, label: menu.label })
    }
  }
}
</script>
<style lang="scss" scoped>
.menu {
  box-sizing: border-box;
  background: #fff;
  border-top: #e8e8e8 1px solid;
  width: 100%;
  height: 60px;
  li {
    margin-top: 8px;
    display: inline-block;
    cursor: pointer;
    width: 20%;
    i {
      width: 100%;
      line-height: 24px;
      display: inline-block;
    }
  }
}
</style>
