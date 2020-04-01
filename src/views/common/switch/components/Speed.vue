<template>
  <div class="switch-speed" v-loading="isLoading">
    <el-form :model="baseModel" :rules="baseRules" label-width="100px" ref="baseForm" size="mini">
      <el-row :gutter="0">
        <el-col :span="12">
          <el-form-item :label="$t('esw.port')" prop="portid">
            <treeselect
              :default-expand-level="1"
              :max-height="250"
              :multiple="true"
              :options="portTreeList"
              :placeholder="$t('esw.select')"
              @click.native="_onTreeSelectClick"
              class="w170"
              v-model="baseModel.portid"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('phrase.type')" prop="type">
            <el-select class="w120" v-model="baseModel.type">
              <el-option :label="$t('esw.mirror.in')" :value="0"></el-option>
              <el-option :label="$t('esw.mirror.out')" :value="1"></el-option>
              <el-option :label="$t('phrase.all')" :value="2"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('phrase.status')" prop="state">
            <el-select class="w170" ref="stateRef" v-model="baseModel.state">
              <!-- <el-option :value="0" label="关闭"></el-option> -->
              <el-option :label="$t('phrase.disable')" :value="0"></el-option>
              <el-option :label="$t('phrase.enable')" :value="1"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('esw.base.rate')" prop="rate">
            <el-input
              :disabled="baseModel.state===0"
              :placeholder="baseModel.state===0?$t('esw.base.no_limit'):$t('esw.base.rate_no_empty')"
              class="w120"
              v-model="baseModel.rate"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button @click.native="_onSubmit" type="primary">{{$t('action.save_edit')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="speedList"
      :max-height="200"
      align="center"
      border
      header-align="center"
      ref="rateTable"
      size="mini"
      style="width: 100%"
    >
      <el-table-column :label="$t('esw.port')" align="center" prop="port" width="100">
        <template slot-scope="{row}">{{+row.port+1}}</template>
      </el-table-column>
      <el-table-column :label="$t('esw.base.in_rate')" align="center">
        <template slot-scope="{row}">
          <span v-if="row.rxRate==='0'">{{$t('esw.base.no_limit')}}</span>
          <span v-else>{{+row.rxRate/1000}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('esw.base.out_rate')" align="center">
        <template slot-scope="{row}">
          <span v-if="row.txRate==='0'">{{$t('esw.base.no_limit')}}</span>
          <span v-else>{{+row.txRate/1000}}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import Treeselect from '@riophae/vue-treeselect'
import { isBetween, intValidate } from '@/utils/rulesUtils'
import { mapGetters } from 'vuex'
export default {
  name: 'switch-speed',
  components: {
    Treeselect
  },
  data() {
    const rateValidator = (r, v, cb) => {
      if (this.baseModel.state === 0) {
        cb()
      }
      if (!intValidate(v)) return cb(new Error(I18N.t('esw.base.require_int')))
      let _random = this.hasGillionPort ? 1000 : 100
      if (!isBetween(v, 1, _random)) {
        return cb(new Error(I18N.t('esw.base.rate_range', { rate: _random })))
      }
      cb()
    }
    return {
      speedList: [],
      baseModel: {
        rate: '',
        type: 2,
        portid: [],
        state: 0
      },
      baseRules: {
        portid: [{ required: true, message: I18N.t('esw.port_no_empty') }],
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
    'baseModel.state'(v) {
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
    // 加载rate配置信息数据
    async _load() {
      this.isLoading = true
      let _result = await this.$api.switchApi(
        'doSwitchApi',
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: 'get',
          url: 'rest_get_port_bandwidth.cgi'
        },
        { isSilence: true }
      )
      this.isLoading = false
      this.speedList = _result
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
          if (this.baseModel.state === 0) {
            delete _postData.rate
          }
          await this.$api.switchApi('doSwitchApi', {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            data: _postData,
            url: 'port.cgi?cmd=bandwidthcontrol'
          })
          this.$refs.baseForm.resetFields()
          this.$message({
            type: 'success',
            message: I18N.t('tip.edit1_success')
          })
          this._load()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.switch-speed {
  min-height: 200px;
}
</style>
