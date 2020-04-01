<template>
  <el-popover :close-delay="0" :placement="pos" effect="dark" transition="none" trigger="click" width="250px">
    <el-row :gutter="36" class="port-panel--graphic">
      <el-col :span="12">
        <h2 class="graphic-tit">{{$t('port_panel.port_role')}}</h2>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="upport" type="closed">
          <template #after>
            <span class="label vm">{{$t('port_panel.electric')}}</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="guangkou" type="closed">
          <template #after>
            <span class="label vm">{{$t('port_panel.fiber')}}</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="upport" inner-icon="shanglian" type="closed">
          <template #after>
            <span class="label vm">{{$t('port_panel.up_port')}}</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="upport" sub-icon="gongdian" type="closed">
          <template #after>
            <span class="label vm">{{$t('port_panel.poe_port')}}</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="upport" sub-icon="bugongdian" type="closed">
          <template #after>
            <span class="label vm">{{$t('port_panel.poe_err_port')}}</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="upport" text="1" type="closed">
          <template #after>
            <span class="label vm">{{$t('port_panel.agg_port_tip')}}</span>
          </template>
        </port-icon>
      </el-col>
      <el-col :span="12">
        <h2 class="graphic-tit">{{$t('port_panel.port_status')}}</h2>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="upport" type="success">
          <template #after>
            <span class="label vm">1G/2.5G/10G</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="upport" type="warning">
          <template #after>
            <span class="label vm">10M/100M</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="upport" type="error">
          <template #after>
            <span class="label vm">{{$t('port_panel.exception')}}</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="upport" type="info">
          <template #after>
            <span class="label vm">{{$t('port_panel.opened')}}</span>
          </template>
        </port-icon>
        <port-icon :hover="false" :size="32" class="graphic-item" direct="h" icon="upport" type="closed">
          <template #after>
            <span class="label vm">{{$t('port_panel.closed')}}</span>
          </template>
        </port-icon>
      </el-col>
    </el-row>
    <el-button size="medium" slot="reference" type="text">
      <i class="rjucd-help fs18 vm"></i>
      <span class="vm">{{$t('port_panel.icon_view')}}</span>
    </el-button>
  </el-popover>
</template>
<script>
import PortIcon from './PortIcon'
import { Row, Col } from 'element-ui'
export default {
  name: 'port-panel--graphic',
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    [PortIcon.name]: PortIcon
  },
  props: {
    pos: {
      type: String,
      default: 'bottom'
    }
  },
  data() {
    return {}
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/variable';
.port-panel--graphic {
  padding: 18px;
  .graphic-tit,
  .graphic-item {
    font-size: 14px;
    color: $--color-text-regular;
    margin-bottom: 12px;
    display: block;
    text-align: left;
  }
  .graphic-tit {
    font-weight: bold;
  }
}
</style>
