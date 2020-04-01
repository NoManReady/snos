<template>
  <div class="device-setting">
    <div class="block inner-info" v-if="childMenus.menus.length">
      <el-row align="middle" class="device-info" type="flex">
        <el-col :md="20" :span="20" :xs="18">
          <dev-info />
        </el-col>
        <el-col :md="4" :span="4" :xs="6" class="tr">
          <device-tool />
        </el-col>
      </el-row>
      <app-aside
        :menus="childMenus.menus"
        :p-path="childMenus.path"
        @select-item="selectItem"
        class="mt10"
        mode="horizontal"
        trigger="hover"
      ></app-aside>
    </div>
    <div :style="contentStyl" class="block">
      <router-view :key="`${routerId}`"></router-view>
    </div>
    <common-top />
  </div>
</template>
<script>
import { AppAside } from '@/layout'
import Top from '@/common/Top'
import DevInfo from '@/views/common/overview/components/DevInfo'
import DeviceTool from './DeviceTool'
export default {
  name: 'Alone',
  data() {
    return {
      routerId: Math.random()
    }
  },
  components: {
    AppAside,
    DevInfo,
    [DeviceTool.name]: DeviceTool,
    [Top.name]: Top
  },
  computed: {
    // 内容模块style
    contentStyl() {
      return {}
    },
    childMenus() {
      return this.$store.getters.childMenus
    }
  },
  methods: {
    // 菜单栏触发事件
    selectItem(menu) {
      let _routeName = `${menu.fullPath.join('/')}`
      if (_routeName === this.$route.name) {
        this.routerId = Math.random()
      } else {
        this.$router.push({
          name: _routeName,
          query: menu.query || {}
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.inner-info {
  margin-bottom: 8px;
  padding-bottom: 4px;
}
</style>
