<template>
  <div class="vpn-security-union">
    <help-alert :title="$t('egw.ipsec.ah_esp_no_confuse')" json-key="vpnUnionJson"></help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{$t('egw.ipsec.ah_esp_no_confuse')}}
          <small></small>
        </span>
        <div class="fr">
          <el-button @click.native="_onRefresh" icon="el-icon-refresh" plain size="medium" type="primary">{{$t('action.refresh')}}</el-button>
        </div>
      </div>
      <el-table :data="list" ref="baseTable" size="medium" stripe>
        <el-table-column :label="$t('egw.ipsec.name')" align="center" prop="name"></el-table-column>
        <el-table-column label="SPI" align="center" prop="spi"></el-table-column>
        <el-table-column :label="$t('egw.ipsec.direction')" align="center" prop="direction"></el-table-column>
        <el-table-column :label="$t('egw.ipsec.tunnel')" align="center" prop="tunnel"></el-table-column>
        <el-table-column :label="$t('egw.ipsec.flows')" align="center" prop="flows" width="260px"></el-table-column>
        <el-table-column :label="$t('phrase.status')" align="center" prop="status">
          <template slot-scope="{row}">
            <span class="c-success" type="text" v-if="!row.reason.trim()">{{$t('egw.ipsec.normal')}}</span>
            <span class="c-warning" type="text" v-else>
              {{$t('egw.ipsec.abnormal')}}
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">{{row.reason}}</div>
                <span>
                  <i class="el-icon-question"></i>
                </span>
              </el-tooltip>
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('egw.ipsec.safe_agreement')" align="center" prop="encapsule"></el-table-column>
        <el-table-column :label="$t('egw.ipsec.ah_check_algorithm')" align="center" prop="ah_auth_alg"></el-table-column>
        <el-table-column :label="$t('egw.ipsec.esp_check_algorithm')" align="center" prop="esp_auth_alg"></el-table-column>
        <el-table-column :label="$t('egw.ipsec.esp_encryption_algorithm')" align="center" prop="encapsule_alg"></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'vpn-security-union',
  data() {
    return {
      list: []
    }
  },
  created() {
    this._initPage()
  },
  methods: {
    async _initPage() {
      const _res = await this.$api.getIpSecSa()
      this.list = _res.data || []
    },
    _onRefresh() {
      this._initPage()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
