<template>
  <div class="switch-portsetting" v-loading="isLoading">
    <el-form :model="baseModel" :rules="baseRules" class="mb10" label-width="80px" ref="baseForm" size="mini">
      <el-row :gutter="0">
        <el-col :span="12">
          <el-form-item label="端口" prop="portid">
            <treeselect
              :default-expand-level="1"
              :max-height="250"
              :multiple="true"
              :options="portTreeList"
              @click.native="_onTreeSelectClick"
              class="w170"
              placeholder="请选择"
              v-model="baseModel.portid"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开关" prop="state">
            <el-select class="w100" v-model="baseModel.state">
              <el-option label="关闭" value="0"></el-option>
              <el-option label="开启" value="1"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0">
        <el-col :span="12">
          <el-form-item label="速率/双工" prop="speed_duplex">
            <el-select class="w170" ref="speedRef" v-model="baseModel.speed_duplex">
              <el-option label="自协调" value="0"></el-option>
              <el-option :disabled="selectHasFiber" label="10M/半双工" value="1"></el-option>
              <el-option :disabled="selectHasFiber" label="10M/全双工" value="2"></el-option>
              <el-option :disabled="selectHasFiber" label="100M/半双工" value="3"></el-option>
              <el-option :disabled="selectHasFiber" label="100M/全双工" value="4"></el-option>
              <el-option :disabled="dev_9cIsDisabled" label="1000M/全双工" v-if="hasGillionPort" value="5"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="流控" prop="flow">
            <el-select class="w100" v-model="baseModel.flow">
              <el-option label="关" value="0"></el-option>
              <el-option label="开" value="1"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="tc">
        <el-button @click.native="_onSubmit" size="mini" type="primary">保存</el-button>
      </div>
    </el-form>
    <el-table
      :data="portInfoList"
      :max-height="250"
      align="center"
      border
      header-align="center"
      ref="vlanTable"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" label="端口" width="80">
        <template slot-scope="{row}">端口{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column align="center" label="开关" width="60">
        <template slot-scope="{row}">
          <span class="c-info" v-if="row.enable===0">关闭</span>
          <span class="c-success" v-else>开启</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="速率/双工">
        <el-table-column align="center" label="配置状态">
          <template slot-scope="{row}">
            <span>{{dupMap[row.dup_c]}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="实际状态">
          <template slot-scope="{row}">
            <span class="c-info" v-if="row.dup_r===0">{{dupMap[row.dup_r]}}</span>
            <span class="c-success" v-else>{{dupMap[row.dup_r]}}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column align="center" label="流量控制">
        <el-table-column align="center" label="配置状态" width="70">
          <template slot-scope="{row}">
            <span>{{row.fc_c===0?'关闭':'开启'}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="实际状态" width="70">
          <template slot-scope="{row}">
            <span class="c-info" v-if="row.fc_r===0">关闭</span>
            <span class="c-success" v-else>开启</span>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { Row, Col } from 'element-ui'
import Treeselect from '@riophae/vue-treeselect'
import { sleep } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  name: 'switch-portsetting',
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    Treeselect
  },
  data() {
    const permitValidator = (r, v, cb) => {
      if (this.baseModel.vlanType === 'trunk' && v.length === 0) {
        return cb(new Error('请选择Permit VLAN'))
      }
      cb()
    }
    return {
      dupMap: Object.freeze({
        0: '断开',
        1: '10M/半双工',
        2: '10M/全双工',
        3: '100M/半双工',
        4: '100M/全双工',
        5: '1000M/全双工',
        6: '自协调',
        7: '未知/半双工',
        8: '未知/全双工'
      }),
      baseModel: {
        portid: [],
        speed_duplex: '0',
        flow: '0',
        state: '1'
      },
      baseRules: {
        portid: [{ required: true, message: '请选择端口号' }]
      },
      isLoading: false
    }
  },
  computed: {
    ...mapGetters('switch', [
      'item',
      'portInfoList',
      'portTreeList',
      'hasGillionPort'
    ]),
    selectPorts() {
      return this.baseModel.portid.includes('all')
        ? this.portInfoList.map(info => info.port)
        : this.baseModel.portid
    },
    // 是否存在光口选中
    selectHasFiber() {
      if (this.hasGillionPort && this.item.deviceType !== 'RG-ES209C-P') {
        let _selectPortid = this.selectPorts
        return _selectPortid.some(
          port => port >= this.portInfoList.slice(-2)[0].port
        )
      }
      return false
    },
    // 9c设备第九口判断
    dev_9cIsDisabled() {
      if (this.item.deviceType === 'RG-ES209C-P') {
        let _selectPortid = this.selectPorts
        return (
          (_selectPortid.length === 1 &&
            _selectPortid[0] !== this.portInfoList.slice(-1)[0].port) ||
          _selectPortid.length > 1
        )
      }
      return false
    }
  },
  watch: {
    selectPorts() {
      // 有光口判断
      if (this.selectHasFiber) {
        if (
          this.baseModel.speed_duplex !== '0' ||
          this.baseModel.speed_duplex !== '5'
        ) {
          this.baseModel.speed_duplex = '0'
        }
      }
      // 9c设备判断是否禁用
      if (this.dev_9cIsDisabled) {
        if (this.baseModel.speed_duplex === '5') {
          this.baseModel.speed_duplex = '0'
        }
      }
    }
  },
  methods: {
    _onTreeSelectClick(e) {
      this.$refs.speedRef.blur()
    },
    // poe使能
    _onSubmit() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let _postData = {
            ...this.baseModel,
            portid: this.selectPorts
          }
          let _result = await this.$api.switchApi(
            'doSwitchApi',
            {
              ip: this.item.ip,
              sn: this.item.devSN,
              method: 'post',
              data: _postData,
              url: 'port.cgi'
            },
            {
              timeoutOk: 10000
            }
          )
          this.$refs.baseForm.resetFields()
          this.$message({
            type: 'success',
            message: '配置成功'
          })
          this.$bus.$emit('PORT_LIST_UPDATE', {
            from: this.$options.name || 'anonymous'
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.switch-portsetting {
  min-height: 250px;
}
</style>
