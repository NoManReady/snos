<template>
  <div class="switch-portstatistics" v-loading="isLoading">
    <el-table :data="portInfoList" :max-height="250" align="center" border header-align="center" size="mini" style="width: 100%">
      <el-table-column align="center" fixed label="端口" width="80">
        <template slot-scope="{row}">端口{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column align="center" fixed label="连接状态" prop="status" sortable width="100">
        <template slot-scope="{row}">
          <span class="c-info" v-if="row.status===0">断开</span>
          <span class="c-success" v-else>连接</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="开关" prop="enable" width="80">
        <template slot-scope="{row}">
          <span class="c-info" v-if="row.enable===0">关闭</span>
          <span class="c-success" v-else>开启</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="收/发速率(kbps)" width="160">
        <template slot-scope="{row}">
          <span class="c-info">{{row.rxSpeed}}/{{row.txSpeed}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="收/发字节数(KB)" width="160">
        <template slot-scope="{row}">
          <span class="c-info">{{row.rxBytes}}/{{row.txBytes}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="收/发包成功数" width="160">
        <template slot-scope="{row}">
          <span class="c-info">{{row.rxGood}}/{{row.txGood}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="收/发包失败数" prop="status" width="100">
        <template slot-scope="{row}">
          <span class="c-info">{{row.rxBad}}/{{row.txBad}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="tc mt10">
      <el-button @click.native="_onClear" size="mini" type="primary">清除</el-button>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'switch-portstatistics',
  data() {
    return {
      isLoading: false
    }
  },
  computed: {
    ...mapGetters('switch', ['portInfoList', 'item'])
  },
  methods: {
    ...mapActions('switch', ['fetchPortInfo']),
    // 清除流量数据
    async _onClear() {
      this.isLoading = true
      try {
        await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            url: 'port.cgi?cmd=clear'
          },
          { isSilence: true }
        )
        await this.fetchPortInfo()
        this.$message({
          message: '清除成功',
          type: 'success'
        })
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>
<style lang="scss" scoped>
.switch-portstatistics {
  min-height: 250px;
}
</style>
