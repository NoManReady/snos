<template>
  <div class="port-mac-list">
    <help-alert title="MAC地址表"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">MAC列表</span>
        <el-form :model="baseModel" :rules="baseRules" class="fr inline-tip" inline inline-message ref="baseForm" size="mini">
          <el-form-item>
            <el-select class="w140" v-model="searchType">
              <el-option label="按MAC查询" value="macaddr"></el-option>
              <el-option label="按VLAN查询" value="vlanid"></el-option>
              <el-option label="按端口查询" value="lpid"></el-option>
              <!-- <el-option label="按MAC地址类型" value="mactype"></el-option> -->
            </el-select>
          </el-form-item>
          <template v-if="searchType==='macaddr'">
            <el-form-item prop="macaddr">
              <el-input class="w160" placeholder="格式如：00:11:22:33:44:55" v-model="baseModel.macaddr"></el-input>
            </el-form-item>
          </template>
          <template v-if="searchType==='vlanid'">
            <el-form-item prop="vlanid">
              <el-input class="w160" placeholder="请输入VLAN ID" v-model="baseModel.vlanid"></el-input>
            </el-form-item>
          </template>
          <template v-if="searchType==='lpid'">
            <el-form-item prop="lpid">
              <el-select class="w160" v-model="baseModel.lpid">
                <el-option label="全部" value></el-option>
                <el-option :key="port.lpid" :label="port.interface" :value="port.lpid" v-for="port in allTypePorts"></el-option>
              </el-select>
            </el-form-item>
          </template>
          <!-- <template v-if="searchType==='mactype'">
            <el-form-item prop="type">
              <el-select class="w160" v-model="baseModel.type">
                <el-option :value="0" label="静态MAC地址"></el-option>
                <el-option :value="1" label="动态MAC地址"></el-option>
                <el-option :value="2" label="过滤MAC地址"></el-option>
              </el-select>
            </el-form-item>
          </template>-->
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" v-auth="_onSearch">搜索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          最大支持
          <b class="c-warning mlr5">{{maxLimit/1024}}K</b>条。
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" size="small" stripe>
        <el-table-column align="center" label="序号" prop="order" width="60"></el-table-column>
        <el-table-column align="center" label="MAC" prop="m"></el-table-column>
        <el-table-column align="center" label="VLAN ID" prop="v"></el-table-column>
        <el-table-column align="center" label="端口" prop="i"></el-table-column>
        <el-table-column align="center" label="类型">
          <template slot-scope="{row}">{{row.t===0?'静态':(row.t===1?'动态':'过滤')}}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.index"
        :page-size="pageModel.size"
        :page-sizes="pageModel.sizes"
        :total="pageModel.total"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
        background
        class="mt20"
        hide-on-single-page
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
    </div>
  </div>
</template>
<script>
import pagePlusMixins from '@/mixins/msw/pagePlusMixins'
import { mapGetters } from 'vuex'
import { vlanidValidator, macValidator } from '@/utils/rules'
import { macBase } from '@/model/msw/port'
export default {
  name: 'port-mac-list',
  mixins: [pagePlusMixins],
  data() {
    return {
      queryKey: 'baseModel',
      searchType: 'macaddr',
      baseModel: macBase(),
      baseRules: {
        vlanid: [{ validator: vlanidValidator, message: 'VLAN ID格式错误' }],
        macaddr: [{ validator: macValidator }]
      },
      maxLimit: window.APP_CAPACITY_SW.mac.total
    }
  },
  computed: {
    ...mapGetters('switcher', ['logicPort', 'lagPort']),
    // 所有port（包含聚合口）
    allTypePorts() {
      return [...this.logicPort, ...this.lagPort]
    }
  },
  watch: {
    searchType() {
      this.baseModel = macBase()
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate()
      })
    }
  },
  methods: {
    // 加载port列表
    async _loadList(query) {
      try {
        let _result = await this.$api.cmd(
          'devSta.get',
          {
            module: 'show_mac',
            data: query
          },
          { timeout: 0 }
        )
        _result.list = Object.freeze(
          _result.list.map((lis, i) => {
            return {
              ...lis,
              order: i + 1 + (this.pageModel.index - 1) * this.pageModel.size
            }
          })
        )
        return _result
      } catch (error) {
        return { total: 0, list: [] }
      }
    },
    // 搜索数据
    _onSearch() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.doQuery()
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.port-mac-list {
}
</style>

