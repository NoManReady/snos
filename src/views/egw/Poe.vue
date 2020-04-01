<template>
  <div class="poe">
    <help-alert :title="$t('egw.poe_power_supply')" json-key></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('egw.poe_power_consumption_details')}}</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="data-box">
            <span class="data-box--tit">{{$t('egw.bigest_consumption')}}</span>
            <span class="data-box--val">{{info.totalPower}}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="data-box">
            <span class="data-box--tit">
              {{$t('egw.consumption_now')}}
              <el-tooltip placement="top">
                <div slot="content">{{$t('egw.power_supply_error_tip')}}</div>
                <span class="c-warning" v-show="info.workStatus === 'Overload'">
                  <div slot="content">
                    <i18n path="egw.overload">
                      <i class="el-icon-info ml5 c-warning"></i>
                    </i18n>
                  </div>
                </span>
              </el-tooltip>
            </span>
            <span :class="{'c-warning': info.workStatus === 'Overload'}" class="data-box--val">{{info.totalConsumptionPower}}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="data-box">
            <span class="data-box--tit">{{$t('egw.remaining_power_consumption')}}</span>
            <span class="data-box--val">{{info.totalRemainPower}}</span>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('egw.poe_dev_tab')}}</span>
      </div>
      <div class="mb20">
        <div class="port-wrap vm">
          <i class="rjucd-upport on"></i>
          <span>{{$t('egw.power_supply')}}</span>
        </div>
        <div class="port-wrap vm ml20">
          <i class="rjucd-upport off"></i>
          <span>{{$t('egw.no_power_supply')}}</span>
        </div>
      </div>
      <div class="port-box">
        <div class="tip">{{$t('egw.consumption_now_f')}}</div>
        <port :key="p.portNum" :port="p" v-for="p in info.portInfo">
          <template slot="top" slot-scope="scope">{{scope.port.power}}</template>
          <template slot="bottom" slot-scope="scope">{{scope.port.portNum}}</template>
        </port>
      </div>
    </div>
  </div>
</template>
<script>
import Port from '@/common/Port'
import timer from '@/utils/timer'
export default {
  name: 'Poe',
  data() {
    return {
      info: {
        totalConsumptionPower: '-W',
        workStatus: 'Normal',
        totalPower: '-W',
        totalRemainPower: '-W',
        portInfo: [
          // {
          //   current: '0mA',
          //   power: '0.0W',
          //   class: 'Unknown',
          //   maxPower: '30W',
          //   portNum: 0,
          //   status: 'off',
          //   priority: 0,
          //   control: 'disable',
          //   voltage: '0.0V'
          // }
        ]
      }
    }
  },
  components: {
    Port
  },
  beforeDestroy() {
    timer.clean()
  },
  created() {
    this._loadPoePort()
  },
  methods: {
    // 加载POE供电状态
    async _loadPoePort(isSilence) {
      let _poeInfo = await this.$api.getPoeStatus(isSilence)
      let _info = _poeInfo.data[0]

      let _list = (_info.portInfo || []).map(port => {
        return Object.assign({}, port, {
          _status: port.status == 'on' ? 'on-on' : 'off-off'
        })
      })
      _info.portInfo = Object.freeze(_list)
      this.info = _info

      timer.setTimeout(() => {
        this._loadPoePort(true)
      }, 5000)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.poe {
  .port-wrap {
    > i {
      padding: 4px;
      background: #eee;
      border-radius: $--border-radius-base;
      font-size: 30px;
      vertical-align: middle;
      display: inline-block;
    }
    > span {
      margin-left: 5px;
    }
  }
  .port-box {
    min-width: 480px;
    padding: 20px 10px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: $--border-radius-base;
    .tip {
      display: inline-block;
      vertical-align: top;
      font-size: 13px;
      line-height: 2;
    }
  }
  @media screen and (max-width: 980px) {
    .port-wrap > i {
      font-size: 26px;
    }
  }
  @media screen and (max-width: 768px) {
    .port-wrap > i {
      font-size: 24px;
    }
  }
}
</style>
