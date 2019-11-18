<template>
  <div class="switch-mactable" v-loading="isLoading">
    <div class="clearfix mb10">
      <span class="c-warning">显示前100条MAC信息。</span>
      <el-button @click.native="_clear" class="fr mr20" size="mini" type="primary">清除</el-button>
    </div>
    <el-table :data="macList" :max-height="250" align="center" border header-align="center" size="mini" style="width: 100%">
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="{$index}">{{$index+1}}</template>
      </el-table-column>
      <el-table-column align="center" label="MAC地址" prop="mac"></el-table-column>
      <el-table-column align="center" label="VLAN ID" prop="vid" v-if="vmode==='1'"></el-table-column>
      <el-table-column align="center" label="端口">
        <template slot-scope="{row}">端口{{+row.port+1}}</template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'switch-mactable',
  data() {
    return {
      macList: []
    }
  },
  computed: {
    ...mapGetters('switch', ['item', 'vmode'])
  },
  created() {
    this._load()
  },
  methods: {
    // 加载mac table数据
    async _load() {
      this.isLoading = true
      let _result = await this.$api.switchApi(
        'doSwitchApi',
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: 'get',
          url: 'mac.cgi?page=fwd_tbl_json'
        },
        { isSilence: true }
      )
      this.isLoading = false
      this.macList = _result
    },
    // 清除
    async _clear() {
      await this.$api.switchApi('doSwitchApi', {
        ip: this.item.ip,
        sn: this.item.devSN,
        method: 'post',
        url: 'mac.cgi?cmd=macclear'
      })
      this.$message({
        type: 'success',
        message: '清除成功'
      })
      this._load()
    }
  }
}
</script>
<style lang="scss" scoped>
.switch-mactable {
  min-height: 100px;
  /deep/ .el-card__body {
    padding: 5px;
  }
}
</style>
