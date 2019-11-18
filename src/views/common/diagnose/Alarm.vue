<template>
  <div class="diagnose-alarm">
    <help-alert json-key title="故障告警">
      <div slot="content">您可以在本页面查看故障告警信息，删除或取消关注某类告警等。</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          故障告警列表
          <small></small>
        </span>
        <div class="fr">
          <el-button @click="showUnFocus" size="small" type="primary">
            <i class="eweb-config"></i>
            <span>{{unFocusText}}</span>
          </el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="table" size="small" stripe>
        <el-table-column align="center" label="展开" type="expand" v-if="!isNotMaster">
          <template slot-scope="{row}">
            <el-table :data="row.detail" class="table-expand" size="small" tooltip-effect="light">
              <el-table-column align="center" label="设备名" show-overflow-tooltip width="150">
                <template slot-scope="{row}">{{snMap[row.sn] && snMap[row.sn].nm || localDev[`${row.sn}_nm`] || `-`}}</template>
              </el-table-column>
              <el-table-column align="center" label="设备序列号" prop="sn" width="130"></el-table-column>
              <el-table-column align="center" label="设备类型" width="100">
                <template slot-scope="{row}">{{snMap[row.sn] && snMap[row.sn].dt || localDev[`${row.sn}_dt`] || `-`}}</template>
              </el-table-column>
              <el-table-column align="center" label="告警时间" width="165">
                <template slot-scope="{row}">{{new Date(Number(row.time*1000)).toLocaleString()}}</template>
              </el-table-column>
              <el-table-column align="left" label="告警详情" min-width="200" show-overflow-tooltip>
                <template slot-scope="{row}">{{row.msg}}</template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column align="left" label="告警信息" min-width="160" prop="msg">
          <template slot-scope="{row}">
            <span class="c-warning">{{alarmMap[row.id].msg || `${row.id}'(查询不到告警信息)'`}}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="建议" min-width="220" prop="suggest">
          <template slot-scope="{row}">
            <span>{{alarmMap[row.id].suggest || `${row.id}'(查询不到建议信息)'`}}</span>
          </template>
        </el-table-column>
        <template v-if="isNotMaster">
          <el-table-column align="center" label="告警时间" min-width="160">
            <template slot-scope="{row}">{{new Date(Number(row.detail[0].time*1000)).toLocaleString()}}</template>
          </el-table-column>
          <el-table-column align="left" label="告警详情" min-width="200">
            <template slot-scope="{row}">{{row.detail[0].msg || '-'}}</template>
          </el-table-column>
        </template>

        <el-table-column align="center" label="操作" min-width="140">
          <template slot-scope="scope">
            <el-button @click="onDel(scope.row.id, scope.$index)" class="c-success" type="text">删除</el-button>
            <el-button @click="onDisableAlarmUpload(scope.row.id, scope.$index)" type="text">取消关注</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.pageIndex"
        :page-size="pageModel.pageSize"
        :page-sizes="pageModel.pageSizes"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="_onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>

      <!-- 查看取消关注的告警 -->
      <el-dialog :title="unFocusText" :visible.sync="isModalShow" width="700px">
        <div class="clearfix">
          <el-card :key="id" class="w200 fl mb5 mr5" v-for="id in alarmUpload.id">
            <div class="clearfix" v-if="typeof alarmMap[id] === 'object'">
              <div>{{alarmMap[id].msg}}</div>
              <div>
                <el-button @click="onEnableAlarmUpload(id)" class="fr" type="text">重新关注</el-button>
              </div>
            </div>
          </el-card>
        </div>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false">取 消</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { Card } from 'element-ui'
import pageMixins from '@/mixins/pageMixins'

export default {
  name: 'DiagnoseAlarm',
  data() {
    return {
      unFocusText: '查看“取消关注”的告警',
      isModalShow: false,
      alarmMap: false,
      snMap: false,
      alarmUpload: {
        enable: '0',
        serverUrl: '',
        id: []
      } /* ,
      mocklist: [
        {
          id: '41',
          detail: [
            {
              sn: 'G1LQ76K022185',
              time: '1561510572',
              msg: '分配不到地址'
            }
          ]
        },
        {
          id: '42',
          detail: [
            {
              sn: 'H1MQ3W9000474',
              time: '1561030570',
              msg: '协商速率5M'
            },
            {
              sn: 'MACC522376524',
              time: '1559030572',
              msg: '最近协商速率8M'
            }
          ]
        }
      ] */
    }
  },
  mixins: [pageMixins],
  components: {
    [Card.name]: Card
  },
  computed: {
    isNotMaster() {
      let _roles = this.$roles()
      return _roles.includes('slave') || _roles.includes('alone')
    },
    localDev() {
      let sys = this.$store.getters.sysinfo
      return {
        [`${sys.serial_num}_nm`]: '本机',
        [`${sys.serial_num}_dt`]: sys.model
      }
    }
  },
  methods: {
    async _loadList() {
      if (!this.snMap) {
        await this._getApListLite()
      }
      if (!this.alarmMap) {
        await this._getAlarmMap()
        this._getAlarmUpload()
      }

      let _result = await this.$api.getAlarm()
      return (_result.list || []).filter(o => !!this.alarmMap[o.id]) // 过滤掉map中找不到的告警
    },
    async _getApListLite() {
      let _res = await this.$api.getAplistLite({
        status: 'ON',
        productType: 'EAP'
      })
      let _map = {}
      ;(_res.list || []).forEach(o => {
        _map[o.sn] = o
      })
      this.snMap = _map
    },
    async _getAlarmMap() {
      let _result = await this.$api.getAlarmMap()
      let _map = {}
      ;(_result.list || []).forEach(o => {
        _map[o.id] = o
      })
      this.alarmMap = _map
    },
    async _getAlarmUpload() {
      let _result = await this.$api.getAlarmUpload()
      _result.id.filter(id => typeof this.alarmMap[id] === 'object')
      this.alarmUpload = _result
    },
    // 删除
    async onDel(id, idx) {
      await this.$confirm(
        `<ul class="c-info alarm-tip ml15 mb10">
          <li>若您是<strong>不想关注</strong>此类告警，请点击右侧【<span class="c-success">取消关注</span>】按钮。</li>
          <li><strong>未解决的告警</strong>若手动删除，一段时间后会<strong>再出现</strong>此类告警。</li>
          <li><strong>已解决的告警</strong>可手动删除，或一段时间内未再发现此告警，系统也会<strong>自动删除</strong>。</li>
        </ul>`,
        '将此条告警从告警列表中删除？',
        {
          dangerouslyUseHTMLString: true
        }
      )
      await this.$api.delAlarm(id)
      this.removeList(idx)
      this.$message.info('删除成功')
    },
    // 取消关注
    async onDisableAlarmUpload(id, idx) {
      await this.$confirm(
        `<ul class="c-info alarm-tip ml15 mb10">
          <li>取消关注后，系统将<strong>不再出现此类告警信息</strong>。</li>
          <li>点击右上方【<span class="c-success">${this.unFocusText}</span>】按钮，可<strong>重新关注</strong>“已取消关注”的告警。</li>
        </ul>`,
        '将取消关注此类告警并从告警列表中删除？',
        {
          dangerouslyUseHTMLString: true
        }
      )
      this.alarmUpload.id.push(id)
      await this.$api.updateAlarmUpload(this.alarmUpload)
      this.removeList(idx)
      this.$message.info('取消关注成功')
    },
    // 重新关注
    async onEnableAlarmUpload(id) {
      await this.$confirm(
        `<ul class="c-info alarm-tip ml15 mb10">
          <li>重新关注后，系统将<strong>出现此类告警信息</strong>。</li>
          <li>点击告警列表右侧【<span class="c-success">取消关注</span>】按钮，可<strong>取消关注</strong>告警。</li>
        </ul>`,
        '将重新关注此类告警并？',
        {
          dangerouslyUseHTMLString: true
        }
      )
      this.alarmUpload.id = this.alarmUpload.id.filter(i => i !== id)
      await this.$api.updateAlarmUpload(this.alarmUpload)
      this.$message.info('重新关注成功')
      this.showUnFocus()
    },
    showUnFocus() {
      if (this.alarmUpload.id.length === 0) {
        this.isModalShow = false
        return this.$message.info(
          '当前关注了所有的告警，可点击列表中【取消关注】按钮，添加不关注的告警。'
        )
      }
      this.isModalShow = true
    }
  }
}
</script>
<style lang="scss">
.alarm-tip li {
  list-style: decimal;
}
.diagnose-alarm {
  .el-table__expanded-cell[class*='cell'] {
    padding: 0 5px;
  }
}
</style>
