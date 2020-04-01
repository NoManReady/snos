<template>
  <div class="wds-wifi-scan vm">
    <el-popover @show="_onPopoverShow" placement="right-start" ref="scanAp" trigger="click" v-model="showScanPopover">
      <div class="clearfix mb10 pb10 w500" style="border-bottom:1px solid #eee;">
        <h3 class="c-success mb10">
          <span class="vm">
            {{$t('ehr.repeaterScan.close_over')}}
            <strong class="c-danger">{{radio.replace('24G', '2.4G')}}</strong>
            {{$t('ehr.repeaterScan.wifi_list')}}
            <a class="c-warning">{{$t('ehr.repeaterScan.click_to_bigger')}}</a>
          </span>
          <el-button @click.native="showScanPopover=false" class="fr c-info vm fs18 scan-close" type="text">
            <i class="el-icon-close"></i>
          </el-button>
        </h3>
        <el-input :placeholder="$t('ehr.repeaterScan.wifi_filter')" class="vm w160" size="mini" v-model="filterValue"></el-input>
        <el-select @change="onScanAp" class="vm w100" size="mini" v-model="radio">
          <el-option label="5G" value="5G"></el-option>
          <el-option label="2.4G" value="24G"></el-option>
        </el-select>
        <el-button
          :disabled="scanning"
          @click.native="onScanAp"
          class="vm"
          size="mini"
          type="primary"
        >{{$t('ehr.repeaterScan.next_scan')}}</el-button>
      </div>
      <div
        :element-loading-text="$t('ehr.repeaterScan.scanning')"
        :empty-text="emptyText"
        class="pos-r ssid-container"
        element-loading-background="rgba(218, 245, 243, .1)"
        element-loading-spinner="el-icon-loading"
        ref="ssidContainer"
        style="height:350px;overflow:hidden;overflow-y:auto;"
        v-loading="scanning"
      >
        <el-table
          :data="apList"
          :row-class-name="rowClassName"
          @row-click="onItemClick"
          size="small"
          stripe
          v-show="apList.length>0"
        >
          <el-table-column :label="$t('ehr.repeaterScan.wifi_name')" align="center" prop="ssid" width="120px"></el-table-column>
          <el-table-column :label="$t('ehr.repeaterScan.bssid')" align="center" prop="bssid" width="120px"></el-table-column>
          <el-table-column :label="$t('ehr.repeaterScan.auth_mode')" align="center" prop="authMode" width="85px"></el-table-column>
          <el-table-column :label="$t('devlist.channel')" align="center" prop="channel" width="75px"></el-table-column>
          <el-table-column :formatter="formateRssi" :label="$t('ehr.repeaterScan.rssi')" align="center" prop="rssi" width="100px"></el-table-column>
        </el-table>
        <span class="nodata-tip" v-show="apList.length===0&&!scanning">{{$t('ehr.repeaterScan.next_scan_please')}}</span>
      </div>
    </el-popover>
    <div v-popover:scanAp>
      <slot name="title">{{$t('ehr.repeaterScan.scan')}}</slot>
    </div>
  </div>
</template>
<script>
import { scrollTop } from '@/utils/utils'
export default {
  name: 'repeater-scan',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showScanPopover: false,
      filterValue: '',
      radio: '5G',
      scanning: false,
      AP_LIST: []
    }
  },
  computed: {
    emptyText() {
      return this.scanning ? ' ' : this.$t('ehr.repeaterScan.no_wifi')
    },
    apList() {
      return Object.freeze(
        this.AP_LIST.filter(ap => ap.ssid.includes(this.filterValue))
      )
    }
  },
  watch: {
    showScanPopover(v) {
      this.filterValue = ''
      if (this.AP_LIST.length === 0 && v) {
        this._repeaterScan()
      }
    }
  },
  methods: {
    // 扫描附件的Wi-Fi
    async _repeaterScan() {
      this.scanning = true
      let _result = await this.$api.cmd(
        'devSta.get',
        {
          module: 'repeater_scan',
          data: { radio: this.radio }
        },
        { isSilence: true, timeout: 0 }
      )
      if (_result) {
        this.AP_LIST = _result.apList || []
        this._onPopoverShow()
      }
      this.$nextTick().then(() => {
        this.scanning = false
      })
    },
    formateRssi(row, col, val, idex) {
      if (val > -60) {
        return `${val} dBm 强`
      } else if (val > -70) {
        return `${val} dBm 中`
      } else {
        // if (val <= -70) {
        return `${val} dBm 弱`
      }
    },
    // 主动扫描
    onScanAp() {
      // this.filterValue = ''
      this._repeaterScan()
    },
    // 点击事件
    onItemClick(row) {
      this.$emit('input', row.ssid)
      this.$emit('select', Object.assign({ radio: this.radio }, row))
      this.showScanPopover = false
    },
    // 列表样式
    rowClassName({ row }) {
      return this.value === row.ssid ? 'f-theme pointer' : 'pointer'
    },
    // 扫描打开事件
    _onPopoverShow() {
      let _ssidRef = this.$refs.ssidContainer
      if (_ssidRef && this.apList.length) {
        this.$nextTick(() => {
          let _expand = document.querySelector('tr.f-theme')
          // console.log(_expand.offsetTop)
          if (_expand) {
            scrollTop(_ssidRef, 0, _expand.offsetTop)
          }
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
