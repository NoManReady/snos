<template>
  <div class="port-rate">
    <!-- <help-alert title="端口限速"></help-alert> -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.port_list')}}</span>
        <div class="fr">
          <el-button icon="el-icon-edit" plain size="medium" type="primary" v-auth="_onPatchEdit">{{$t('action.patch_edit')}}</el-button>
          <el-button
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="_onPatchRemove"
          >{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" size="medium" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('msw.port')" align="center">
          <template slot-scope="{row}">
            <span>{{row.ifname}}</span>
            <i class="rjucd-shanglian uplink" v-if="uplink.lpid.includes(row.lpid)"></i>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.rate.in_rate')" align="center" prop="irate">
          <template slot-scope="{row}">
            <span v-if="row.irate">{{row.irate}}</span>
            <span v-else>{{$t('msw.rate.no_limit')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('msw.rate.out_rate')" align="center" prop="orate">
          <template slot-scope="{row}">
            <span v-if="row.orate">{{row.orate}}</span>
            <span v-else>{{$t('msw.rate.no_limit')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="{row,$index}">
            <el-button size="medium" type="text" v-auth="{fn:_onEdit,params:$index}">{{$t('action.edit')}}</el-button>
            <el-button
              class="c-danger"
              size="medium"
              type="text"
              v-auth="{fn:_onPatchRemove,params:row.lpid}"
            >{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.page"
        :page-size="pageModel.size"
        :page-sizes="pageModel.sizes"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
      <!-- baseModal -->
      <el-dialog
        :close-on-click-modal="false"
        :title="modalTitle"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        width="700px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('msw.rate.in_rate_f')" prop="irate">
            <el-input :placeholder="$t('msw.rate.empty_rate_tip')" class="w300" clearable v-model.number="baseModel.irate"></el-input>
            <label class="c-info">({{rateRange[0]}}-{{rateRange[1]}}kbps )</label>
          </el-form-item>
          <el-form-item :label="$t('msw.rate.out_rate_f')" prop="orate">
            <el-input :placeholder="$t('msw.rate.empty_rate_tip')" class="w300" clearable v-model.number="baseModel.orate"></el-input>
            <label class="c-info">({{rateRange[0]}}-{{rateRange[1]}}kbps )</label>
          </el-form-item>
          <template v-if="editIndex===-1">
            <el-form-item :label="$t('msw.port_select_f')" class="inline-message" inline-message prop="portid"></el-form-item>
            <port-panel :selecteds.sync="baseModel.portid" has-agg mutilple />
          </template>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click.native="baseModalShow = false" class="w120" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button
            :loading="isLoading"
            @click.native="_onModalConfirm"
            class="w120"
            size="medium"
            type="primary"
          >{{isLoading?$t('action.editing'):$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import { rate } from '@/model/msw/port'
import { isBetween } from '@/utils/rulesUtils'
import { mapGetters } from 'vuex'
import { judgePortAttrMutil } from '@/utils/lag'
export default {
  name: 'port-rate',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    const rateValidator = (r, v, cb) => {
      // if (!this.baseModel.irate && !this.baseModel.orate) {
      //   return cb(new Error('入口速率和出口速率必须配置一个'))
      // }
      if (!v) {
        return cb()
      }
      if (!isBetween(v, ...this.rateRange)) {
        return cb(
          new Error(
            I18N.t('msw.rate.rate_range', {
              range: `${this.rateRange[0]}~${this.rateRange[1]}`
            })
          )
        )
      }
      cb()
    }
    return {
      isLoading: false,
      baseModel: rate(),
      baseRules: {
        portid: [{ required: true, message: I18N.t('msw.port_is_required') }],
        irate: [
          // { required: true, message: '请输入入口速率' },
          { validator: rateValidator }
        ],
        orate: [
          // { required: true, message: '请输入出口速率' },
          { validator: rateValidator }
        ]
      },
      baseModalShow: false,
      editIndex: -1
    }
  },
  computed: {
    ...mapGetters('switcher', ['piMap', 'uplink']),
    modalTitle() {
      let _item = this.getItem(this.editIndex)
      return _item
        ? `${I18N.t('msw.port_f')}${_item.ifname}`
        : I18N.t('action.patch_edit')
    },
    // 端口限速范围
    rateRange() {
      // 1、10、100分别万、千、百
      let _ds = 1
      let _portid = this.baseModel.portid
      if (_portid.length) {
        let _attr = judgePortAttrMutil(_portid)
        if (_attr.hasGPort) {
          _ds = 10
        }
        if (_attr.hasFPort) {
          _ds = 100
        }
      }
      return [16, parseInt(10000000 / _ds)]
    }
  },
  watch: {
    'baseModel.portid'(v) {
      if (this.$refs.baseForm) {
        this.$refs.baseForm.validateField('portid')
      }
    }
  },
  methods: {
    // 加载port列表
    async _loadList() {
      try {
        let _result = await this.$api.cmd('devConfig.get', {
          module: 'rate_limit'
        })
        let _list = _result.data
          .sort((a, b) => a.lpid - b.lpid)
          .map(port => {
            return {
              ...port,
              ifname: this.piMap[port.lpid]
            }
          })
        return _list
      } catch (error) {}
      return []
    },
    // 批量删除
    async _onPatchRemove(lpid) {
      let _lpids =
        lpid !== undefined
          ? [lpid]
          : this.$refs.baseTable.selection.map(s => s.lpid)
      if (!_lpids.length) {
        return this.$message.warning(I18N.t('tip.select_del_item'))
      }
      await this.$confirm(I18N.t('tip.confirm_delete'), {
        confirmButtonText: I18N.t('action.confirm'),
        cancelButtonText: I18N.t('action.cancel'),
        type: 'warning'
      })
      try {
        await this.$api.cmd('devConfig.del', {
          module: 'rate_limit',
          data: { lpid_list: _lpids }
        })
        this.pageModel.allItem = this.pageModel.allItem.filter(
          item => !_lpids.includes(item.lpid)
        )
        // this.refresh()
        this.$message.success(I18N.t('tip.del_success'))
      } catch (error) {}
    },
    // 批量编辑
    _onPatchEdit() {
      this.baseModalShow = true
      this.editIndex = -1
      this.baseModel = rate()
    },
    // 编辑
    _onEdit(index) {
      let _item = this.getItem(index)
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = { ...rate(), ..._item, portid: [_item.lpid] }
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          this.isLoading = true
          try {
            let { portid, ...model } = this.baseModel
            let _confirmData = portid.map(p => {
              let _data = { lpid: p }
              if (model.irate) {
                _data.irate = model.irate
              }
              if (model.orate) {
                _data.orate = model.orate
              }
              return _data
            })
            await this.$api.cmd('devConfig.update', {
              module: 'rate_limit',
              data: { data: _confirmData }
            })
            this.$message.success(I18N.t('tip.edit_success'))
            // this.refresh()
            for (let _port of _confirmData) {
              let _index = this.pageModel.allItem.findIndex(
                item => item.lpid === _port.lpid
              )
              if (_index > -1) {
                let { irate, orate, ...oldItem } = this.pageModel.allItem[
                  _index
                ]
                this.pageModel.allItem.splice(_index, 1, {
                  ...oldItem,
                  ..._port
                })
              } else {
                this.pageModel.allItem.push({
                  ifname: this.piMap[_port.lpid],
                  ..._port
                })
              }
            }
          } catch (error) {}
          this.baseModalShow = false
          this.isLoading = false
        }
      })
    }
  }
}
</script>

