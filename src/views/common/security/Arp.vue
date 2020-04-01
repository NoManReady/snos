<template>
  <div class="security-arp">
    <help-alert :json-key="showMacFilter ? 'arpJson' : 'arpJsonLite'" :title="$t('arp.list')">
      <div slot="content">
        <p class="mt10 mb10">{{ $t("arp.arp_tip") }}</p>
        <i18n path="arp.arp_help" tag="p">
          <a @click="onToPag('admin/alone/security/security_arpbind')" class="c-success pointer">{{ $t("arp.mac_bind") }}</a>
          <i18n path="arp.arp_help1" tag="span">
            <a @click="onToPag('admin/alone/security/security_macfilter')" class="c-success pointer">{{ $t("arp.mac_filter") }}</a>
          </i18n>
        </i18n>
      </div>
      <div slot="collapseFoot">
        <h3>{{ $t("phrase.notice_f") }}</h3>
        <p v-if="showMacFilter">{{ $t("arp.arp_bind_tip1") }}</p>
        <p v-else>{{ $t("arp.arp_bind_tip2") }}</p>
      </div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{ $t("arp.list") }}
          <small></small>
        </span>
        <div class="fr">
          <el-input :placeholder="$t('arp.search_by_ipmac')" class="w240 mr10" clearable size="medium" v-model="filter">
            <el-button @click.native="_initPage" icon="el-icon-search" size="medium" slot="append"></el-button>
          </el-input>
          <el-button
            @click.native="_onRefresh"
            icon="el-icon-refresh"
            plain
            size="medium"
            type="primary"
          >{{ $t("action.refresh") }}</el-button>
          <el-button plain size="medium" type="primary" v-auth="onAdd">
            {{
            $t("arp.patch_bind")
            }}
          </el-button>
          <el-button plain size="medium" type="primary" v-auth="onAddFilter" v-if="showMacFilter">{{ $t("arp.patch_filter") }}</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="baseTable" row-key="`${ip}_${mac}`" size="medium" stripe>
        <el-table-column :selectable="isSelectable" align="center" type="selection" width="50"></el-table-column>
        <el-table-column :label="$t('phrase.serial')" align="center" type="index"></el-table-column>
        <el-table-column :label="$t('sysinfo.ip_addr')" align="center" min-width="120px" prop="ip"></el-table-column>
        <el-table-column :label="$t('sysinfo.mac_addr')" align="center" min-width="120px" prop="mac"></el-table-column>
        <el-table-column :label="$t('phrase.status')" align="center" min-width="160px">
          <template slot-scope="scope">
            <div class="w70 inline">
              <el-button :loading="true" size="medium" type="text" v-if="isLoadMacBind"></el-button>
              <el-button
                :title="$t('arp.add_to_bind')"
                size="medium"
                type="text"
                v-auth="{ fn: onAdd, params: scope.row }"
                v-else-if="!isStaticArp(scope.row)"
              >{{ $t("arp.mac_bind") }}</el-button>
              <el-button :disabled="true" size="medium" type="text" v-else>
                {{
                $t("arp.had_bind")
                }}
              </el-button>
            </div>
            <div class="w70 inline" v-if="showMacFilter">
              <el-button :loading="true" size="medium" type="text" v-if="isLoadMacFilter"></el-button>
              <el-button
                :title="$t('arp.add_to_filter')"
                size="medium"
                type="text"
                v-auth="{ fn: onAddFilter, params: scope.row }"
                v-else-if="!isMacFilter(scope.row)"
              >{{ $t("arp.mac_filter") }}</el-button>
              <el-button :disabled="true" size="medium" type="text" v-else>
                {{
                $t("arp.has_filter")
                }}
              </el-button>
            </div>
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
    </div>
  </div>
</template>
<script>
import pageMixins from '@/mixins/pageMixins'
export default {
  name: 'SecurityArp',
  data() {
    return {
      arpStaticList: [],
      arpStaticMax: 256,
      arpFilterList: [],
      arpFilterMax: 80,
      isLoadMacBind: true,
      isLoadMacFilter: true,
      filter: ''
    }
  },
  mixins: [pageMixins],
  computed: {
    arpStaticMap() {
      return (
        this.arpStaticList.map(item => item.macaddr.toLocaleUpperCase()) || []
      )
    },
    macFilterMap() {
      return this.arpFilterList.map(item => item.mac.toLocaleUpperCase()) || []
    },
    showMacFilter() {
      return (
        this.$store.getters.roles.includes('egEnable') &&
        !this.$roles().includes('ehr')
      )
    }
  },
  methods: {
    async _loadList() {
      let _result = await this.$api.getArpTable()
      if (!this.filter) {
        this.getArpStatic()
        if (this.showMacFilter) {
          this.getMacFilter()
        }
      }
      return _result.filter(arp => {
        return (
          arp.ip.indexOf(this.filter) > -1 || arp.mac.indexOf(this.filter) > -1
        )
      })
    },
    _onRefresh() {
      this.filter = ''
      this._initPage()
    },
    getArpStatic() {
      return new Promise(async (res, rej) => {
        let _data = await this.$api.getStaticArpTable()
        this.arpStaticList = _data.arp_static || []
        this.arpStaticMax = +(_data.maxLen || 256)
        this.isLoadMacBind = false
      })
    },
    getMacFilter() {
      return new Promise(async (res, rej) => {
        let _data = await this.$api.getMacFilter()
        this.arpFilterList = _data.list || []
        this.arpFilterMax = +(_data.maxLen || 80)
        this.isLoadMacFilter = false
      })
    },
    onAdd(item) {
      let _items = []
      if (item) {
        _items = [item]
      } else {
        _items = this.$refs.baseTable.selection
        if (_items.length === 0) {
          return this.$message.warning(I18N.t('arp.select_ip_mac_bind'))
        }
      }
      _items = _items.filter(ite => !this.isStaticArp(ite))
      if (_items.length === 0) {
        return this.$message.warning(I18N.t('arp.ip_mac_binded'))
      }
      let _leftNum = this.arpStaticMax - this.arpStaticList.length
      if (_items.length > _leftNum) {
        return this.$message.warning(
          I18N.t('arp.bind_limit', {
            max: this.arpStaticMax,
            has: this.arpStaticList.length,
            stay: _leftNum
          })
        )
      }
      this.$confirm(I18N.t('arp.bind_confirm')).then(() => {
        let _addList = _items.map(item => ({
          macaddr: item.mac,
          ipaddr: item.ip
        }))
        this.$api.addStaticArpTable({ arp_list: _addList }).then(d => {
          this.arpStaticList.push(..._addList)
          this.$refs.baseTable.clearSelection()
        })
      })
    },
    onAddFilter(item) {
      let _items = []
      if (item) {
        _items = [item]
      } else {
        _items = this.$refs.baseTable.selection
        if (_items.length === 0) {
          return this.$message.warning(I18N.t('arp.select_mac_filter'))
        }
      }
      _items = _items.filter(ite => !this.isMacFilter(ite))
      if (_items.length === 0) {
        return this.$message.warning(I18N.t('arp.has_filter'))
      }
      let _leftNum = this.arpFilterMax - this.arpFilterList.length
      if (_items.length > _leftNum) {
        return this.$message.warning(
          I18N.t('arp.bind_limit', {
            max: this.arpFilterMax,
            has: this.arpFilterList.length,
            stay: _leftNum
          })
        )
      }
      this.$confirm(I18N.t('arp.filter_confirm')).then(() => {
        let _addList = _items.map(item => ({
          mac: item.mac,
          comment: item.ip
        }))
        this.$api.addMacFilter(_addList).then(d => {
          this.arpFilterList.push(..._addList)
          this.$refs.baseTable.clearSelection()
        })
      })
    },
    isStaticArp(row) {
      return this.arpStaticMap.includes(row.mac.toLocaleUpperCase())
    },
    isMacFilter(row) {
      return this.macFilterMap.includes(row.mac.toLocaleUpperCase())
    },
    isSelectable(row) {
      let _isUnBind = !this.isStaticArp(row)
      return this.showMacFilter
        ? _isUnBind || !this.isMacFilter(row)
        : _isUnBind
    },
    onToPag(name) {
      this.$router.push({ name: name })
    }
  }
}
</script>
<style lang="scss" scoped>
.security-arp {
  .inline {
    display: inline-block;
  }
}
</style>
