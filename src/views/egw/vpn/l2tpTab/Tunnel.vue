<template>
  <div class="vpn-l2tp-tunnel">
    <help-alert json-key="vpnL2tpTunnelJson" title="隧道信息列表"></help-alert>
    <el-table :data="list" ref="baseTable" size="mini" stripe>
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column align="center" label="用户名" prop="username"></el-table-column>
      <el-table-column align="center" label="服务器/客户端" prop="type">
        <template slot-scope="scope">{{scope.row.type === 'client' ? '客户端' : '服务端'}}</template>
      </el-table-column>
      <el-table-column align="center" label="隧道名称" prop="tunnelname"></el-table-column>
      <el-table-column align="center" label="虚拟本地IP" prop="localIp"></el-table-column>
      <el-table-column align="center" label="接入服务IP" prop="lns"></el-table-column>
      <el-table-column align="center" label="对端虚拟IP" prop="remoteIp"></el-table-column>
      <el-table-column align="center" label="DNS" prop="DNS"></el-table-column>
      <!-- <el-table-column prop="enable" label="在线状态" align="center">
        <template slot-scope="scope">
          <span v-show="scope.row.enable==='true'">在线</span>
          <span v-show="scope.row.enable==='false'">离线</span>
        </template>
      </el-table-column>-->
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'vpn-l2tp-tunnel',
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
      let _res = await this.$api.getL2tpChannel()
      this.list = _res.list || []
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
