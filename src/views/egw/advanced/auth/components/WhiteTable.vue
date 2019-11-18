<template>
  <div class="white-table mb40">
    <div class="box-header">
      <span class="box-header-tit">
        {{ title }}
        <small></small>
      </span>
      <div class="fr">
        <el-button size="small" type="primary" v-auth="{fn:onEdit,params:-1}">
          <i class="el-icon-plus"></i>
          <span>新增</span>
        </el-button>
        <el-button size="small" type="primary" v-auth="{fn:onDel,params:-1}">
          <i class="el-icon-delete"></i>
          <span>批量删除</span>
        </el-button>
      </div>
    </div>
    <help-alert :show-icon="false" title>
      <div slot="content">
        最大支持配置
        <b class="c-warning mlr5">{{limit}}</b>条。
      </div>
    </help-alert>
    <el-table :data="pageList" :row-key="row=>row" ref="multipleTable" size="small" tooltip-effect="dark">
      <el-table-column align="center" type="selection" width="50"></el-table-column>
      <template v-if="type == 'url'">
        <el-table-column align="center" label="免认证网址">
          <template slot-scope="scope">{{scope.row}}</template>
        </el-table-column>
      </template>
      <template v-else-if="type == 'mac' || type == 'deny_mac'">
        <el-table-column align="center" label="MAC地址">
          <template slot-scope="scope">{{scope.row}}</template>
        </el-table-column>
      </template>
      <template v-else>
        <el-table-column align="center" label="IP地址/范围">
          <template slot-scope="scope">{{scope.row}}</template>
        </el-table-column>
      </template>
      <el-table-column align="center" label="操作" width="200px">
        <template slot-scope="scope">
          <el-button type="text" v-auth="{fn:onEdit,params:[scope.$index,scope.row]}">修改</el-button>
          <el-button type="text" v-auth="{fn:onDel,params:[scope.$index,scope.row]}">删除</el-button>
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
      <el-form :model="modelData" :rules="baseRules" label-width="110px" ref="baseForm">
        <el-form-item label v-show="false">
          <el-input></el-input>
        </el-form-item>
        <template v-if="isUrl">
          <el-form-item label="免认证网址" prop="url">
            <el-input class="w220" v-model="modelData.url"></el-input>
          </el-form-item>
        </template>
        <template v-else-if="isMac">
          <el-form-item label="MAC地址" prop="mac">
            <el-input class="w220" placeholder="格式：00:11:22:33:44:55" v-model="modelData.mac"></el-input>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="IP地址/范围" prop="ip">
            <el-input class="w220" placeholder="范围格式：1.1.1.1-1.1.1.100" v-model="modelData.ip"></el-input>
          </el-form-item>
        </template>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="onClickFormBtn(false)">取 消</el-button>
        <el-button @click="onClickFormBtn(true)" type="primary">确 定</el-button>
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
      if (!isUrl(v) || isIp(v)) return cb(new Error('请输入有效的网址'))
      return cb()
    }
    const ipValidate = (r, v, cb) => {
      if (!isIp(v) && !isIpRange(v))
        return cb(new Error('请输入正确的IP地址或范围'))
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
          { required: true, message: '请输入免认证网址' },
          { validator: urlValidate },
          { validator: sameValue, message: '网址已存在' }
        ],
        ip: [
          { required: true, message: '请输入IP地址或范围' },
          { validator: ipValidate },
          { validator: isExistIpRange, message: 'IP地址或范围重复' }
        ],
        mac: [
          { required: true, message: '请输入MAC地址' },
          { validator: macValidator },
          { validator: sameValue, message: 'MAC地址已存在黑名单或白名单中' }
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
          `${this.title}最多只能添加 ${this.limit} 条数据`
        )
      this.modalTitle = (isAdd ? '新增' : '修改') + this.title
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
          return this.$message.warning('请选择要删除的列表项')
        }
        data = selection
      } else {
        data.push(row)
      }
      this.$confirm('是否确认删除？').then(() => {
        this.$emit('delete', this.type, data)
      })
    },
    onClickFormBtn(isConfirm) {
      if (!isConfirm) return (this.isModalShow = false)

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
