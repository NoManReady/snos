<template>
  <div class="port-mac-list">
    <!-- <help-alert title="MAC地址表"></help-alert> -->
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{$t('msw.mac.mac_addr')}}</span>
        <el-form
          :model="baseModel"
          :rules="baseRules"
          class="fr inline-tip view-form"
          inline
          inline-message
          ref="baseForm"
          size="medium"
        >
          <el-form-item>
            <el-select class="w200" v-model="searchType">
              <el-option :label="$t('msw.mac.search_by_mac')" value="macaddr"></el-option>
              <el-option :label="$t('msw.mac.search_by_vlan')" value="vlanid"></el-option>
              <el-option :label="$t('msw.mac.search_by_port')" value="lpid"></el-option>
              <!-- <el-option label="按MAC地址类型" value="mactype"></el-option> -->
            </el-select>
          </el-form-item>
          <template v-if="searchType==='macaddr'">
            <el-form-item prop="macaddr">
              <el-input :placeholder="$t('wan.mac_example')" class="w200" v-model="baseModel.macaddr"></el-input>
            </el-form-item>
          </template>
          <template v-if="searchType==='vlanid'">
            <el-form-item prop="vlanid">
              <el-input :placeholder="$t('msw.vlan_no_empty')" class="w170" v-model="baseModel.vlanid"></el-input>
            </el-form-item>
          </template>
          <template v-if="searchType==='lpid'">
            <el-form-item prop="lpid">
              <el-select class="w140" v-model="baseModel.lpid">
                <el-option :label="$t('phrase.all')" value></el-option>
                <el-option :key="port.lpid" :label="port.ifname" :value="port.lpid" v-for="port in allTypePorts"></el-option>
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
            <el-button icon="el-icon-search" plain type="primary" v-auth="_onSearch">{{$t('phrase.search')}}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="msw.limit_tip">
            <b class="c-warning mlr5">{{maxLimit/1024}}K</b>
          </i18n>
        </div>
      </help-alert>
      <el-table :data="pageList" ref="baseTable" size="medium" stripe>
        <el-table-column :label="$t('phrase.serial')" align="center" prop="order" width="60"></el-table-column>
        <el-table-column align="center" label="MAC" prop="m"></el-table-column>
        <el-table-column align="center" label="VLAN ID" prop="v"></el-table-column>
        <el-table-column :label="$t('msw.port')" align="center" prop="i"></el-table-column>
        <el-table-column :label="$t('phrase.type')" align="center">
          <template slot-scope="{row}">{{row.t===0?$t('msw.mac.static'):(row.t===1?$t('msw.mac.dynamic'):$t('msw.mac.filter'))}}</template>
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
        // vlanid: [{ validator: vlanidValidator, message: 'VLAN ID格式错误' }],
        // macaddr: [{ validator: macValidator }]
      },
      maxLimit: window.APP_CAPACITY_SW.mac.total
    }
  },
  computed: {
    ...mapGetters('switcher', ['logicPort', 'lagPort', 'piMap']),
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
              i: this.piMap[lis.l],
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

