<template>
  <div class="vpn-security-union">
    <help-alert json-key="vpnUnionJson" title="IPSec连接列表"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          IPSec连接列表
          <small></small>
        </span>
        <div class="fr">
          <el-button @click.native="_onRefresh" size="small" type="primary">
            <i class="el-icon-refresh"></i>
            <span>刷新</span>
          </el-button>
        </div>
      </div>
      <el-table :data="list" ref="baseTable" size="mini" stripe>
        <el-table-column align="center" label="名称" prop="name"></el-table-column>
        <el-table-column align="center" label="SPI" prop="spi"></el-table-column>
        <el-table-column align="center" label="方向" prop="direction"></el-table-column>
        <el-table-column align="center" label="隧道两端" prop="tunnel"></el-table-column>
        <el-table-column align="center" label="数据流" prop="flows" width="250px"></el-table-column>
        <el-table-column align="center" label="状态" prop="status">
          <template slot-scope="{row}">
            <span class="c-success" type="text" v-if="!row.reason.trim()">正常</span>
            <span class="c-warning" type="text" v-else>
              异常
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">{{row.reason}}</div>
                <span>
                  <i class="el-icon-question"></i>
                </span>
              </el-tooltip>
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="安全协议" prop="encapsule"></el-table-column>
        <el-table-column align="center" label="AH验证算法" prop="ah_auth_alg"></el-table-column>
        <el-table-column align="center" label="ESP验证算法" prop="esp_auth_alg"></el-table-column>
        <el-table-column align="center" label="ESP加密算法" prop="encapsule_alg"></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'vpn-security-union',
  data() {
    return {
      list: []
    }
  },
  created() {
    this._initPage()
  },
  methods: {
    async _initPage() {
      const _res = await this.$api.getIpSecSa()
      this.list = _res.data || []
    },
    _onRefresh() {
      this._initPage()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
