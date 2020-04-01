<template>
  <div class="vpn-user-pool">
    <help-alert :title="$t('egw.pool.addr_zone_manage')" json-key="vpnPoolJson">
      <div slot="content">
        <i18n path="egw.pool.addr_zone_is_used">
          <span class="c-warning">{{$t('action.delete')}}</span>
        </i18n>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.pool.addr_zone_tab')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="poolList.length>=MAX_NUM||isLoading"
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="_onAdd"
          >{{$t('action.add')}}</el-button>
          <el-button
            :disabled="isLoading"
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="_onDel"
          >{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <div class="box-content">
        <help-alert :show-icon="false" title>
          <div slot="content">
            <i18n path="tip.max_limit_f">
                <b class="c-warning mlr5">{{MAX_NUM}}</b>
            </i18n>
          </div>
        </help-alert>
        <el-table :data="poolList" ref="baseTable" size="medium" stripe>
          <el-table-column :selectable="row => row.active !== '1'" type="selection" width="55"></el-table-column>
          <el-table-column :label="$t('egw.pool.addr_zone_name')" align="center" prop="ippool_name"></el-table-column>
          <el-table-column :label="$t('egw.ip_limit')" align="center" prop="ipRange">
            <template slot-scope="{row}">{{`${row.first_addr}-${row.end_addr}`}}</template>
          </el-table-column>
          <el-table-column :label="$t('action.ope')" align="center">
            <template slot-scope="scope">
              <el-button
                :disabled="isLoading"
                size="medium"
                type="text"
                v-auth="{fn:_onEdit,params:scope.$index}"
              >{{$t('action.edit')}}</el-button>
              <el-button
                :disabled="isLoading || scope.row.active !== '0'"
                size="medium"
                type="text"
                v-auth="{fn:_onDel,params:scope.row}"
              >{{$t('action.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 用户管理编辑modal -->
    <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="500px">
      <el-form
        :model="baseModel"
        :rules="getPoolRules(isAddPool)"
        :validate-on-rule-change="false"
        label-width="120px"
        ref="baseForm"
      >
        <el-form-item :label="$t('egw.pool.addr_zone_name')" :placeholder="$t('egw.rule_name_length_tip')" prop="ippool_name">
          <el-input :disabled="editIndex !== -1" class="w300" v-model="baseModel.ippool_name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('egw.ip_limit')" prop="ipRange">
          <el-input class="w300" placeholder="1.1.1.2-1.1.1.100" v-model="baseModel.ipRange"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="baseModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button @click="_onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import modelFn from '@/model'
import formMixins from '@/mixins/formMixins'
import poolMixins from './poolMixins'
export default {
  name: 'vpn-user-pool',
  mixins: [formMixins, poolMixins],
  data() {
    return {
      baseModalShow: false,
      isLoading: false,
      editIndex: -1,
      baseModel: modelFn.vpnPoolFn(),
      MAX_NUM: 5
    }
  },
  computed: {
    isAddPool() {
      return this.editIndex === -1
    },
    modalTitle() {
      return this.isAddPool ? I18N.t('action.add') : I18N.t('action.edit')
    }
  },
  watch: {
    'baseModel.ipRange'(v) {
      let _vArr = !!v ? v.split(/\s*-\s*/) : []
      if (_vArr.length === 2) {
        this.baseModel.first_addr = _vArr[0] || ''
        this.baseModel.end_addr = _vArr[1] || ''
      }
    }
  },
  created() {
    this.loadIpPool()
  },
  methods: {
    // 添加
    _onAdd() {
      this.baseModel = modelFn.vpnPoolFn()
      this.baseModalShow = true
      this.editIndex = -1
      this._clearValidate()
    },
    // 编辑
    _onEdit(index) {
      this.baseModalShow = true
      this.editIndex = index
      this.baseModel = { ...this.poolList[index] }
      this._clearValidate()
    },
    // 删除
    _onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        this.$alert(I18N.t('tip.select_del_item'), {
          type: 'warning'
        })
        return
      }
      this.$confirm(I18N.t('tip.confirm_delete'), I18N.t('phrase.tip'), {
        type: 'warning'
      }).then(() => {
        this.isLoading = true
        this.$api
          .delIpPool({ ippool_name: _items.map(ite => ite.ippool_name) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.poolList.findIndex(d => d === ite)
              this.poolList.splice(_index, 1)
            })
            this.$message({
              message: I18N.t('tip.del_success'),
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // confirm确认
    _onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this._onSubmit()
        }
      })
    },
    // 提交数据
    _onSubmit() {
      if (
        JSON.stringify(this.baseModel) ===
        JSON.stringify(this.poolList[this.editIndex])
      ) {
        this.baseModalShow = false
        return
      }
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      let _poolData = { ...this.baseModel }
      delete _poolData.ipRange
      this.$api
        .setIpPool(_poolData, this.isAddPool)
        .then(d => {
          Object.assign(_poolData, {
            ipRange: this.baseModel.ipRange,
            active: '0'
          })
          if (this.isAddPool) {
            this.poolList.push(_poolData)
          } else {
            this.poolList.splice(this.editIndex, 1, _poolData)
          }
          this.$message({
            message: I18N.t('tip.edit1_success'),
            type: 'success'
          })
        })
        .finally(() => {
          this.baseModalShow = false
          setTimeout(() => {
            this.isLoading = false
          }, 300)
        })
    }
  }
}
</script>
