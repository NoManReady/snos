<template>
  <div class="home-overview">
    <!-- 设备详细信息 -->
    <sys-info />
    <!-- 流量信息 -->
    <monitor-portflow :show-help="false">
      <template slot-scope="{portinfo,loading}">
        <div class="tc">
          <port-panel-view :loading="loading" :ports="portinfo" :uplink="uplink.lpid" class="home-overview--panel" />
        </div>
      </template>
    </monitor-portflow>
  </div>
</template>
<script>
import SysInfo from './overview/SysInfo'
import Portflow from '../monitor/Portflow'
import PortPanelView from '@/common/PortPanelView'
import { mapGetters } from 'vuex'
export default {
  name: 'home-overview',
  components: {
    SysInfo,
    [Portflow.name]: Portflow,
    [PortPanelView.name]: PortPanelView
  },
  computed: {
    ...mapGetters('switcher', ['uplink'])
  }
}
</script>
