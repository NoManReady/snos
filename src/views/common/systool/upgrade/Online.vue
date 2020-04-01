<template>
  <el-form :model="form" label-width="120px" ref="form" size="small">
    <help-alert :title="$t('systool.online_upgrade')" json-key="exampleJson">
      <div slot="content">{{ $t("systool.online_upgrade_tip") }}</div>
    </help-alert>
    <el-form-item :label="$t('systool.cur_version')">
      <div :key="form.curVersion" v-html="form.curVersion" v-if="form.curVersion"></div>
      <div v-else>
        <i class="el-icon-loading f-theme"></i>
        {{ $t("systool.on_fetch_version") }}
      </div>
    </el-form-item>
    <template v-if="form.hasNewVersion">
      <el-form-item :label="$t('systool.new_version')" class="c-warning">
        <div v-html="form.newVersion"></div>
      </el-form-item>
      <el-form-item :label="$t('systool.new_version_explain')">
        <pre style="font-family: inherit;" v-html="form.versionDesc"></pre>
      </el-form-item>
      <el-form-item :label="$t('phrase.tip')">
        <i18n path="systool.oup_tip1" tag="div">
          <span @click="onDownload" class="pointer c-success">{{ $t("systool.oup_tip_bin") }}</span>
        </i18n>
        <i18n path="systool.oup_tip2" tag="div">
          <span @click="onToLocalUpgrade" class="pointer c-success">{{ $t("systool.oup_tip_local") }}</span>
        </i18n>
      </el-form-item>
      <el-form-item>
        <el-button @click.native="onUpgrade" class="w160" size="medium" type="primary">{{ $t("systool.upgrade_quick") }}</el-button>
      </el-form-item>
    </template>
  </el-form>
</template>
<script>
import { getOnlineVers, upgradeOnlineVers } from '@/utils'
export default {
  name: 'UpgradeOnline',
  data() {
    return {
      form: {
        curVersion: '',
        newVersion: '',
        versionDesc: '',
        hasNewVersion: false,
        downloadPath: ''
      },
      loading: {}
    }
  },
  async created() {
    this.form = await getOnlineVers()
  },
  methods: {
    onDownload() {
      window.open(this.form.downloadPath, '_blank')
    },
    onToLocalUpgrade() {
      this.$router.push({
        name: 'admin/alone/systool/systool_upgrade',
        query: { tab: '1' }
      })
    },
    onUpgrade() {
      upgradeOnlineVers(this.form)
    }
  }
}
</script>
<style lang="scss"></style>
