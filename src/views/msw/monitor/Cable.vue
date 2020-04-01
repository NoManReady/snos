<template>
  <div class="monitor-cable">
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.cable.port_panel')}}</span>
      </div>
      <port-panel :enable="!isLoading" :selecteds.sync="baseModel.lpid" :show-lag="false" mutilple>
        <template #footer-tool>
          <div class="tc mt10">
            <el-button
              :loading="isLoading"
              @click.native="_onBeginDetect"
              class="w160"
              size="medium"
              type="primary"
            >{{isLoading?$t('msw.cable.testing'):$t('msw.cable.begin_test')}}</el-button>
          </div>
        </template>
      </port-panel>
    </div>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.cable.test_result')}}</span>
      </div>
      <el-table :data="cableList" ref="baseTable" size="medium" stripe>
        <el-table-column :label="$t('msw.port')" align="center">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.cable.cable_len')" align="center" prop="len"></el-table-column>
        <el-table-column :label="$t('msw.cable.test_result')" align="center">
          <template slot-scope="{row}">
            <span class="c-info" v-if="row.status===0">{{$t('msw.cable.unope')}}</span>
            <span class="c-success" v-if="row.status===1">{{$t('msw.cable.normal')}}</span>
            <span class="c-info" v-if="row.status===2">{{$t('msw.cable.unsupported')}}</span>
            <span class="c-disabled" v-if="row.status===3">{{$t('msw.cable.unmatched')}}</span>
            <span class="c-warning" v-if="row.status===4">{{$t('msw.cable.short')}}</span>
            <span class="c-warning" v-if="row.status===5">{{$t('msw.cable.open')}}</span>
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
import { sleep, awaitOnLine_plus, waitForActionIfHasUplink } from '@/utils'
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
          message: I18N.t('msw.cable.select_test_port')
        })
        return
      }
      try {
        let _hasUplink = await waitForActionIfHasUplink(
          this.baseModel.lpid,
          'msw.cable.cable_uplink_tip'
        )
        this.isLoading = true
        this.baseModel.uuid = new Date().getTime().toString()
        let _list = await this._triggerTest({ ...this.baseModel }, _hasUplink)

        this.cableList = Object.freeze(
          _list.map(lis => {
            return {
              ...lis,
              ifname: this.piMap[lis.lpid]
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
          this._triggerTest(data, false)
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

