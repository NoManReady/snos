<template>
  <div :class="{'is-macc': isMacc}" class="overview-netview mb50">
    <el-row :gutter="0" align="middle" justify="center" type="flex">
      <el-col class="c-info tl">
        <strong class="fs16">共发现 {{total}} 台设备</strong>
      </el-col>
      <el-col class="tr">
        <el-button @click="_loadData" class="fs16" type="text">
          刷新
          <i :class="loading ? 'el-icon-loading' : 'el-icon-refresh'" class="c-success"></i>
        </el-button>
      </el-col>
    </el-row>
    <div class="block is-macc">
      <el-row>
        <el-col :span="13" class="pl50">
          <el-row align="middle" class="netview tc" justify="center" type="flex">
            <el-col :span="24">
              <div v-popover:ipinfoPopover>
                <div class="vm">
                  <!-- <i :class="netStatus.connnected==='true' ? 'c-success' : 'c-warning'" class="rjucd-network"></i> -->
                  <img :src="require('@/assets/earth.png')" class="view-icon" />
                </div>
                <strong>{{ isEgRouter ? wanProto : '-' }}</strong>
                <span class="caption">互联网</span>
              </div>
            </el-col>
          </el-row>
          <el-row align="middle" class="netview tc" justify="center" type="flex">
            <el-col :span="24">
              <i class="el-icon-loading c-success net-loading fs18 mg10" v-if="netStatus.connnected === ''"></i>
              <div :class="netStatus.connnected==='false' ? 'warning' : ''" class="line" v-else v-popover:netStatusPopover></div>
              <el-popover placement="top" ref="netStatusPopover" trigger="hover" v-if="netStatus.connnected==='false'">
                <span>{{netStatus.message || '联网异常'}}</span>
              </el-popover>
            </el-col>
          </el-row>
          <el-row align="middle" class="netview tc" justify="center" type="flex">
            <el-col :span="24" class="w-auto border">
              <div>
                <div class="view-icon vm">
                  <i :data-icon="egRouter" class="rjucd-device icon-inner"></i>
                </div>
              </div>
              <strong>{{egInfo ? '1' : '0'}}</strong>
              <span class="caption w60">{{egRouter}}</span>
            </el-col>
          </el-row>
          <template v-if="swList.length > 0 || isMsw">
            <el-row align="middle" class="netview tc" justify="center" type="flex">
              <el-col :span="24">
                <div class="line"></div>
              </el-col>
            </el-row>
            <el-row align="middle" class="netview tc" justify="center" type="flex">
              <el-col :span="24" class="w-auto border">
                <div :class="{'pointer': !isMacc}" @click="_onToPath('admin/switch_list')">
                  <div class="view-icon vm">
                    <i :data-icon="$t('nei.switch')" class="rjucd-device icon-inner"></i>
                  </div>
                  <strong>{{swList.length||0}}</strong>
                  <span class="caption">交换机</span>
                </div>
              </el-col>
            </el-row>
          </template>
          <template v-if="!isMsw && apList.length > 0">
            <el-row align="middle" class="netview tc" justify="center" type="flex">
              <el-col :span="24">
                <div class="line"></div>
              </el-col>
            </el-row>
            <el-row align="middle" class="netview tc" justify="center" type="flex">
              <el-col :span="24" class="w-auto border">
                <div :class="{'pointer': !isMacc}" @click="_onToPath('admin/wifi/wifi_ap')">
                  <div class="view-icon vm">
                    <i class="rjucd-apac"></i>
                  </div>
                  <strong>{{ apList.length }}</strong>
                  <span class="caption">
                    <span v-if="hasAc">AP({{apList.length - 1}}) AC(1)</span>
                    <span v-else>AP</span>
                  </span>
                </div>
              </el-col>
            </el-row>
          </template>
          <template v-if="!isMsw && !isMacc">
            <el-row align="middle" class="netview tc" justify="center" type="flex">
              <el-col :lg="2" :md="isEgRouter ? 1 : 2" :span="24">
                <div class="line dotted"></div>
              </el-col>
            </el-row>
            <el-row align="middle" class="netview tc" justify="center" type="flex">
              <el-col :span="24" class="w-auto">
                <div
                  :class="{'pointer border': !isMacc}"
                  @click="_onToPath(hasHomeOnline ? 'admin/home_online' : 'admin/wifi/wifi_sta')"
                >
                  <div class="view-icon vm">
                    <i class="rjucd-user2"></i>
                  </div>
                  <strong>{{userCount||0}}</strong>
                  <span class="caption">{{ hasHomeOnline ? '在线用户' : '无线用户' }}</span>
                </div>
              </el-col>
            </el-row>
          </template>
          <template v-if="isMacc">
            <el-row align="middle" class="netview tc" justify="center" type="flex">
              <el-col :lg="2" :md="isEgRouter ? 1 : 2" :span="24">
                <!-- <div class="line"></div> -->
              </el-col>
            </el-row>
          </template>
        </el-col>
        <el-col :span="11" v-if="isEgRouter">
          <span v-if="ipinfo === false">{{ $t("overview.ip_not_detected") }}</span>
          <div class="ipinfo" v-else>
            <div>
              <label>IP：</label>
              <div class="content">{{ ipinfo.ip }}</div>
            </div>
            <div>
              <label>掩码：</label>
              <div class="content">{{ ipinfo.mask }}</div>
            </div>
            <div>
              <label>网关：</label>
              <div class="content">{{ ipinfo.gateway }}</div>
            </div>
            <div>
              <label>DNS：</label>
              <div class="content">
                <p :key="ip" v-for="ip in ipinfo.dnsList.split(',')">{{ ip }}</p>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="bottom-wrap" v-if="isQuick">
      <license :show.sync="showLicense" @agree="onAgree"></license>
      <el-checkbox v-model="agree">
        <span class="c-info">我已阅读并同意</span>
        <span @click.self.stop="showLicense = true" class="c-success">《终端用户软件许可协议》</span>
      </el-checkbox>
      <auto-upgrade :is-mobile="true"></auto-upgrade>
    </div>
  </div>
</template>
<script>
import AutoUpgrade from '@/views/common/menuout/AutoUpgrade'
import License from './components/License'
import netViewMixins from '@/views/common/overview/components/netViewMixins'
import { saveToSession, loadFromSession } from '@/utils/localStorage'
import { rateTrans } from '@/utils/utils'
let APP_AGREE_LICENSE = 'APP_AGREE_LICENSE'
export default {
  name: 'MNetView',
  props: {
    isQuick: {
      type: Boolean,
      default: false
    }
  },
  components: {
    AutoUpgrade,
    License
  },
  filters: {
    rateTrans
  },
  data() {
    return {
      agree: !loadFromSession(APP_AGREE_LICENSE),
      showLicense: false
    }
  },
  computed: {
    total() {
      let _count = this.apList.length + this.swList.length
      return this.egInfo ? _count + 1 : _count
    }
  },
  mixins: [netViewMixins],
  methods: {
    onAgree(v) {
      this.agree = !this.agree || v
      this.showLicense = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.overview-netview {
  .netview {
    .border {
      border: 1px solid $--color-success;
      border-radius: 8px;
    }
    .net-loading {
      position: relative;
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
      border-left: 2px solid $--color-success;
      width: 1px;
      height: 30px;
      margin: 3px auto;
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
  .is-macc {
    background-color: $app-bg-color;
    border-radius: 5px;
  }
  .ipinfo {
    width: 160px;
    div {
      box-sizing: border-box;
      line-height: 24px;
      > label {
        width: 60px;
        padding-right: 10px;
        text-align: right;
        float: left;
      }
      > .content {
        text-align: left;
        margin-left: 60px;
        position: relative;
      }
    }
  }
  .bottom-wrap {
    position: fixed;
    bottom: 35px;
    left: 10px;
    right: 10px;
    background: #fff;
  }
}
</style>