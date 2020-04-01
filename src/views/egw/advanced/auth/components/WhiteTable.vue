<template>
  <div class="white-table mb40">
    <div class="box-header">
      <span class="box-header-tit">
        {{ title }}
        <small></small>
      </span>
      <div class="fr">
        <el-button icon="el-icon-plus" plain size="medium" type="primary" v-auth="{fn:onEdit,params:-1}">{{$t('action.add')}}</el-button>
        <el-button icon="el-icon-delete" plain size="medium" type="primary" v-auth="{fn:onDel,params:-1}">{{$t('action.patch_delete')}}</el-button>
      </div>
    </div>
    <help-alert :show-icon="false" title>
      <div slot="content">
        <i18n path="egw.limit_num_tip">
            <b class="c-warning mlr5">{{limit}}</b>
        </i18n>
      </div>
    </help-alert>
    <el-table :data="pageList" :row-key="row=>row" ref="multipleTable" size="medium" stripe>
      <el-table-column align="center" type="selection" width="50"></el-table-column>
      <template v-if="type == 'url'">
        <el-table-column align="center" :label="$t('egw.auth.white_url')">
          <template slot-scope="scope">{{scope.row}}</template>
        </el-table-column>
      </template>
      <template v-else-if="type == 'mac' || type == 'deny_mac'">
        <el-table-column align="center" :label="$t('egw.mac')">
          <template slot-scope="scope">{{scope.row}}</template>
        </el-table-column>
      </template>
      <template v-else>
        <el-table-column align="center" :label="$t('egw.auth.range_by_ip')">
          <template slot-scope="scope">{{scope.row}}</template>
        </el-table-column>
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
    <el-dialog :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="400px">
      <el-form :model="modelData" :rules="baseRules" label-width="110px" ref="baseForm" size="medium">
        <el-form-item label v-show="false">
          <el-input></el-input>
        </el-form-item>
        <template v-if="isUrl">
          <el-form-item :label="$t('egw.auth.white_url')" prop="url">
            <el-input class="w220" v-model="modelData.url"></el-input>
          </el-form-item>
        </template>
        <template v-else-if="isMac">
          <el-form-item :label="$t('egw.mac')" prop="mac">
            <el-input class="w220" :placeholder="$t('wan.mac_example')" v-model="modelData.mac"></el-input>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item  :label="$t('egw.auth.range_by_ip')" prop="ip">
            <el-input class="w220" :placeholder="$t('wan.ip_range_example')" v-model="modelData.ip"></el-input>
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
import { isIp, ipToLong, isIpRange, isUrl } from '@/utils/rulesUtils'
export default {
  name: 'WhiteTable',
  props: {
    title: '',
    type: '',
    oppositeMac: {
      default() {
        return []
      },
      type: Array
    },
    whitelist: {
      default() {
        return []
      },
      type: Array
    }
  },
  mixins: [formMixins, pageMixins],
  data() {
    const sameValue = (r, v, cb) => {
      if (v != this.curProp.data && this.propMap[v]) return cb(new Error())
      return cb()
    }
    const urlValidate = (r, v, cb) => {
      if (!isUrl(v) || isIp(v)) return cb(new Error(this.$t('egw.auth.effective_url')))
      return cb()
    }
    const ipValidate = (r, v, cb) => {
      if (!isIp(v) && !isIpRange(v))
        return cb(new Error(this.$t('egw.ip_or_range_is_required')))
      cb()
    }
    const isExistIpRange = (r, v, cb) => {
      let ipRange = this.getIpStartAndIpEnd(v)
      for (let i = 0; i < this.whitelist.length; i++) {
        let curAuthLessData = this.whitelist[i]
        if (
          this.curProp.idx == i ||
          (!isIpRange(curAuthLessData) && !isIp(curAuthLessData))
        ) {
          continue
        } else {
          let oldIpRange = this.getIpStartAndIpEnd(this.whitelist[i])
          if (
            !(
              ipToLong(ipRange.ipEnd) < ipToLong(oldIpRange.ipStart) ||
              ipToLong(ipRange.ipStart) > ipToLong(oldIpRange.ipEnd)
            )
          )
            return cb(new Error())
        }
      }
      cb()
    }
    return {
      modalTitle: '',
      isModalShow: false,
      modelData: {},
      curProp: {
        data: '',
        idx: null
      },
      baseRules: {
        url: [
          { required: true, message: this.$t('egw.auth.white_url_required') },
          { validator: urlValidate },
          { validator: sameValue, message: this.$t('egw.auth.url_is_duplication') }
        ],
        ip: [
          { required: true, message: this.$t('egw.ip_or_range_is_required') },
          { validator: ipValidate },
          { validator: isExistIpRange, message: this.$t('egw.auth.ip_or_range_is_duplication') }
        ],
        mac: [
          { required: true, message: this.$t('egw.mac_is_required') },
          { validator: macValidator },
          { validator: sameValue, message: this.$t('egw.auth.mac_is_duplication') }
        ]
      }
    }
  },
  computed: {
    isIp() {
      return this.type == 'srcip' || this.type == 'dstip'
    },
    isUrl() {
      return this.type == 'url'
    },
    isMac() {
      return this.type == 'deny_mac' || this.type == 'mac'
    },
    limit() {
      return this.isIp ? 50 : this.isUrl ? 100 : 250
    },
    prop() {
      return this.isIp ? 'ip' : this.isUrl ? 'url' : 'mac'
    },
    propMap() {
      let map = {}
      this.whitelist.forEach(item => {
        map[item] = true
      })
      this.oppositeMac.forEach(item => {
        map[item] = true
      })
      return map
    }
  },
  watch: {
    whitelist: {
      handler(val) {
        this.pageModel.allItem = val
        // this.onCurrentChange(this.pageModel.pageIndex)
      },
      deep: true
    }
  },
  methods: {
    getIpStartAndIpEnd(v) {
      return {
        ipStart: isIp(v) ? v : v.split(/\s*-\s*/)[0],
        ipEnd: isIp(v) ? v : v.split(/\s*-\s*/)[1]
      }
    },
    onEdit(idx, data) {
      let isAdd = idx < 0
      if (isAdd && this.whitelist.length >= this.limit)
        return this.$message.warning(
          `${this.title}`+ this.$t('egw.auth.most_can_any',{num: this.limit})
        )
      this.modalTitle = (isAdd ? this.$t('action.add') : this.$t('action.edit'))
      this.isModalShow = true
      this.curProp.data = data || ''
      this.curProp.idx = idx >= 0 ? this.getRealIndex(idx) : idx
      this.modelData = Object.assign({}, this.getModelDataProp(data))
    },
    getModelDataProp(data) {
      let o = {}
      o[this.prop] = data
      return o
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
          this.$emit('edit', this.type, this.modelData[this.prop], this.curProp)
          this.isModalShow = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
