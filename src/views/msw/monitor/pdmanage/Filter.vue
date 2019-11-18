<template>
  <div class="port-mac-filter">
    <help-alert title="过滤MAC地址">
      <div slot="content">
        <b>说明：</b> 交换机在转发数据时，需要根据MAC地址表来做出相应转发，当在配置的VLAN中接收到源地址或目的地址为配置的MAC地址时，将丢弃此报文，不进行转发。应用场景如某个用户发起ARP攻击时，可以将其配置为过滤地址，防止攻击。
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">MAC列表</span>
        <div class="fr">
          <el-button icon="el-icon-plus" size="small" type="primary" v-auth="_onAdd">添加过滤地址</el-button>
          <el-button icon="el-icon-delete" size="small" type="danger" v-auth="_onPatchRemove">删除过滤地址</el-button>
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持配置
          <b class="c-warning mlr5">{{maxLimit}}</b>条。
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" size="small" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column align="center" label="MAC地址" prop="macaddr"></el-table-column>
        <el-table-column align="center" label="VLAN ID" prop="vlanid"></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row}">
            <el-button
              class="c-danger"
              size="mini"
              type="text"
              v-auth="{fn:_onPatchRemove,params:{vlanid:row.vlanid,macaddr:row.macaddr}}"
            >删除</el-button>
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
        hide-on-single-page
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
      <!--basemodal -->
      <el-dialog
        :close-on-click-modal="false"
        :visible.sync="baseModalShow"
        @open="_clearValidate"
        append-to-body
        title="添加过滤地址"
        width="650px"
      >
        <el-form :model="baseModel" :rules="baseRules" label-width="180px" ref="baseForm" size="small">
          <el-form-item label="MAC地址：" prop="macaddr">
            <el-input class="w200" placeholder="格式如：00:11:22:33:44:55" v-model="baseModel.macaddr"></el-input>
          </el-form-item>
          <el-form-item label="VLAN ID：" prop="vlanid">
            <el-input class="w200" placeholder="请输入VLAN ID" v-model="baseModel.vlanid"></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click.native="baseModalShow = false" size="small">取 消</el-button>
          <el-button :loading="isLoading" @click.native="_onModalConfirm" size="small" type="primary">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/msw/pageMixins'
import formMixins from '@/mixins/formMixins'
import PortPanel from '@/common/PortPanel'
import { vlanidValidator, macStrictValidator } from '@/utils/rules'
import { isBetween } from '@/utils/rulesUtils'
import { macBase } from '@/model/msw/port'
import { mapGetters } from 'vuex'
export default {
  name: 'port-mac-filter',
  mixins: [pageMixins, formMixins],
  components: {
    [PortPanel.name]: PortPanel
  },
  data() {
    const macCheckOwnerValidator = (r, v, cb) => {
      if (v === '') {
        return cb()
      }
      if (v.toLowerCase() === this.sysinfo.sys_mac.toLowerCase()) {
        return cb(new Error(`${v}为设备MAC，不可配置`))
      }
      cb()
    }
    return {
      baseModel: macBase(),
      baseRules: {
        vlanid: [
          { required: true, message: '请输入VLAN ID' },
          { validator: vlanidValidator, message: 'VLAN ID格式错误' }
        ],
        macaddr: [
          { required: true, message: '请输入MAC地址' },
          { validator: macStrictValidator },
          { validator: macCheckOwnerValidator }
        ]
      },
      baseModalShow: false,
      isLoading: false,
      editIndex: -1,
      maxLimit: window.APP_CAPACITY_SW.mac.filter
    }
  },
  computed: {
    ...mapGetters('switcher', ['piMap']),
    ...mapGetters(['sysinfo'])
  },
  methods: {
    // 加载port列表
    async _loadList(query) {
      try {
        let _result = await this.$api.cmd(
          'devConfig.get',
          {
            module: 'filter_mac',
            data: query
          },
          { noParse: false }
        )
        let _list = (_result.list || []).map(lis => {
          return {
            ...lis,
            interface: this.piMap[lis.lpid]
          }
        })
        return _list
      } catch (error) {
        return []
      }
    },
    // 添加
    _onAdd() {
      if (this.pageModel.allItem.length === this.maxLimit) {
        this.$alert('过滤MAC已配置最大容量', { type: 'warning' })
        return
      }
      this.baseModalShow = true
      this.baseModel = macBase()
    },
    // 批量删除
    async _onPatchRemove(item) {
      let _macs = item
        ? [item]
        : this.$refs.baseTable.selection.map(s => ({
            vlanid: s.vlanid,
            macaddr: s.macaddr
          }))
      if (!_macs.length) {
        return this.$message.warning('请选择要删除的列表项')
      }
      await this.$confirm(`是否确认删除？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      try {
        await this.$api.cmd('devConfig.del', {
          module: 'filter_mac',
          data: {
            list: _macs
          }
        })
        this.refresh()
        this.$message.success('删除成功')
      } catch (error) {}
    },
    // 检查配置是否有效
    _compareConfIsValid() {
      let _model = this.baseModel
      let _isExist = this.pageModel.allItem.findIndex(item => {
        return (
          item.vlanid === _model.vlanid &&
          item.macaddr.toLowerCase() === _model.macaddr.toLowerCase()
        )
      })
      return _isExist === -1
    },
    // modal提交
    _onModalConfirm() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          if (!this._compareConfIsValid()) {
            this.$alert('该配置已存在，请重新配置', { type: 'error' })
            return
          }
          this.isLoading = true
          try {
            await this.$api.cmd('devConfig.add', {
              module: 'filter_mac',
              data: this.baseModel
            })
            this.baseModalShow = false
            this.refresh()
            this.$message.success('添加成功')
          } catch (error) {}
          this.isLoading = false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.port-mac-filter {
}
</style>

