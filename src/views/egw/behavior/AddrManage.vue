<template>
  <div class="behavior-addr-manage">
    <help-alert json-key="behaviorAddrManageJson" :title="$t('egw.AddrManage.addr_manage')">
      <div slot="collapseFoot">
        <h3 class="tit">{{$t('phrase.notice')}}</h3>
        <p class="desc">{{$t('egw.AddrManage.addr_manage_tip')}}</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.AddrManage.addr_group_tab')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            :disabled="addrList.length>=maxLimit||isLoading"
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="onAdd"
          >{{$t('action.add')}}</el-button>
          <el-button :disabled="isLoading" icon="el-icon-delete" plain size="medium" type="primary" v-auth="onDel">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="egw.limit_num_tip">
              <b class="c-warning mlr5">{{maxLimit}}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="addrList" ref="baseTable" size="medium" stripe>
        <el-table-column :selectable="_isSelectable" type="selection" width="55"></el-table-column>
        <!-- <el-table-column label="序号" align="center">
          <template slot-scope="scope">
            {{scope.$index+1}}
          </template>
        </el-table-column>-->
        <el-table-column align="center" :label="$t('egw.SiteManage.group_name')" prop="name"></el-table-column>
        <el-table-column align="center" :label="$t('egw.AddrManage.IP_group_range')" prop="ip">
          <template slot-scope="scope">
            <p :key="i" v-for="i of scope.row.ip">{{i}}</p>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action.ope')">
          <template slot-scope="scope">
            <el-button :disabled="scope.row.flag==='sys'" size="medium" type="text" v-auth="{fn:onEdit,params:scope.$index}">{{$t('action.edit')}}</el-button>
            <el-button :disabled="!_isSelectable(scope.row)" size="medium" type="text" v-auth="{fn:onDel,params:scope.row}">{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 地址管理modal -->
      <el-dialog :title="modalTitle" :visible.sync="baseModalShow" width="550px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('egw.SiteManage.group_name')" prop="name">
            <el-input
              :disabled="editIndex!==-1"
              :title="baseModel.name"
              class="w250"
              :placeholder="$t('egw.AddrManage.enter_group_name')"
              v-model="baseModel.name"
            ></el-input>
          </el-form-item>
          <el-form-item class="is-required" :label="$t('egw.AddrManage.IP_group_range')" prop="ip">
            <el-form-item
              :class="{mb20:index!==baseModel.ip.length-1}"
              :key="index"
              :prop="`ip[${index}]`"
              :rules="ipValidate(item,index)"
              v-for="(item,index) in baseModel.ip"
            >
              <el-input class="w250" :placeholder="$t('wan.ip_range_example')" v-model="baseModel.ip[index]"></el-input>
              <el-button @click="onDelIpList(index)" size="medium" type="text" v-if="baseModel.ip.length > 1">
                <i class="el-icon-close"></i>
              </el-button>
              <el-button
                @click="onAddIpList"
                size="medium"
                type="text"
                v-if="index === baseModel.ip.length - 1 && baseModel.ip.length < 5"
              >
                <i class="el-icon-plus"></i>
              </el-button>
            </el-form-item>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="baseModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button :diaabled="isLoading" @click="onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { nameLengthValidator } from '@/utils/rules'
import model from '@/model'
import formMixins from '@/mixins/formMixins'
import { judgeIpRangeRules } from '@/utils/commonValidates'
import clone from 'clone'
export default {
  name: 'BehaviorAddrManage',
  data() {
    const uniqueValidator = (rule, value, cb) => {
      if (
        this.addrList.find(
          (addr, index) => addr.name === value && index !== this.editIndex
        )
      ) {
        cb(new Error(this.$t('egw.AddrManage.addr_name_is_has')))
      }
      cb()
    }
    return {
      isLoading: true,
      baseModalShow: false,
      maxLimit: 20,
      editIndex: -1,
      baseModel: model.behaviorAddrManageFn(),
      baseRules: {
        name: [
          { required: true, message: this.$t('egw.AddrManage.enter_group_name'), whitespace: true },
          {
            validator: nameLengthValidator,
            size: 64,
            message: this.$t('egw.invalid_group_name')
          },
          { validator: uniqueValidator }
        ]
      },
      addrList: []
    }
  },
  mixins: [formMixins],
  computed: {
    modalTitle() {
      return this.editIndex === -1 ? this.$t('egw.AddrManage.addr_add') : this.$t('egw.AddrManage.addr_edit')
    }
  },
  created() {
    this._loadAddrInfo()
  },
  methods: {
    // 加载NAT列表
    _loadAddrInfo() {
      this.isLoading = true
      this.$api
        .getAddrManage()
        .then(d => {
          this.addrList = d
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 判断是否可编辑
    _isSelectable(row, index) {
      return row.flag === 'usr' && row.ref == 0
    },
    // 添加IP范围
    onAddIpList() {
      this.baseModel.ip.push('')
    },
    // 删除IP范围
    onDelIpList(index) {
      this.baseModel.ip.splice(index, 1)
    },
    // IP范围验证数组
    ipValidate(_, index) {
      return judgeIpRangeRules(this.baseModel.ip, index)
    },
    // 删除NAT
    onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        return this.$message.warning(this.$t('tip.select_del_item'))
      }
      this.$confirm(this.$t('tip.confirm_delete')).then(() => {
        this.isLoading = true
        this.$api
          .delAddrManage({ names: _items.map(ite => ite.ip_group) })
          .then(d => {
            _items.forEach(ite => {
              let _index = this.addrList.findIndex(d => d === ite)
              this.addrList.splice(_index, 1)
            })
            this.$message({
              message:this.$t('tip.del_success'),
              type: 'success'
            })
          })
          .finally(() => {
            this.isLoading = false
          })
      })
    },
    // 添加NAT
    onAdd() {
      this.editIndex = -1
      this.baseModalShow = true
      this.baseModel = model.behaviorAddrManageFn()
      this._clearValidate()
    },
    // 编辑NAT
    onEdit(index) {
      this.editIndex = index
      this.baseModalShow = true
      this.baseModel = clone(this.addrList[index])
      this._clearValidate()
    },
    // 编辑地址确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          if (
            JSON.stringify(this.baseModel) ===
            JSON.stringify(this.addrList[this.editIndex])
          ) {
            this.baseModalShow = false
            return
          }
          if (this.isLoading) {
            return
          }
          this.isLoading = true
          let _isnew = this.editIndex === -1
          this.$api
            .setAddrManage(this.baseModel, _isnew)
            .then(d => {
              if (_isnew) {
                this.addrList.push({ ...this.baseModel, ip_group: d.ip_group })
              } else {
                this.addrList.splice(this.editIndex, 1, { ...this.baseModel })
              }
            })
            .finally(() => {
              this.baseModalShow = false
              setTimeout(() => {
                this.isLoading = false
              }, 300)
            })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
