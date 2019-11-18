<template>
  <div class="switch-dhcpsnooping" style="min-height:auto;">
    <!-- dhcp snooping -->
    <el-popover placement="top" ref="dhcpPopover" trigger="click" v-model="dhcpPopover" width="260">
      <p class="c-warning mb10">
        <i class="el-icon-warning"></i>
        <span>是否确认{{dhcpmode==='1'?'关闭':'开启'}}DHCP Snooping？</span>
      </p>
      <div class="tr">
        <el-button @click.native="dhcpPopover = false" class="c-info" size="mini" type="text">取消</el-button>
        <el-button @click.native="_handleDhcpMode" size="mini" type="text">确定</el-button>
      </div>
    </el-popover>
    <el-form label-width="auto" ref="baseForm" size="mini">
      <el-form-item label="DHCP Snooping 开关：">
        <el-switch :value="dhcpmode" active-value="1" inactive-value="0" v-popover:dhcpPopover v-show="dhcpmode&&dhcpmode!=='-1'"></el-switch>
        <div v-show="dhcpmode===''">
          <i class="el-icon-loading fs14" v-if="dhcpmode!=='-1'"></i>
          <el-button @click.native="_loadDhcpMode" class="c-danger" size="mini" type="text" v-else>重新加载</el-button>
        </div>
      </el-form-item>
      <template v-if="dhcpmode==='1'">
        <el-form-item label="信任口：">
          <el-checkbox :indeterminate="halfChecked" @change="_handleCheckAll" v-model="checkAll">全选</el-checkbox>
          <el-checkbox-group v-model="portids">
            <el-checkbox :key="port.value" :label="port.value" v-for="port in portsOptions">{{port.label}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button @click.native="_onSubmitDhcp" type="primary">保存</el-button>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'switch-dhcpsnooping',
  data() {
    return {
      dhcpmode: '',
      portids: [],
      halfChecked: false,
      checkAll: false,
      dhcpPopover: false
    }
  },
  created() {
    this._loadDhcpMode()
  },
  computed: {
    ...mapGetters('switch', ['item', 'portInfoList']),
    portsOptions() {
      return this.portInfoList.map((item, i) => {
        return {
          label: `端口${i + 1}`,
          value: i.toString()
        }
      })
    }
  },
  watch: {
    portids(v) {
      let _cnt = v.length
      this.checkAll = _cnt === this.portsOptions.length
      this.halfChecked = _cnt > 0 && _cnt < this.portsOptions.length
    },
    dhcpmode(v) {
      if (v === '1') {
        this._loadDhcpPort()
      }
    }
  },
  methods: {
    // 全选、反选
    _handleCheckAll(val) {
      this.portids = val ? this.portsOptions.map(p => p.value) : []
    },
    // dhcp 模式获取
    async _loadDhcpMode() {
      try {
        let _result = await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'get',
            url: 'rest_get_dhcpsnoop_enable.cgi'
          },
          { isSilence: true }
        )
        this.dhcpmode = _result.enable
      } catch (error) {
        this.dhcpmode = '-1'
      }
    },
    // dhcp 模式配置
    async _handleDhcpMode() {
      this.dhcpPopover = false
      let data = {}
      if (this.dhcpmode === '0') {
        data.enable = '1'
      } else {
        data.enable = '0'
      }
      try {
        this.dhcpmode = ''
        await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            url: 'dhcpsnoop.cgi?cmd=set_state',
            data
          },
          { isSilence: true }
        )
        this.dhcpmode = data.enable || '0'
        this.$message({
          type: 'success',
          message: 'DHCP Snooping切换成功'
        })
      } catch (error) {
        this.dhcpmode = data.enable === '1' ? '0' : '1'
      }
    },
    // dhcp 端口获取
    async _loadDhcpPort() {
      try {
        let _result = await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'get',
            url: 'rest_get_dhcpsnoop_ports.cgi'
          },
          { isSilence: true }
        )
        this.portids = _result || []
      } catch (error) {
        this.$message({
          type: 'error',
          message: '信任口获取失败'
        })
      }
    },
    // dhcp 端口配置
    async _onSubmitDhcp() {
      try {
        await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            url: 'dhcpsnoop.cgi?cmd=set_ports',
            data: { portid: this.portids }
          },
          { isSilence: true }
        )
        this.$message({
          type: 'success',
          message: '配置成功'
        })
      } catch (error) {}
    }
  }
}
</script>
<style lang="scss" scoped>
.switch-dhcpsnooping {
  min-height: 200px;
}
</style>
