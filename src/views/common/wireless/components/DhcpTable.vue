<template>
  <div class="white-table mb40">
    <div class="box-header">
      <span class="box-header-tit">
        {{ title }}
      </span>
      <div class="fr" v-if="type !== 'userlist'">
        <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="{fn:onEdit,params:-1}">{{$t('action.add')}}</el-button>
        <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="{fn:onDel,params:-1}">{{$t('action.patch_delete')}}</el-button>
      </div>
    </div>
    <div slot="content">
      <i18n path="tip.max_limit_f">
          <b class="c-warning mlr5">{{limit}}</b>
      </i18n> <small v-if="type=='sercure_intf_list'">{{$t('wifi_comm.sercure_intf_list_tip')}}</small>
    </div>
    <el-table :data="pageList" row-key="`${ip}_${mac}_${intf}`" ref="multipleTable" size="medium" stripe>
      <el-table-column align="center" type="selection" width="50"></el-table-column>
      <template v-if="type == 'sercure_intf_list'||type == 'trust_intf_list'">
        <el-table-column align="center" label="VLAN" prop="intf">
           <template slot-scope="scope">
             {{scope.row.intf == '1' ? $t('wifi_comm.def_vlan'):scope.row.intf}}
           </template>
        </el-table-column>
      </template>
      <template v-if="type == 'trust_intf_list'||type == 'static_ipmac_list'">
        <el-table-column align="center" :label="$t('egw.mac')" prop="mac"></el-table-column>
      </template>
      <template v-if="type == 'static_ipmac_list'">
        <el-table-column align="center" :label="$t('egw.ip')" prop="ip"></el-table-column>
      </template>
      <el-table-column align="center" :label="$t('action.ope')" width="200px">
        <template slot-scope="scope">
          <el-button size="medium" type="text" v-auth="{fn:onEdit,params:[scope.$index,scope.row]}">{{$t('action.edit')}}</el-button>
          <el-button size="medium" type="text" v-auth="{fn:onDel,params:[scope.$index,scope.row]}">{{$t('action.delete')}}</el-button>
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
    <el-dialog :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="600px">
      <el-form :model="modelData" :rules="baseRules" label-width="180px" ref="baseForm" size="medium">
        <template v-if="type == 'sercure_intf_list'||type == 'trust_intf_list'">
          <el-form-item label="VLAN" prop="intf">
            <el-select v-model="modelData.intf">
              <el-option :label="$t('wifi_comm.def_vlan')" value="1"></el-option>
              <el-option
                :key="`vlan_${i}`"
                :label="`${o.vlanid}  ${o.desc ? '（'+o.desc+'）' : ''}`"
                :value="o.vlanid"
                v-for="(o, i) in lans"
              ></el-option>
            </el-select>
          </el-form-item>
        </template>
        <template v-if="type == 'trust_intf_list'||type == 'static_ipmac_list'">
          <el-form-item :label="$t('egw.mac')" prop="mac">
            <el-input class="w220" :placeholder="$t('wan.mac_example')" v-model="modelData.mac"></el-input>
          </el-form-item>
        </template>
        <template v-if="type == 'static_ipmac_list'">
          <el-form-item :label="$t('egw.ip')" prop="ip">
            <el-input class="w220" :placeholder="$t('wan.ip_example')" v-model="modelData.ip"></el-input>
          </el-form-item>
        </template>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="isModalShow = false" size="medium">{{$t('action.cancel')}}</el-button>
        <el-button size="medium" type="primary" v-auth="onSubmit">{{$t('action.confirm')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import formMixins from '@/mixins/formMixins'
import pageMixins from '@/mixins/pageMixins'
import { macValidator } from '@/utils/rules'
import { isIp } from '@/utils/rulesUtils'
export default {
  name: 'DhcpTable',
  props: {
    title: '',
    type: '',
    oppositeMac: {
      default() {
        return []
      },
      type: Array
    },
    dhcplist: {
      default() {
        return []
      },
      type: Array
    }
  },
  mixins: [formMixins, pageMixins],
  data() {
    const sameMacValue = (r, v, cb) => {
      if (v != this.curProp.data.mac && this.propMacMap[v]) return cb(new Error())
      return cb()
    }
    const sameIpValue = (r, v, cb) => {
      if (v != this.curProp.data.ip && this.propIpMap[v]) return cb(new Error())
      return cb()
    }
    const sameIntfValue = (r, v, cb) => {
      if (v != this.curProp.data.intf && this.propIntfMap[v]) return cb(new Error())
      return cb()
    }
    const ipValidate = (r, v, cb) => {
      if (!isIp(v))
        return cb(new Error(this.$t('wan.ip_no_empty')))
      cb()
    }
    return {
      lans: [],
      modalTitle: '',
      isModalShow: false,
      modelData: {},
      curProp: {
        data: {},
        idx: null
      },
      baseRules: {
        intf: [
          { required: true, message: this.$t('wifi_comm.vlan_is_requred') },
          { validator: sameIntfValue, message: this.$t('wifi_comm.vlan_is_has'), trigger: 'blur'}
        ],
        ip: [
          { required: true, message: this.$t('wan.ip_no_empty') },
          { validator: ipValidate },
          { validator: sameIpValue, message: this.$t('egw.auth.ip_or_range_is_duplication') }
        ],
        mac: [
          { required: true, message: this.$t('egw.mac_is_required') },
          { validator: macValidator },
          { validator: sameMacValue, message: this.$t('egw.auth.mac_is_duplication') }
        ]
      }
    }
  },
  computed: {
    isInterface() {
      return this.type == 'sercure_intf_list'
    },
    isServer() {
      return this.type == 'trust_intf_list'
    },
    isClient() {
      return this.type == 'static_ipmac_list'
    },
    limit() {
      return this.isInterface ? 8 : this.isServer ? 8 : 40
    },
    prop() {
      return this.isInterface ? 'sercure_intf_list' : this.isServer ? 'trust_intf_list' : 'static_ipmac_lis'
    },
    propIpMap() {
      let map = {}
      this.dhcplist.forEach(item => {
        map[item.ip] = true
      })
      return map
    },
    propMacMap() {
      let map = {}
      this.dhcplist.forEach(item => {
        map[item.mac] = true
      })
      return map
    },
    propIntfMap() {
      let map = {}
      this.dhcplist.forEach(item => {
        map[item.intf] = true
      })
      return map
    }
  },
  watch: {
    dhcplist: {
      handler(val) {
        this.pageModel.allItem = val
        // this.onCurrentChange(this.pageModel.pageIndex)
      },
      deep: true
    }
  },
  async created() {
    let _net = await this.$api.getNetwork()
    let _lans = _net.lan || []
    this.lans = Object.freeze(_lans.filter(lan => lan.vlanid !== '233'))
  },
  methods: {
    onEdit(idx, data) {
      let isAdd = idx < 0
      if (isAdd && this.dhcplist.length >= this.limit)
        return this.$message.warning(
          `${this.title}`+ this.$t('egw.auth.most_can_any',{num: this.limit})
        )
      this.modalTitle = (isAdd ? this.$t('action.add') : this.$t('action.edit')) + this.title
      this.isModalShow = true
      this.curProp.data = data || {}
      this.curProp.idx = idx >= 0 ? this.getRealIndex(idx) : idx
      this.modelData = Object.assign({}, data)
    },
    onDel(idx, row) {
      let data = []
      if (idx === -1) {
        let selection = this.$refs.multipleTable.selection
        if (!selection.length) {
          return this.$message.warning(this.$t('tip.select_del_item'))
        }
        data = selection
      } else {
        data.push(row)
      }
      this.$confirm(this.$t('tip.confirm_delete')).then(() => {
        this.$emit('delete', this.type, data)
      })
    },
    onSubmit() {
      this.$refs.baseForm.validate(ok => {
        if (ok) {
          this.$emit('edit', this.type, this.modelData, this.curProp)
          this.isModalShow = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
