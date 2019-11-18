<template>
  <div class="port-mac-dynamic">
    <help-alert title="动态MAC地址"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">MAC列表</span>
        <el-form :model="baseModel" :rules="baseRules" class="fr inline-tip" inline inline-message ref="baseForm" size="mini">
          <el-form-item>
            <el-select class="w140" v-model="clearType">
              <el-option label="基于端口清除" value="lpid"></el-option>
              <el-option label="基于MAC清除" value="macaddr"></el-option>
              <el-option label="基于VLAN清除" value="vlanid"></el-option>
              <!-- <el-option label="基于MAC及VLAN清除" value="macaddr-vlanid"></el-option> -->
            </el-select>
          </el-form-item>
          <template v-if="clearType.includes('macaddr')">
            <el-form-item prop="macaddr">
              <el-input class="w160" placeholder="格式如：00:11:22:33:44:55" v-model="baseModel.macaddr"></el-input>
            </el-form-item>
          </template>
          <template v-if="clearType.includes('vlanid')">
            <el-form-item prop="vlanid">
              <el-input class="w100" placeholder="请输入VLAN ID" v-model="baseModel.vlanid"></el-input>
            </el-form-item>
          </template>
          <template v-if="clearType.includes('lpid')">
            <el-form-item prop="lpid">
              <el-select class="w100" v-model="baseModel.lpid">
                <el-option label="全部" value></el-option>
                <el-option :key="port.lpid" :label="port.interface" :value="port.lpid" v-for="port in allTypePorts"></el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item>
            <el-button :loading="isLoading" icon="el-icon-delete" type="danger" v-auth="_onClear">清除</el-button>
            <el-button :loading="isLoading" icon="el-icon-delete" type="danger" v-auth="_onClearAll">全部清除</el-button>
            <el-button :loading="isLoading" icon="el-icon-refresh-right" type="primary" v-auth="_onRefresh">刷新</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="pageList" ref="baseTable" size="small" stripe>
        <el-table-column align="center" label="序号" prop="order" width="60"></el-table-column>
        <el-table-column align="center" label="MAC" prop="m"></el-table-column>
        <el-table-column align="center" label="VLAN ID" prop="v"></el-table-column>
        <el-table-column align="center" label="端口" prop="i"></el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.index"
        :page-size="pageModel.size"
        :page-sizes="pageModel.sizes"
        :total="pageModel.total"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
        background
        class="mt20"
        hide-on-single-page
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import pagePlusMixins from '@/mixins/msw/pagePlusMixins'
import { mapGetters } from 'vuex'
import { vlanidValidator, macValidator } from '@/utils/rules'
import { macBase } from '@/model/msw/port'
export default {
  name: 'port-mac-dynamic',
  mixins: [pagePlusMixins],
  data() {
    return {
      clearType: 'macaddr',
      baseModel: macBase(),
      isLoading: false,
      baseRules: {
        lpid: [{ required: true, message: '请选择需要配置的端口' }],
        vlanid: [
          // { required: true, message: '请输入VLAN ID' },
          { validator: vlanidValidator, message: 'VLAN ID格式错误' }
        ],
        macaddr: [
          // { required: true, message: '请输入MAC地址' },
          { validator: macValidator }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('switcher', ['logicPort', 'lagPort']),
    // 所有port（包含聚合口）
    allTypePorts() {
      return [...this.logicPort, ...this.lagPort]
    }
  },
  watch: {
    clearType() {
      this._reset()
    }
  },
  methods: {
    // 加载port列表
    async _loadList(query) {
      try {
        let _result = await this.$api.cmd(
          'devSta.get',
          {
            module: 'dynamic_mac',
            data: query
          },
          { timeout: 0 }
        )
        _result.list = Object.freeze(
          _result.list.map((lis, i) => {
            return {
              ...lis,
              order: i + 1 + (this.pageModel.index - 1) * this.pageModel.size
            }
          })
        )
        return _result
      } catch (error) {
        return { total: 0, list: [] }
      }
    },
    // 重置
    _reset() {
      this.baseModel = macBase()
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    },
    // 刷新
    _onRefresh() {
      this.doQuery()
    },
    // 清除
    _onClear() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          await this._postClear({ ...this.baseModel })
          this._reset()
        }
      })
    },
    // 全部清除
    _onClearAll() {
      this._postClear(macBase())
    },
    // 下发清除
    async _postClear(params) {
      this.isLoading = true
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key]
        }
      })
      try {
        await this.$api.cmd('devSta.set', {
          module: 'dynamic_mac',
          data: params
        })
        this.$message.success('清除成功')
        this.doQuery()
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>
<style lang="scss" scoped>
.port-mac-dynamic {
}
</style>

