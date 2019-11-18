<template>
  <div class="monitor-cable">
    <!-- <help-alert title="线缆检测"></help-alert> -->
    <div class="box">
      <!-- <div class="box-header">
        <span class="box-header-tit">端口</span>
      </div> -->
      <!-- <el-form :model="baseModel" :rules="baseRules" label-width="100px" ref="baseForm" size="small"> -->
      <!-- <el-form-item class="inline-message" inline-message label="选择端口：" prop="lpid"></el-form-item> -->
      <port-panel :enable="!isLoading" :selecteds.sync="baseModel.lpid" :show-lag="false" mutilple />
      <!-- </el-form> -->
      <div class="tc mt20">
        <el-button :loading="isLoading" @click.native="_onBeginDetect" size="small" type="primary">{{isLoading?'检测中':'开始检测'}}</el-button>
      </div>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">检测结果</span>
      </div>
      <el-table :data="cableList" ref="baseTable" stripe>
        <el-table-column align="center" label="端口">
          <template slot-scope="{row}">
            <span>{{row.interface}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="线缆长度（cm）" prop="len"></el-table-column>
        <el-table-column align="center" label="检测结果">
          <template slot-scope="{row}">
            <span class="c-info" v-if="row.status===0">未操作</span>
            <span class="c-success" v-if="row.status===1">正常</span>
            <span class="c-info" v-if="row.status===2">不匹配</span>
            <span class="c-disabled" v-if="row.status===3">不支持</span>
            <span class="c-warning" v-if="row.status===4">短路</span>
            <span class="c-warning" v-if="row.status===5">断开</span>
            <span class="c-warning" v-if="row.status===6">line drive</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import PortPanel from '@/common/PortPanel'
import { mapGetters } from 'vuex'
import { sleep, awaitOnLine_plus } from '@/utils'
export default {
  name: 'monitor-cable',
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    return {
      cableList: Object.freeze([]),
      isLoading: false,
      baseModel: { lpid: [], uuid: '' }
    }
  },
  computed: {
    ...mapGetters('switcher', ['uplink', 'piMap'])
  },
  methods: {
    // 开始检测
    async _onBeginDetect() {
      if (this.baseModel.lpid.length === 0) {
        this.$message({
          type: 'warning',
          message: '请选择要检测的端口'
        })
        return
      }
      let _hasUplink = this.baseModel.lpid.includes(this.uplink.lpid)
      if (_hasUplink) {
        await this.$confirm(
          `当前检测端口包含上联口【${this.uplink.interface}】，会出现网络连通闪断，是否开始检测？`,
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      }
      this.isLoading = true
      try {
        this.baseModel.uuid = new Date().getTime().toString()
        let _list = await this._triggerTest({ ...this.baseModel }, _hasUplink)

        this.cableList = Object.freeze(
          _list.map(lis => {
            return {
              ...lis,
              interface: this.piMap[lis.lpid]
            }
          })
        )
      } catch (error) {}
      this.isLoading = false
    },
    // 触发检测
    async _triggerTest(data, hasUplink) {
      return new Promise(async (resolve, reject) => {
        if (hasUplink) {
          await awaitOnLine_plus({
            time: 0,
            text: 0,
            maxTry: 10
          })
          resolve(this._triggerTest(data, false))
        } else {
          let _result = await this.$api.cmd(
            'devSta.get',
            {
              module: 'line_detect',
              data: data
            },
            { isSilence: true, timeout: 0 }
          )
          if (_result.res === 21) {
            await sleep(2000)
            resolve(this._triggerTest(data), false)
          }
          resolve(_result.data)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.monitor-cable {
}
</style>

