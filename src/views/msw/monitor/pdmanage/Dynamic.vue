<template>
  <div class="port-mac-dynamic">
    <!-- <help-alert title="动态MAC地址"></help-alert> -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.mac.mac_addr_list')}}</span>
        <el-form
          :model="baseModel"
          :rules="baseRules"
          class="fr inline-tip view-form"
          inline
          inline-message
          ref="baseForm"
          size="medium"
        >
          <el-form-item>
            <el-select class="w200" v-model="clearType">
              <el-option :label="$t('msw.mac.clear_by_mac')" value="macaddr"></el-option>
              <el-option :label="$t('msw.mac.clear_by_port')" value="lpid"></el-option>
              <el-option :label="$t('msw.mac.clear_by_vlan')" value="vlanid"></el-option>
              <!-- <el-option label="基于MAC及VLAN清除" value="macaddr-vlanid"></el-option> -->
            </el-select>
          </el-form-item>
          <template v-if="clearType.includes('macaddr')">
            <el-form-item prop="macaddr">
              <el-input :placeholder="$t('wan.mac_example')" class="w200" v-model="baseModel.macaddr"></el-input>
            </el-form-item>
          </template>
          <template v-if="clearType.includes('vlanid')">
            <el-form-item prop="vlanid">
              <el-input :placeholder="$t('msw.vlan_no_empty')" class="w200" v-model="baseModel.vlanid"></el-input>
            </el-form-item>
          </template>
          <template v-if="clearType.includes('lpid')">
            <el-form-item prop="lpid">
              <el-select class="w140" v-model="baseModel.lpid">
                <el-option :label="$t('phrase.all')" value></el-option>
                <el-option :key="port.lpid" :label="port.ifname" :value="port.lpid" v-for="port in allTypePorts"></el-option>
              </el-select>
            </el-form-item>
          </template>
          <el-form-item>
            <el-button :loading="isLoading" icon="el-icon-delete" plain type="primary" v-auth="_onClear">{{$t('action.clear')}}</el-button>
            <!-- <el-button :loading="isLoading" icon="el-icon-delete" plain type="primary" v-auth="_onClearAll">全部清除</el-button> -->
            <el-button
              :loading="isLoading"
              icon="el-icon-refresh-right"
              plain
              type="primary"
              v-auth="_onRefresh"
            >{{$t('action.refresh')}}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="pageList" ref="baseTable" size="medium" stripe>
        <el-table-column :label="$t('phrase.serial')" align="center" prop="order" width="60"></el-table-column>
        <el-table-column align="center" label="MAC" prop="m"></el-table-column>
        <el-table-column align="center" label="VLAN ID" prop="v"></el-table-column>
        <el-table-column :label="$t('msw.port')" align="center" prop="i"></el-table-column>
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
        // lpid: [{ required: true, message: '请选择需要配置的端口' }],
        vlanid: [
          // { required: true, message: '请输入VLAN ID' },
          // { validator: vlanidValidator, message: 'VLAN ID格式错误' }
        ],
        macaddr: [
          // { required: true, message: '请输入MAC地址' },
          // { validator: macValidator }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('switcher', ['logicPort', 'lagPort', 'piMap']),
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
              i: this.piMap[lis.l],
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
        this.$message.success(I18N.t('tip.remove_success'))
        this.doQuery()
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>

