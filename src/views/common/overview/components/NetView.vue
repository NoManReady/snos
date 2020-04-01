<template>
  <div :class="{ 'is-macc': isMacc }" class="block overview-netview mb10" v-loading="loading">
    <el-row :gutter="0" align="middle" justify="center" type="flex">
      <el-col class="c-info tl">{{ $t("overview.whole_net_status") }}</el-col>
      <el-col class="tr">
        <el-button @click="_loadData" type="text">
          {{ $t("action.refresh") }}
          <i :class="loading ? 'el-icon-loading' : 'el-icon-refresh'" class="c-success"></i>
        </el-button>
      </el-col>
    </el-row>
    <el-row :gutter="0" align="middle" class="netview tc pb10" justify="center" type="flex">
      <el-col :span="2" class="w-auto">
        <div :class="{ pointer: hasWanLink }" @click="_onToNetWan" v-popover:ipinfoPopover>
          <div class="vm">
            <!-- <i :class="netStatus.connnected==='true' ? 'c-success' : 'c-warning'" class="rjucd-network"></i> -->
            <img :src="require('@/assets/earth.png')" class="view-icon" />
          </div>
          <strong>{{ isEgRouter ? wanProto : "-" }}</strong>
          <span class="caption">{{ $t("overview.internet") }}</span>
        </div>
      </el-col>
      <el-col :md="hasFlowInfo ? 1 : 2" :span="2">
        <i class="el-icon-loading c-success net-loading" v-if="netStatus.connnected === ''"></i>
        <div :class="netStatus.connnected === 'false' ? 'warning' : ''" class="line" v-else v-popover:netStatusPopover></div>
        <el-popover placement="top" ref="netStatusPopover" trigger="hover" v-if="netStatus.connnected === 'false'">
          <span>{{ netStatus.message || $t("overview.offline") }}</span>
        </el-popover>
      </el-col>
      <el-col :class="{ mw260: hasFlowInfo }" :span="2" class="w-auto plr5">
        <div>
          <span class="vm md-hide" v-if="hasFlowInfo">
            <span>{{ flowInfo.up || 0 | rateTrans }}</span>bps
            <i class="el-icon-caret-left"></i>
          </span>
          <div class="view-icon vm">
            <i :class="{ pointer: hasEgLink }" :data-icon="egRouter" @click="_onToGateway" class="rjucd-device icon-inner"></i>
          </div>
          <span class="vm md-hide" v-if="hasFlowInfo">
            <i class="el-icon-caret-right"></i>
            <span>{{ flowInfo.down || 0 | rateTrans }}</span>bps
          </span>
        </div>
        <strong>{{ egInfo ? "1" : "0" }}</strong>
        <span :class="{ pointer: hasEgLink }" @click="_onToGateway" class="caption w60">{{ egRouter }}</span>
      </el-col>
      <template v-if="swList.length >= 0 || isMsw">
        <el-col :md="hasFlowInfo ? 1 : 2" :span="2">
          <div class="line"></div>
        </el-col>
        <el-col :span="2" class="w-auto">
          <div :class="{ pointer: !isMacc }" @click="_onToPath('admin/switch_list')">
            <div class="view-icon vm">
              <i :data-icon="$t('nei.switch')" class="rjucd-device icon-inner"></i>
            </div>
            <strong>{{ swList.length || 0 }}</strong>
            <span class="caption">{{ $t("nei.switch") }}</span>
          </div>
        </el-col>
      </template>
      <template v-if="!isMsw && apList.length >= 0">
        <el-col :lg="2" :md="isEgRouter ? 1 : 2" :span="2">
          <div class="line"></div>
        </el-col>
        <el-col :span="2" class="w-auto">
          <div :class="{ pointer: !isMacc }" @click="_onToPath('admin/wifi/wifi_ap')">
            <div class="view-icon vm">
              <i class="rjucd-apac"></i>
            </div>
            <strong>{{ apList.length }}</strong>
            <span class="caption">
              <span v-if="hasAc">AP({{ apList.length - 1 }}) AC(1)</span>
              <span v-else>APs</span>
            </span>
          </div>
        </el-col>
      </template>
      <template v-if="!isMsw && !isMacc">
        <el-col :lg="2" :md="isEgRouter ? 1 : 2" :span="2">
          <div class="line dotted"></div>
        </el-col>
        <el-col :span="2" class="w-auto">
          <div :class="{ pointer: !isMacc }" @click="_onToPath(hasHomeOnline ? 'admin/home_online' : 'admin/wifi/wifi_sta')">
            <div class="view-icon vm">
              <i class="rjucd-user2"></i>
            </div>
            <strong>{{ userCount || 0 }}</strong>
            <span class="caption">{{hasHomeOnline ? $t("overview.online_user") : $t("overview.wireless_user") }}</span>
          </div>
        </el-col>
      </template>
      <template v-if="isMacc">
        <el-col :lg="2" :md="isEgRouter ? 1 : 2" :span="2">
          <!-- <div class="line"></div> -->
        </el-col>
        <el-col :span="2" class="w-auto">
          <div>
            <div class="view-icon vm">
              <i class="rjucd-device icon-inner" data-icon="?"></i>
            </div>
            <strong>{{ otherCount || 0 }}</strong>
            <span class="caption">{{ $t("nei.wait_add_manually") }}</span>
          </div>
        </el-col>
      </template>
    </el-row>
    <el-popover placement="top" ref="ipinfoPopover" trigger="hover" v-if="isEgRouter">
      <span v-if="ipinfo === false">{{ $t("overview.ip_not_detected") }}</span>
      <el-form class="view-form" label-width="100px" size="medium" v-else>
        <el-form-item :label="$t('wan.net_protocol_f')">
          <label>{{ wanProto }}</label>
        </el-form-item>
        <el-form-item :label="$t('wan.ip_addr_f')">
          <label>{{ ipinfo.ip }}</label>
        </el-form-item>
        <el-form-item :label="$t('wan.mask_addr_f')">
          <label>{{ ipinfo.mask }}</label>
        </el-form-item>
        <el-form-item :label="$t('wan.gateway_addr_f')">
          <label>{{ ipinfo.gateway }}</label>
        </el-form-item>
        <el-form-item :label="$t('wan.dns_addr_f')">
          <label>{{ ipinfo.dnsList }}</label>
        </el-form-item>
      </el-form>
    </el-popover>
  </div>
</template>
<script>
import netViewMixins from '@/views/common/overview/components/netViewMixins'
import { rateTrans } from '@/utils/utils'

export default {
  name: 'OverviewNetView',
  filters: {
    rateTrans
  },
  mixins: [netViewMixins]
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.overview-netview {
  min-width: 350px;

  .netview {
    .net-loading {
      position: relative;
      top: -24px;
    }
    .view-icon {
      display: inline-block;
      height: 36px;
      line-height: 36px;
      overflow: hidden;
      i {
        height: 36px;
        line-height: 36px;
        font-size: 100px;
        color: $--color-text-regular;
      }
    }
    strong {
      display: block;
    }
    .line {
      padding-bottom: 45px;
      border-top: 1px solid $theme;
      &.dotted {
        border-top-style: dotted;
      }
      &.warning {
        border-top-color: $--color-warning;
      }
    }
    .caption {
      display: inline-block;
      // background: $box-bgc;
      line-height: 25px;
      height: 25px;
      margin: 0 auto;
      min-width: 56px;
      border-radius: $--border-radius-base;
    }
    .w-auto {
      width: auto;
    }
    .mw260 {
      min-width: 260px;
    }
    i.rjucd-apac {
      margin: 0 -12px;
    }
    @media only screen and (max-width: 992px) {
      i.rjucd-apac {
        margin: 0;
      }
      .md-hide {
        display: none;
      }
      .mw260 {
        min-width: auto;
      }
    }
  }
  &.is-macc {
    background-color: $app-bg-color;
    border-radius: 5px;
  }
}
</style>
