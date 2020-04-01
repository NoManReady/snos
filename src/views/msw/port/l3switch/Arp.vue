<template>
  <div class="security-arp">
    <help-alert :title="$t('arp_bind.mac_ip')" json-key="arpbindJson">
      <div slot="content" v-if="showMacFilter">{{ $t("arp_bind.bind_tip") }}</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{ $t("arp_bind.ip_mac_list") }}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="{ fn: onEdit, params: { idx: -1 } }"
          >{{ $t("action.add") }}</el-button>
          <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="onDel">{{ $t("action.patch_delete") }}</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="arp_bind.bind_limit" tag="span">
            <b class="c-warning mlr5" place="max">{{ MAX_NUM }}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" row-key="macaddr" size="medium" stripe>
        <el-table-column :selectable="row=>row.type==='static'" align="center" type="selection" width="50"></el-table-column>
        <el-table-column :label="$t('phrase.serial')" align="center" type="index"></el-table-column>
        <el-table-column :label="$t('sysinfo.mac_addr')" align="center" prop="macaddr"></el-table-column>
        <el-table-column :label="$t('sysinfo.ip_addr')" align="center" prop="ipaddr"></el-table-column>
        <!-- <el-table-column
          align="center"
          :label="$t('msw.l3interface.l3_interface')"
        >
         <template slot-scope="scope">
            <span>{{interfaceObj[scope.row.interface]}}</span>
          </template>
        </el-table-column>-->
        <el-table-column :label="$t('action.ope')" align="center">
          <template slot-scope="scope">
            <el-button
              :disabled="scope.row.type==='dynamic'"
              size="medium"
              type="text"
              v-auth="{
                fn: onEdit,
                params: { idx: scope.$index, row: scope.row }
              }"
            >{{ $t("action.edit") }}</el-button>
            <el-button
              :disabled="scope.row.type==='dynamic'"
              size="medium"
              type="text"
              v-auth="{ fn: onDel, params: scope.row }"
            >{{ $t("action.delete") }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.pageIndex"
        :page-size="pageModel.pageSize"
        :page-sizes="pageModel.pageSizes"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="_onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>

      <!-- 编辑框 -->
      <el-dialog :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="500px">
        <el-form :model="modelData" :rules="baseRules" label-width="160px" ref="baseForm" size="medium">
          <el-form-item :label="$t('sysinfo.ip_addr')" prop="ipaddr">
            <arp-input :placeholder="$t('arp_bind.select_ip')" @select="onSelectIp" filterType="LAN" v-model="modelData.ipaddr"></arp-input>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.mac_addr')" prop="macaddr">
            <arp-input :placeholder="$t('arp_bind.select_mac')" filterType="LAN" v-model="modelData.macaddr" valueKey="mac"></arp-input>
          </el-form-item>
          <!-- <el-form-item :label="$t('msw.l3interface.l3_interface')" prop="interface">
            <el-select class="w200" v-model="modelData.interface">
             <el-option :key="intf.vlanid" :label="intf.iftype=='svi'? interfaceObj['br-lan_' + intf.vlanid] : intf.iftype=='ap'? interfaceObj['br-lan_AP_' + intf.vlanid] : interfaceObj['br-lan_R_' + intf.vlanid]" :value="intf.iftype=='svi'? 'br-lan_' + intf.vlanid : intf.iftype=='ap'? 'br-lan_AP_' + intf.vlanid : 'br-lan_R_' + intf.vlanid" v-for="intf in intfs"></el-option>
            </el-select>
          </el-form-item>-->
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false" size="medium">
            {{
            $t("action.cancel")
            }}
          </el-button>
          <el-button @click="onClickFormBtn" size="medium" type="primary">
            {{
            $t("action.confirm")
            }}
          </el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { ipValidator, macValidator } from '@/utils/rules'
import pageMixins from '@/mixins/pageMixins'
import formMixins from '@/mixins/formMixins'
import ArpInput from '@/common/ArpInput'
import model from '@/model'
import { mapGetters } from 'vuex'
export default {
  name: 'SecurityArpbind',
  data() {
    const _compareVal = (v, v1) => {
      return v && v1 && v.toLocaleLowerCase() === v1.toLocaleLowerCase()
    }
    const checkIpaddrUnit = (rule, value, cb) => {
      let _isExit = this.pageModel.allItem.find(
        item =>
          _compareVal(item.ipaddr, value) &&
          !_compareVal(item.ipaddr, this.editData.ipaddr)
      )
      if (_isExit) {
        cb(new Error(I18N.t('arp_bind.ip_exist')))
      }
      cb()
    }
    const checkMacUnit = (rule, value, cb) => {
      let _isExit = this.pageModel.allItem.find(
        item =>
          _compareVal(item.macaddr, value) &&
          !_compareVal(item.macaddr, this.editData.macaddr)
      )
      if (_isExit) {
        cb(new Error(I18N.t('arp_bind.mac_exist')))
      }
      cb()
    }
    return {
      interfaceObj: {},
      intfs: [],
      MAX_NUM: 256,
      title: I18N.t('arp.mac_bind'),
      pageData: {},
      editData: {},
      editIndex: -1,
      modelData: model.macbindFn(),
      modalTitle: '',
      isModalShow: false,
      baseRules: {
        ipaddr: [
          { required: true, message: I18N.t('wan.ip_no_empty') },
          { validator: ipValidator },
          { validator: checkIpaddrUnit }
        ],
        macaddr: [
          { required: true, message: I18N.t('wan.mac_no_empty') },
          { validator: macValidator },
          { validator: checkMacUnit }
        ],
        interface: [
          // { required: true, message: this.$t('msw.l3interface.select_l3interface') },
        ]
      }
    }
  },
  mixins: [pageMixins, formMixins],
  components: {
    ArpInput
  },
  computed: {
    ...mapGetters('switcher', ['piMap']),
    showMacFilter() {
      return this.$store.getters.roles.includes('egEnable')
    }
  },
  created() {},
  methods: {
    async _loadList() {
      // this.loadNetwork()
      let _res = await this.$api.getStaticArpTable()
      let _dynamic = await this.$api.getArpTable()
      this.MAX_NUM = +_res.maxLen || 256
      this.pageData = _res
      return [
        ..._res.arp_static.map(mac => {
          return {
            ...mac,
            type: 'static'
          }
        }),
        ..._dynamic.map(mac => {
          return {
            macaddr: mac.mac,
            ipaddr: mac.ip,
            type: 'dynamic'
          }
        })
      ]
    },
    // 加载出口类型列表
    async loadNetwork() {
      const _result = await this.$api.cmd('devConfig.get', {
        module: 'l3_interface'
      })
      this.intfs = _result.list || []
      this.intfs.forEach((w, i) => {
        if (w.iftype == 'svi') {
          this.interfaceObj['br-lan_' + w.vlanid] = 'VLAN' + w.vlanid
        } else if (w.iftype == 'ap') {
          this.interfaceObj['br-lan_AP_' + w.vlanid] = 'Ag' + w.lpid
        } else {
          this.interfaceObj['br-lan_R_' + w.vlanid] = this.piMap[w.lpid]
        }
      })
    },
    onDel(item) {
      let _items = []
      if (item) {
        _items = [item]
      } else {
        _items = this.$refs.baseTable.selection
        if (_items.length === 0) {
          return this.$message.warning(I18N.t('tip.select_del_item'))
        }
      }

      this.$confirm(I18N.t('tip.confirm_delete')).then(() => {
        this.$api.delStaticArpTable({ arp_list: _items }).then(d => {
          this.$message({
            message: I18N.t('tip.del_success'),
            type: 'success'
          })
          let _map = _items.map(o => o.macaddr)
          // 更新本地数据
          this.pageModel.allItem = this.pageModel.allItem.filter(item => {
            return !_map.includes(item.macaddr)
          })
        })
      })
    },
    onEdit({ idx, row = model.macbindFn() }) {
      let isAdd = idx < 0
      if (isAdd && this.pageTotal >= this.MAX_NUM) {
        return this.$message.warning(
          I18N.t('arp_bind.add_limit', { name: this.title, max: this.MAX_NUM })
        )
      }
      this.editIndex = idx
      let title =
        (isAdd ? I18N.t('action.add') : I18N.t('action.edit')) + this.title
      this.onShowModal(title, row)
    },
    onShowModal(title, data) {
      this.isModalShow = true
      this.modalTitle = title
      this.modelData = Object.assign({}, data)
      this.editData = Object.assign({}, data)
    },
    onClickFormBtn() {
      this.$refs.baseForm.validate(ok => {
        if (ok) {
          let _item = { ...this.modelData }

          // 更新本地数据
          let _isAdd = this.editIndex === -1
          let _promise = null
          if (_isAdd) {
            _promise = this.$api
              .addStaticArpTable({ arp_list: [_item] })
              .then(d => {
                this.$message({
                  message: I18N.t('tip.add_success'),
                  type: 'success'
                })
                this.addList({ ..._item, type: 'static' })
              })
          } else {
            _promise = this.$api
              .updateStaticArpTable({
                arp_new: _item,
                arp_old: this.getItem(this.editIndex)
              })
              .then(d => {
                this.$message({
                  message: I18N.t('tip.edit_success'),
                  type: 'success'
                })
                this.editList(this.editIndex, _item)
              })
          }
          // 下发命令
          _promise.finally(() => {
            this.isModalShow = false
          })
        }
      })
    },
    onEnableChange() {
      let _enable = this.pageData.bind_enable
      this.setEnableConfig(_enable).catch(() => {
        this.pageData.bind_enable = _enable === '1' ? '0' : '1'
      })
    },
    // 切换arp防护功能
    setEnableConfig(enable) {
      return new Promise((resolve, reject) => {
        let _msg = I18N.t('arp_bind.arp_bind_confirm', {
          status:
            enable === '1' ? I18N.t('phrase.enable') : I18N.t('phrase.disable')
        })
        this.$confirm(_msg, I18N.t('phrase.tip'), { type: 'warning' }).then(
          () => {
            this.$api.setArpmacBind(enable).then(
              () => {
                this.$message(I18N.t('tip.edit1_success'))
                resolve()
              },
              () => {
                reject()
              }
            )
          },
          () => {
            reject()
          }
        )
      })
    },
    onSelectIp(item) {
      if (item.mac) {
        this.modelData.macaddr = item.mac
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
