<template>
  <div class="security-arp">
    <help-alert json-key="arpbindJson" title="MAC绑定IP">
      <div slot="content" v-if="showMacFilter">通过开启ARP防护，并将IP地址和MAC地址绑定，能够增加网络的安全防护功能。</div>
    </help-alert>
    <div class="box">
      <template v-if="showMacFilter">
        <div class="box-header">
          <span class="box-header-tit">ARP防护</span>
        </div>
        <el-form :model="pageData" class="w600" label-width="160px" status-icon>
          <el-form-item label="ARP防护" prop="bind_enable">
            <el-switch @change="onEnableChange" active-value="1" inactive-value="0" v-model="pageData.bind_enable"></el-switch>
            <strong class="vm ml10 c-warning">开启状态下，将只允许绑定了IP的MAC主机访问外网</strong>
          </el-form-item>
          <!-- <el-form-item>
            <el-button class="w160" type="primary" @click="setEnableConfig">保存配置</el-button>
          </el-form-item>-->
        </el-form>
      </template>
      <div class="box-header">
        <span class="box-header-tit">
          IP-MAC绑定列表
          <small></small>
        </span>
        <div class="fr">
          <el-button @click.native="onEdit(-1)" size="small" type="primary">
            <i class="el-icon-plus"></i>
            <span>新增</span>
          </el-button>
          <el-button size="small" type="primary" v-auth="onDel">
            <i class="el-icon-delete"></i>
            <span>批量删除</span>
          </el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{MAX_NUM}}</b>条绑定。
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" row-key="macaddr" size="small" stripe>
        <el-table-column align="center" type="selection" width="50"></el-table-column>
        <el-table-column align="center" label="序号" type="index"></el-table-column>
        <el-table-column align="center" label="MAC地址" prop="macaddr"></el-table-column>
        <el-table-column align="center" label="IP地址" prop="ipaddr"></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button @click.native="onEdit(scope.$index, scope.row)" type="text">修改</el-button>
            <el-button type="text" v-auth="{fn:onDel,params:scope.row}">删除</el-button>
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
        <el-form :model="modelData" :rules="baseRules" label-width="160px" ref="baseForm" status-icon>
          <el-form-item label="IP地址" prop="ipaddr">
            <arp-input @select="onSelectIp" filterType="LAN" placeholder="输入或从ARP列表中选择IP" v-model="modelData.ipaddr"></arp-input>
          </el-form-item>
          <el-form-item label="MAC地址" prop="macaddr">
            <arp-input filterType="LAN" placeholder="输入或从ARP列表中选择MAC" v-model="modelData.macaddr" valueKey="mac"></arp-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false">取 消</el-button>
          <el-button @click="onClickFormBtn" type="primary">确 定</el-button>
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
        cb(new Error('IP地址已配置过'))
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
        cb(new Error('MAC地址已配置过'))
      }
      cb()
    }
    return {
      MAX_NUM: 256,
      title: 'MAC绑定',
      pageData: {},
      editData: {},
      editIndex: -1,
      modelData: model.macbindFn(),
      modalTitle: '',
      isModalShow: false,
      baseRules: {
        ipaddr: [
          { required: true, message: '请输入IP地址' },
          { validator: ipValidator },
          { validator: checkIpaddrUnit }
        ],
        macaddr: [
          { required: true, message: '请输入MAC地址' },
          { validator: macValidator },
          { validator: checkMacUnit }
        ]
      }
    }
  },
  mixins: [pageMixins, formMixins],
  components: {
    ArpInput
  },
  computed: {
    showMacFilter() {
      return this.$store.getters.roles.includes('egEnable')
    }
  },
  created() {},
  methods: {
    async _loadList() {
      let _res = await this.$api.getStaticArpTable()
      this.MAX_NUM = +_res.maxLen || 256
      this.pageData = _res
      return _res.arp_static || []
    },
    onDel(item) {
      let _items = []
      if (item) {
        _items = [item]
      } else {
        _items = this.$refs.baseTable.selection
        if (_items.length === 0) {
          return this.$message.warning('请选择要删除的列表项')
        }
      }

      this.$confirm('是否确认删除？').then(() => {
        this.$api.delStaticArpTable({ arp_list: _items }).then(d => {
          this.$message({
            message: '删除成功',
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
    onEdit(idx, row = model.macbindFn()) {
      let isAdd = idx < 0
      if (isAdd && this.pageTotal >= this.MAX_NUM) {
        return this.$message.warning(
          `${this.title}最多只能添加 ${this.MAX_NUM} 条数据`
        )
      }
      this.editIndex = idx
      let title = (isAdd ? '新增' : '修改') + this.title
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
                  message: '添加成功',
                  type: 'success'
                })
                this.addList(_item)
              })
          } else {
            _promise = this.$api
              .updateStaticArpTable({
                arp_new: _item,
                arp_old: this.getItem(this.editIndex)
              })
              .then(d => {
                this.$message({
                  message: '编辑成功',
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
        let _msg = `是否确认${enable === '1' ? '开启' : '关闭'}ARP防护`
        this.$confirm(_msg, '提示', { type: 'warning' }).then(
          () => {
            this.$api.setArpmacBind(enable).then(
              () => {
                this.$message('配置成功')
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
