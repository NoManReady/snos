<template>
  <div class="switch-cable" v-loading="isLoading">
    <div class="clearfix mb10">
      <el-button @click.native="_reCheck" class="fr mr20" size="mini" type="primary">开始检测</el-button>
    </div>
    <el-table :data="cableList" :max-height="250" align="center" border header-align="center" size="mini" style="width: 100%">
      <el-table-column align="center" label="端口" width="80">
        <template slot-scope="{row}">端口{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column align="center" label="检测结果" width="100">
        <template slot-scope="{row}">
          <span class="c-danger" v-if="row.result==='open'">断开</span>
          <span class="c-success" v-else-if="row.result==='normal'">正常</span>
          <!-- <span class="c-danger" v-else-if="row.result==='error'">断开</span> -->
          <span class="c-warning" v-else-if="row.result==='short'">短路</span>
          <span class="c-info" v-else-if="row.result==='nosupport'">不支持</span>
          <span class="c-warning" v-else-if="row.result==='mismatch'">干扰</span>
          <span class="c-info" v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="详细描述">
        <template slot-scope="{row,$index}">
          <span class="c-danger" v-if="row.result==='open'">请检查网线连接情况或更换网线</span>
          <span class="c-success" v-else-if="row.result==='normal'">线缆使用状态良好</span>
          <span class="c-danger" v-else-if="row.result==='error'&&portInfoList[$index].enable===0">端口处于关闭状态，请开启后重新检测</span>
          <span class="c-warning" v-else-if="row.result==='short'">短路</span>
          <span class="c-info" v-else-if="row.result==='nosupport'">不支持</span>
          <span class="c-warning" v-else-if="row.result==='mismatch'">环境或网线质量原因，存在线对串扰，若不影响使用可忽略</span>
          <span class="c-info" v-else>--</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { sleep } from '@/utils'
import fetch from '@/utils/fetch'
export default {
  name: 'switch-cable',
  data() {
    return {
      cableList: [],
      isLoading: false
    }
  },
  computed: {
    ...mapGetters('switch', ['item', 'devBelongType', 'portInfoList'])
  },
  methods: {
    // 加载cable数据
    async _load() {
      this.isLoading = true
      let _result = await this.$api.switchApi(
        'doSwitchApi',
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: 'get',
          url: 'rest_get_port_cable.cgi'
        },
        { isSilence: true }
      )
      this.isLoading = false
      if (this.devBelongType === 'big') {
        _result = _result.slice(0, _result.length - 2)
      }
      this.cableList = _result
    },
    // 检测是否在线
    async _checkOnline() {
      let _result = { isReach: false }
      try {
        _result = await fetch(
          `/api/switch`,
          {
            method: 'ipIsReach',
            params: { ip: this.item.ip }
          },
          { isSilence: true }
        )
      } catch (error) {}
      return _result.isReach
    },
    // 重新检测
    async _reCheck() {
      this.isLoading = true
      try {
        await this.$api.switchApi(
          'doSwitchApi',
          {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            url: 'home.cgi?cmd=check_all_cable'
          },
          { isSilence: true, showError: false, timeout: 3000 }
        )
      } catch (error) {}
      let _isReach = await this._checkOnline()
      while (!_isReach) {
        await sleep(2000)
        _isReach = await this._checkOnline()
      }
      this._load()
    }
  }
}
</script>
<style lang="scss" scoped>
.switch-cable {
  min-height: 250px;
}
</style>
