<template>
  <div class="switch-macsearch">
    <el-form :model="baseModel" :rules="baseRules" label-width="100px" ref="baseForm" size="mini">
      <el-row :gutter="0">
        <el-col :span="12">
          <el-form-item label="MAC地址" prop="mac">
            <el-input :title="baseModel.mac" class="vm w150" placeholder="00:00:00:00:00:00" v-model="baseModel.mac"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="VLAN ID" prop="vlan" v-if="vmode==='1'">
            <el-input :title="baseModel.vlan" class="vm w120" placeholder="1~4094" v-model="baseModel.vlan"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button @click.native="_onSearch" type="primary">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="macList"
      :max-height="200"
      align="center"
      border
      header-align="center"
      ref="vlanTable"
      size="mini"
      style="width: 100%"
    >
      <el-table-column align="center" label="MAC地址" prop="mac"></el-table-column>
      <el-table-column align="center" label="VLAN ID" prop="vid" v-if="vmode==='1'" width="100"></el-table-column>
      <el-table-column align="center" label="类型" prop="type" width="100"></el-table-column>
      <el-table-column align="center" label="端口" prop="port" width="100"></el-table-column>
    </el-table>
  </div>
</template>
<script>
import { Row, Col } from 'element-ui'
import { macValidator } from '@/utils/rules'
import { isBetween, intValidate } from '@/utils/rulesUtils'
import { mapGetters } from 'vuex'
export default {
  name: 'switch-macsearch',
  components: {
    [Row.name]: Row,
    [Col.name]: Col
  },
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
      macList: [],
      baseModel: {
        mac: '',
        vlan: ''
      },
      baseRules: {
        vlan: [{ validator: vlanValidate }]
      }
    }
  },
  mounted() {
    this._onSearch()
  },
  computed: {
    ...mapGetters('switch', ['item', 'vmode'])
  },
  methods: {
    // 添加MAC
    _onSearch() {
      this.$refs.baseForm.validate(async valid => {
        if (valid) {
          let _postData = {
            ...this.baseModel
          }
          if (this.vmode === '0') {
            delete _postData.vlan
          }
          let _result = await this.$api.switchApi('doSwitchApi', {
            ip: this.item.ip,
            sn: this.item.devSN,
            method: 'post',
            data: _postData,
            url: 'mac.cgi?cmd=search'
          })
          this.macList = _result
          this.$refs.baseForm.resetFields()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.switch-macsearch {
  min-height: 200px;
}
</style>
