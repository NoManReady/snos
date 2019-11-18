<template>
  <div class="switch-storm" v-loading="isLoading">
    <el-form :model="baseModel" :rules="baseRules" label-width="100px" ref="baseForm" size="mini">
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
          <el-form-item label="类型" prop="storm_filter">
            <el-select class="w120" v-model="baseModel.storm_filter">
              <el-option :value="4" label="广播"></el-option>
              <el-option :value="1" label="未知单播"></el-option>
              <el-option :value="3" label="未知组播"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开关" prop="action">
            <el-select class="w170" ref="stateRef" v-model="baseModel.action">
              <el-option :value="0" label="关闭"></el-option>
              <el-option :value="1" label="开启"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="速率" prop="rate">
            <el-input
              :disabled="baseModel.action===0"
              :placeholder="baseModel.action===0?'不限制':'请输入速率'"
              class="w120"
              v-model="baseModel.rate"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button @click.native="_onSubmit" type="primary">保存</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="stormList"
      :max-height="200"
      align="center"
      border
      header-align="center"
      ref="rateTable"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" label="端口" prop="port" width="100">
        <template slot-scope="{row}">{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column align="center" label="广播 (Mbit/sec)">
        <template slot-scope="{row}">
          <span v-if="row.bc==='off'">关闭</span>
          <span v-else>{{+row.bc/1000}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="未知单播 (Mbit/sec)">
        <template slot-scope="{row}">
          <span v-if="row.uuc==='off'">关闭</span>
          <span v-else>{{+row.uuc/1000}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="未知组播 (Mbit/sec)">
        <template slot-scope="{row}">
          <span v-if="row.umc==='off'">关闭</span>
          <span v-else>{{+row.umc/1000}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { Row, Col } from 'element-ui'
import Treeselect from '@riophae/vue-treeselect'
import { isBetween, intValidate } from '@/utils/rulesUtils'
import { mapGetters } from 'vuex'
export default {
  name: 'switch-storm',
  components: {
    [Row.name]: Row,
    [Col.name]: Col,
    Treeselect
  },
  data() {
    const rateValidator = (r, v, cb) => {
      if (this.baseModel.action === 0) {
        cb()
      }
      if (!intValidate(v)) return cb(new Error('请输入整数'))
      let _random = this.hasGillionPort ? 1000 : 100
      if (!isBetween(v, 1, _random)) {
        return cb(new Error(`请输入有效的速率（1~${_random}）`))
      }
      cb()
    }
    return {
      stormList: [],
      baseModel: {
        rate: '',
        storm_filter: 4,
        portid: [],
        action: 0
      },
      baseRules: {
        portid: [{ required: true, message: '请选择端口号' }],
        rate: [{ validator: rateValidator }]
      },
      isLoading: false
    }
  },
  computed: {
    ...mapGetters('switch', [
      'item',
      'hasGillionPort',
      'easyPortList',
      'portTreeList'
    ])
  },
  watch: {
    'baseModel.action'(v) {
      if (v === 1) {
        this.baseModel.rate = this.hasGillionPort ? 1000 : 100
      } else {
        this.baseModel.rate = ''
      }
    }
  },
  created() {
    this._load()
  },
  methods: {
    _onTreeSelectClick(e) {
      this.$refs.stateRef.blur()
    },
    // 加载storm配置信息数据
    async _load() {
      this.isLoading = true
      let _result = await this.$api.switchApi(
        'doSwitchApi',
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: 'get',
          url: 'rest_get_port_storm.cgi'
        },
        { isSilence: true }
      )
      this.isLoading = false
      this.stormList = _result
    },
    // 修改speed
    _onSubmit() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let _postData = {
            ...this.baseModel,
            portid: this.baseModel.portid.includes('all')
              ? this.easyPortList.map(port => port.id)
              : [...this.baseModel.portid]
          }
          if (this.baseModel.action === 0) {
            delete _postData.rate
          }
          await this.$api.switchApi('doSwitchApi', {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            data: _postData,
            url: 'fwd.cgi?cmd=storm'
          })
          this.$refs.baseForm.resetFields()
          this.$message({
            type: 'success',
            message: '配置成功'
          })
          this._load()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.switch-storm {
  min-height: 200px;
}
</style>
