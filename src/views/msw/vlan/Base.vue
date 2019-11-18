<template>
  <div class="vlan-base">
    <!-- <help-alert title="VLAN设置"></help-alert> -->
    <el-collapse v-model="collapseValue">
      <el-collapse-item name="1">
        <template slot="title">
          <strong class="fs16 c-success">VLAN列表</strong>
        </template>
        <vlan-setting />
      </el-collapse-item>
      <el-collapse-item name="2">
        <template slot="title">
          <strong class="fs16 c-success">端口列表</strong>
        </template>
        <vlan-port />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import { Collapse, CollapseItem } from 'element-ui'
import Setting from './Setting'
import Port from './Port'
export default {
  name: 'vlan-base',
  components: {
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [Setting.name]: Setting,
    [Port.name]: Port
  },
  data() {
    return {
      collapseValue: ['1', '2']
    }
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
.vlan-base {
}
</style>

