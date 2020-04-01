<template>
  <div class="more">
    <el-collapse @change="clickMenu" accordion class="more-menu" v-model="activeName">
      <strong class="fs16 vm mg10 c-info">设备管理</strong>
      <el-collapse-item name="basic" title="路由器基本信息"></el-collapse-item>
      <el-collapse-item name="pwd" title="修改管理密码"></el-collapse-item>
      <el-collapse-item name="rebootSet" title="重启/恢复出厂">
        <div>
          <el-button plain type="primary">重启</el-button>
          <el-button plain type="primary">恢复出厂</el-button>
        </div>
      </el-collapse-item>

      <strong class="fs16 vm mg10 c-info">高级配置</strong>
      <el-collapse-item name="upnp" title="UPnP"></el-collapse-item>
      <el-collapse-item name="pcWeb" title="PC端WEB管理界面（推荐横屏查看）"></el-collapse-item>
      <el-collapse-item name="mquick" title="快速配置"></el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import { Collapse, CollapseItem } from 'element-ui'
export default {
  name: 'More',
  data() {
    return {
      activeName: 0
    }
  },
  components: {
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem
  },
  methods: {
    clickMenu(id) {
      console.log(id)
      if (id !== 'rebootSet') {
        this.activeName = [''] // 不打开
      }

      switch (id) {
        case 'pcWeb':
          this.$router.push({ name: 'admin/alone' })
          break
        case 'mquick':
          this.$router.push({ name: 'm/quick' })
          break
        default:
          break
      }
    }
  }
}
</script>
<style lang="scss">
.more .more-menu {
  .el-collapse-item__header {
    padding-left: 10px;
  }
}
</style>
