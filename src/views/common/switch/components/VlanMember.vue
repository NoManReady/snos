<template>
  <div class="switch-vmember" v-loading="isLoading">
    <el-form :model="baseModel" :rules="baseRules" @submit.native.prevent class="w320 fr" ref="baseForm" size="mini">
      <el-form-item prop="vid">
        <el-input
          :title="baseModel.vid"
          @keydown.enter.native="_onSubmit"
          class="vm w160"
          placeholder="请输入VLAN ID"
          v-model="baseModel.vid"
        ></el-input>
        <el-button :disabled="!baseModel.vid" @click.native="_onSubmit" type="primary">添加</el-button>
        <el-button :disabled="selectVids.length==0" @click.native="_onDelVlan(selectVids)" type="danger">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="list"
      :max-height="160"
      @selection-change="_handleSelectChange"
      align="center"
      border
      header-align="center"
      ref="vlanTable"
      size="mini"
      style="width: 100%"
    >
      <el-table-column :selectable="_isSelectable" type="selection" width="55"></el-table-column>
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">{{scope.$index+1}}</template>
      </el-table-column>
      <el-table-column align="center" label="VLAN ID" prop="vid"></el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template slot-scope="scope">
          <el-button :disabled="scope.row.used!==0" @click.native="_onDelVlan([scope.row.vid])" size="mini" type="text">
            <small>删除</small>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { isBetween, intValidate } from '@/utils/rulesUtils'
import { mapGetters } from 'vuex'
export default {
  name: 'switch-vmember',
  data() {
    const vlanValidate = (r, v, cb) => {
      if (!v) {
        cb()
      }
      if (!intValidate(v)) return cb(new Error('请输入整数'))
      if (!isBetween(v, 1, 4094))
        return cb(new Error('请输入有效的VLAN ID（1~4094）'))
      cb()
    }
    return {
      isLoading: false,
      list: [],
      selectVids: [],
      baseModel: {
        vid: ''
      },
      baseRules: {
        vid: [
          {
            validator: vlanValidate
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('switch', ['item'])
  },
  created() {
    this._load()
  },
  methods: {
    // 加载vlan成员列表
    async _load() {
      this.isLoading = true
      let _result = await this.$api.switchApi(
        'doSwitchApi',
        {
          ip: this.item.ip,
          sn: this.item.devSN,
          method: 'get',
          url: 'rest_get_vlan_list.cgi'
        },
        { isSilence: true }
      )
      this.isLoading = false
      this.list = _result
    },
    // 判断是否可编辑
    _isSelectable(row, index) {
      return row.used === 0
    },
    // 多选
    _handleSelectChange(vlans) {
      this.selectVids = Object.freeze(vlans.map(vlan => vlan.vid))
    },
    // 删除vlan成员
    async _onDelVlan(vids) {
      let data = vids.map(vid => `vlanid=${vid}`).join('&')
      let _result = await this.$api.switchApi('doSwitchApi', {
        ip: this.item.ip,
        sn: this.item.devSN,
        method: 'post',
        url: 'vlan_p.cgi?cmd=vlan_entry_del',
        data
      })
      this.list = this.list.filter(lis => {
        return !vids.includes(lis.vid)
      })
      this.$message({
        type: 'success',
        message: 'VLAN删除成功'
      })
    },
    // vlan id添加
    async _onSubmit() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let data = { vlanid: this.baseModel.vid }
          let _result = await this.$api.switchApi('doSwitchApi', {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            url: 'vlan_p.cgi?cmd=vlan_entry_add',
            data
          })
          this.list.push({ vid: this.baseModel.vid, used: 0 })
          this.$refs.baseForm.resetFields()
          this.$message({
            type: 'success',
            message: 'VLAN添加成功'
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.switch-vmember {
}
</style>
