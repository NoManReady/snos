<template>
  <div class="behavior-macbwlist">
    <div class="mb20">
      <el-radio :key="k" :label="k" border size="medium" v-for="(v,k) in modeMap" v-model="pageData.type">{{v}}</el-radio>
    </div>
    <help-alert
      :title="pageData.type==='allow' ? $t('wifi_comm.bw_tip1') : $t('wifi_comm.bw_tip2')"
      json-key="macBwlist"
      type="info"
    >
      <div slot="collapseFoot">
        <h3>{{$t('phrase.tip_f')}}</h3>
        <i18n path="wifi_comm.bw_tip3" tag="p">
          <a @click="_onToStalist" class="c-success pointer">“{{$t('overview.wireless_user')}}”</a>
        </i18n>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{pageData.type==='deny'?$t('wifi_comm.black_list'):$t('wifi_comm.white_list')}}</span>
        <div class="fr">
          <!-- <el-button type="primary" size="small" icon="el-icon-plus" v-auth="onAddBat">
            从在线列表中添加
          </el-button>-->
          <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="onAdd">{{$t('action.add')}}</el-button>
          <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="onDel">{{$t('action.patch_delete')}}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="wifi_comm.black_limit" tag="span">
            <b class="c-warning mlr5">{{MAX_NUM}}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="pageData.macList" ref="baseTable" row-key="mac" size="medium" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('sysinfo.mac_addr')" align="center" prop="mac">
          <template slot-scope="scope">{{scope.row.mac.toLocaleUpperCase()}}</template>
        </el-table-column>
        <el-table-column :label="$t('phrase.remark')" align="center" prop="name"></el-table-column>
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="scope">
            <el-button @click="onEdit(scope.$index)" size="medium" type="text">{{$t('action.edit')}}</el-button>
            <el-button size="medium" type="text" v-auth="{fn:onDel,params:scope.row}">{{$t('action.delete')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 新增/编辑 -->
      <el-dialog :title="modalTitle" :visible.sync="modalShow" width="550px">
        <el-form :model="baseModel" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('sysinfo.mac_addr')" prop="mac">
            <el-input :placeholder="$t('wan.mac_example')" class="w260" v-model="baseModel.mac"></el-input>
          </el-form-item>
          <el-form-item :label="$t('phrase.remark')" prop="name">
            <el-input class="w260" v-model="baseModel.name"></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="modalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
          <el-button @click="onModalConfirm" size="medium" type="primary">{{$t('action.confirm')}}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { nameLengthValidator, macValidator } from '@/utils/rules'
export default {
  name: 'WifiMacbwlist',
  data() {
    const checkMacUnit = (rule, value, cb) => {
      let _isExit = this.pageData.macList.find(
        (item, index) =>
          item.mac.toLocaleLowerCase() === value.toLocaleLowerCase() &&
          this.editIndex !== index
      )
      if (_isExit) {
        cb(new Error(I18N.t('wifi_comm.mac_has_cfg')))
      }
      cb()
    }
    return {
      MAX_NUM: 30,
      modeMap: {
        deny: I18N.t('wifi_comm.black_mode'),
        allow: I18N.t('wifi_comm.white_mode')
      },
      pageData: {
        type: null, // 默认为黑名单：deny  白名单对应：allow
        macList: []
      },
      baseModel: {
        name: '',
        mac: ''
      },
      baseRules: {
        name: [{ validator: nameLengthValidator, size: 32 }],
        mac: [
          { required: true, message: I18N.t('wan.mac_no_empty') },
          { validator: macValidator },
          { validator: checkMacUnit }
        ]
      },
      editIndex: -1,
      modalShow: false,
      isModeFallback: false //是否为取消切换
    }
  },
  watch: {
    'baseModel.mac'(v, o) {
      this.baseModel.mac = this.baseModel.mac.toLocaleUpperCase()
    },
    'pageData.type': {
      handler(v, o) {
        // 初始化或则取消切换不执行
        if (!o || this.isModeFallback) {
          this.isModeFallback = false
          return
        }
        let _msg
        if (v === 'allow') {
          _msg = I18N.t('wifi_comm.white_mode_tip')
        } else {
          // deny
          _msg = I18N.t('wifi_comm.black_mode_tip')
        }
        this.$confirm(
          _msg,
          I18N.t('wifi_comm.switch_to_mode', { mode: this.modeMap[v] }),
          {
            type: 'info'
          }
        ).then(
          async () => {
            if (v === 'allow') {
              this.pageData.macList = await this._getStaListLite()
            } else {
              // deny
              this.pageData.macList = []
            }
            this.onSubmit()
          },
          () => {
            this.isModeFallback = true
            this.pageData.type = o
          }
        )
      }
    }
  },
  created() {
    this._loadBwList()
  },
  computed: {
    modalTitle() {
      return this.editIndex !== -1
        ? I18N.t('action.edit')
        : I18N.t('action.add')
    }
  },
  methods: {
    // 加载列表
    async _loadBwList() {
      let _res = await this.$api.getMacBwList()
      this.pageData = { ...this.pageData, ..._res }
    },
    _getStaListLite() {
      return new Promise(async (res, rej) => {
        let _res = await this.$api.getStaListLite()
        let _list = []
        _res.list &&
          _res.list.forEach(item => {
            _list.push({
              mac: item.mac,
              name: item.hostName || ''
            })
          })
        res(_list)
      })
    },
    // 跳转到“无线用户”页面
    _onToStalist() {
      this.$router.push({ name: 'admin/wifi/wifi_sta' })
    },
    // 新增
    onAdd() {
      if (this.pageData.macList.length >= this.MAX_NUM) {
        return this.$message.warning(
          I18N.t('wifi_comm.black_limit', { max: this.MAX_NUM })
        )
      }
      this.modalShow = true
      this.editIndex = -1
      this.baseModel = { name: '', mac: '' }
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    },
    // 编辑
    onEdit(index) {
      this.modalShow = true
      this.editIndex = index
      this.baseModel = { ...this.pageData.macList[index] }
    },
    //删除分组
    onDel(item) {
      let _items = this.$refs.baseTable.selection
      if (item) {
        _items = [item]
      }
      if (!_items.length) {
        return this.$message.warning(I18N.t('tip.select_del_item'))
      }
      this.$confirm(I18N.t('tip.confirm_delete')).then(() => {
        let _macList = _items.map(ite => ite.mac)
        this.$api
          .delMacBwList({ type: this.pageData.type, macList: _macList })
          .then(d => {
            this.pageData.macList = this.pageData.macList.filter(item => {
              return !_macList.includes(item.mac)
            })
            this.$message({
              message: I18N.t('tip.del_success'),
              type: 'success'
            })
          })
      })
    },
    // 确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _promise = null
          if (this.editIndex === -1) {
            _promise = this.$api
              .addMacBwList({ ...this.baseModel, type: this.pageData.type })
              .then(d => {
                this.pageData.macList.push(this.baseModel)
              })
          } else {
            _promise = this.$api
              .updateMacBwList({
                type: this.pageData.type,
                new: this.baseModel,
                old: this.pageData.macList[this.editIndex]
              })
              .then(d => {
                this.pageData.macList.splice(this.editIndex, 1, this.baseModel)
              })
          }
          _promise.then(() => {
            this.modalShow = false
          })
        }
      })
    },
    // 提交数据
    onSubmit() {
      this.$api.setMacBwList(this.pageData).then(d => {
        this.$message({
          message: I18N.t('tip.edit1_success'),
          type: 'success'
        })
      })
    }
  }
}
</script>
