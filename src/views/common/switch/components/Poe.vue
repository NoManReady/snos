<template>
  <div class="switch-poe" v-loading="isLoading">
    <el-row :gutter="10" class="mb20">
      <el-col :span="6">
        <el-card class="tc" shadow="hover">
          <h3>
            <b>总功率</b>
          </h3>
          <span>
            <b class="c-success fs18">{{poeInfo.maxp}}</b>W
          </span>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="tc" shadow="hover">
          <h3>
            <b>使用功率</b>
          </h3>
          <span>
            <b class="c-success fs18">{{poeInfo.usedp}}</b>W
          </span>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="tc" shadow="hover">
          <h3>
            <b>剩余功率</b>
          </h3>
          <span>
            <b class="c-success fs18">{{poeInfo.remap}}</b>W
          </span>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="tc" shadow="hover">
          <h3>
            <b>工作情况</b>
          </h3>
          <span>
            <b class="c-success fs18" v-show="poeInfo.works===0">正常</b>
            <b class="c-warning fs18" v-show="poeInfo.works===1">过载</b>
            <b class="c-danger fs18" v-show="poeInfo.works===2">异常</b>
          </span>
        </el-card>
      </el-col>
    </el-row>
    <el-table
      :data="poeInfo.list"
      :max-height="250"
      align="center"
      border
      header-align="center"
      ref="vlanTable"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" fixed label="POE开关">
        <template slot-scope="{row}">
          <el-switch
            :value="row.enable"
            @click.native="_togglePoeEnable(row)"
            active-value="1"
            inactive-value="0"
            v-popover:poePopover
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="端口" width="80">
        <template slot-scope="{row}">端口{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column align="center" label="供电状态" prop="status" sortable width="100">
        <template slot-scope="{row}">
          <span v-if="row.status==='0'">未上电</span>
          <span class="c-success" v-else>
            <template v-if="row.fault==='0'">已上电</template>
            <template v-else-if="row.fault==='1'">因电流过大而无法供电</template>
            <template v-else-if="row.fault==='2'">因功率过大而无法供电</template>
            <template v-else-if="row.fault==='3'">因出现短路而无法供电</template>
            <template v-else-if="row.fault==='4'">因温度过高而无法供电</template>
            <template v-else-if="row.fault==='5'">因整机功率不足而无法供</template>
            <template v-else-if="row.fault==='6'">无法供电</template>
            <template v-else-if="row.fault==='6'">因电压过大而无法供电</template>
            <template v-else>无法供电</template>
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="功率（W）" prop="power" width="100"></el-table-column>
      <el-table-column align="center" label="电流（mA）" prop="voltage" width="100"></el-table-column>
      <el-table-column align="center" label="电压（V）" prop="current" width="100"></el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="100">
        <template slot-scope="{row}">
          <el-button :disabled="row.voltage===0" @click.native="_onReUp(row)" size="mini" type="text" v-if="!row.loading">
            <small>重新上电</small>
          </el-button>
          <i class="el-icon-loading c-success" v-else></i>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { Row, Col, Card } from 'element-ui'
import { mapGetters } from 'vuex'
export default {
  name: 'switch-poe',
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    [Card.name]: Card
  },
  data() {
    return {
      poeInfo: {
        list: [],
        maxp: 0,
        remap: 0,
        usedp: 0,
        works: 0
      },
      poePopover: false,
      isLoading: false,
      editRow: null
    }
  },
  computed: {
    ...mapGetters('switch', ['item'])
  },
  created() {
    this._load()
  },
  methods: {
    // 加载poe信息数据
    async _load() {
      this.isLoading = true
      let _result = await this.$api.switchApi(
        'doSwitchApi',
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: 'get',
          url: 'rest_get_poe_info.cgi'
        },
        { isSilence: true }
      )
      _result.list = _result.list.map(lis => {
        let power = this._getDigetByCnt(lis.power, 1)
        let current = this._getDigetByCnt(lis.current, 1)
        return { ...lis, loading: false, power, current, voltage: +lis.voltage }
      })
      _result.maxp = this._getDigetByCnt(_result.maxp || 0, 1)
      _result.remap = this._getDigetByCnt(_result.remap || 0, 1)
      _result.usedp = this._getDigetByCnt(_result.usedp || 0, 1)
      _result.works = +_result.works || 0
      this.isLoading = false
      this.poeInfo = _result
    },
    // 保留小数点
    _getDigetByCnt(val, cnt) {
      val = +val || 0
      return parseInt(val / Math.pow(10, 3 - cnt)) / Math.pow(10, cnt)
    },
    // 切换poe使能
    async _togglePoeEnable(row) {
      let _oldEnable = row.enable
      let _newEnable = _oldEnable === '1' ? '0' : '1'
      await this.$msgbox({
        dangerouslyUseHTMLString: true,
        message: `是否${_newEnable === '1' ? '开启' : '关闭'}(端口${+row.port +
          1})POE功能`,
        showCancelButton: true,
        type: 'warning',
        title: '提示'
      })
      await this._handlePoeEnable(row.port, _newEnable)
      this.$set(row, 'enable', _newEnable)
    },
    // 重新上电
    async _onReUp(row) {
      this.$set(row, 'loading', true)
      await this.$api.switchApi(
        'doSwitchApi',
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: 'post',
          data: {
            portid: row.port
          },
          url: 'home.cgi?cmd=poe_restart'
        },
        { isSilence: true }
      )
      this.$message({
        type: 'success',
        message: '操作成功'
      })
      setTimeout(() => {
        this.$set(row, 'loading', false)
      }, 500)
    },
    // poe使能
    async _handlePoeEnable(portid, enable) {
      await this.$api.switchApi('doSwitchApi', {
        ip: this.item.ip,
        sn: this.item.devSN,
        method: 'post',
        data: {
          portid: portid,
          mode: enable
        },
        url: 'poe.cgi'
      })
      this.$message({
        type: 'success',
        message: '切换成功'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.switch-poe {
  min-height: 250px;
  /deep/ .el-card__body {
    padding: 5px;
  }
}
</style>
