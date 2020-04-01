<template>
  <el-popover :close-delay="0" :placement="pos" effect="dark" transition="none" trigger="hover" width="250px">
    <div class="port-panel">
      <div class="port-panel-item">
        <div class="port-panel-item__label">{{$t('port_panel.port_f')}}</div>
        <div class="port-panel-item__value">{{port.ifname}}</div>
      </div>
      <div class="port-panel-item">
        <div class="port-panel-item__label">{{$t('port_panel.port_status_f')}}</div>
        <div class="port-panel-item__value">
          <template v-if="port.enable">
            <template v-if="port.link">
              <span class="c-success">{{$t('port_panel.connection')}}</span>
            </template>
            <template v-else>{{$t('port_panel.disconnection')}}</template>
          </template>
          <template v-else>
            <span class="c-info" v-if="!excepMap[port.exception.toString()]">{{$t('port_panel.closed')}}</span>
            <span class="c-danger" v-else>{{excepMap[port.exception.toString()]}}</span>
          </template>
        </div>
      </div>
      <div class="port-panel-item">
        <div class="port-panel-item__label">{{$t('port_panel.port_speed_f')}}</div>
        <div class="port-panel-item__value">
          <template v-if="port.enable">
            <span class="c-warning" v-if="port.r_speed===0">10M</span>
            <span class="c-warning" v-else-if="port.r_speed===1">100M</span>
            <span class="c-success" v-else-if="port.r_speed===2">1000M</span>
            <span class="c-success" v-else-if="port.r_speed===3">10G</span>
            <!-- <span v-else-if="port.r_speed===3">10M-100M</span> -->
            <span v-else>--</span>
          </template>
          <template v-else>--</template>
        </div>
      </div>
      <div class="port-panel-item">
        <div class="port-panel-item__label">{{$t('port_panel.flow_f')}}</div>
        <div class="port-panel-item__value">
          <template v-if="port.enable">
            <div class="vm">
              <i class="el-icon-bottom c-warning"></i>
              <span>{{port.input_total|rateTrans}}</span>
            </div>
            <div class="vm">
              <i class="el-icon-top c-success"></i>
              <span>{{port.output_total|rateTrans}}</span>
            </div>
          </template>
          <template v-else>--</template>
        </div>
      </div>
      <div class="port-panel-item">
        <div class="port-panel-item__label">{{$t('port_panel.speed_f')}}</div>
        <div class="port-panel-item__value">
          <template v-if="port.enable">
            <div class="vm">
              <i class="el-icon-bottom c-warning"></i>
              <span>{{port.inrate_10s}}kbps</span>
            </div>
            <div class="vm">
              <i class="el-icon-top c-success"></i>
              <span>{{port.outtrate_10s}}kbps</span>
            </div>
          </template>
          <template v-else>--</template>
        </div>
      </div>
      <div class="port-panel-item">
        <div class="port-panel-item__label">{{$t('port_panel.port_type_attr_f')}}</div>
        <div class="port-panel-item__value">{{port.media_type===2?$t('port_panel.fiber'):$t('port_panel.electric')}}</div>
      </div>
    </div>
    <div slot="reference">
      <slot>
        <i class="eweb-port-electric"></i>
      </slot>
    </div>
  </el-popover>
</template>
<script>
import { rateTrans } from '@/utils/utils'
export default {
  name: 'port-panel-view-tip',
  props: {
    pos: {
      type: String,
      default: 'top'
    },
    port: {
      type: Object,
      default: () => ({})
    }
  },
  filters: { rateTrans },
  data() {
    return {
      excepMap: Object.freeze({
        '-1': window.I18N.t('port_panel.unknow_err'),
        '1': window.I18N.t('port_panel.bpdu_err'),
        '3': window.I18N.t('port_panel.self_loop'),
        '4': window.I18N.t('port_panel.storm_cfg_err'),
        '5': window.I18N.t('port_panel.storm_cfg_group'),
        '6': window.I18N.t('port_panel.storm_cfg_uni'),
        '7': window.I18N.t('port_panel.acl_cfg_err'),
        '8': window.I18N.t('port_panel.protect_cfg_err'),
        '9': window.I18N.t('port_panel.dhcp_cfg_err'),
        '10': window.I18N.t('port_panel.arp_cfg_err'),
        '11': window.I18N.t('port_panel.rldp_loop_warning'),
        '12': window.I18N.t('port_panel.rldp_loop_block'),
        '13': window.I18N.t('port_panel.rldp_loop_down')
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/variable';
@import '~@/style/utils/mixins';
.port-panel {
  min-width: 200px;
  &-item {
    margin-bottom: 5px;
    clear: both;
    @include clearfix;
    &__label,
    &__value {
      float: left;
    }
    &__label {
      width: 80px;
      text-align: left;
    }
    &__value {
      width: calc(100% - 80px);
      text-align: right;
    }
  }
}
</style>
