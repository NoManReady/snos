<template>
  <div class="box overview-sysinfo">
    <div class="box-header">
      <span class="box-header-tit">{{ $t("overview.dev_desc_info") }}</span>
    </div>
    <el-form class="view-form" label-width="100px" size="medium" v-show="sysinfo">
      <el-row :gutter="20">
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item :label="$t('sysinfo.dev_type_f')">
            <label>{{ sysinfo.product_class }}</label>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item :label="$t('sysinfo.dev_name_f')" style="height: 24px;">
            <common-popover
              :rules="hostnameRules"
              :title="$t('sysinfo.dev_name_modify')"
              :value="hostname"
              @submit="_onHostnameSubmit($event)"
            >
              <i class="el-icon-loading" v-if="!hostname || isLoading"></i>
              <template v-else>
                <span class="c-success ellipsis vm width">{{ hostname }}</span>
                <i class="el-icon-edit c-success" v-show="hostname"></i>
              </template>
            </common-popover>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item :label="$t('sysinfo.sn_num_f')">
            <label>{{ sysinfo.serial_num }}</label>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item :label="$t('sysinfo.mac_addr_f')">
            <label>{{ sysinfo.sys_mac }}</label>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item :label="$t('sysinfo.hard_version_f')">
            <label>{{ sysinfo.hardware_version }}</label>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24" v-if="showMode">
          <el-form-item :label="$t('sysinfo.dev_mode_f')">
            <dev-mode v-if="isDefUser">
              <label class="pointer">
                <a class="c-success" href="javascript:;">{{ forwardMode }}</a>
                <i class="el-icon-edit fs16 c-success ml5"></i>
              </label>
            </dev-mode>
            <span v-else>{{ forwardMode }}</span>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item :label="$t('sysinfo.net_role_f')" v-if="workMode">
            <label>
              {{ workMode }}
              <el-tooltip effect="light" placement="bottom">
                <ol class="ml15 ol-li" slot="content">
                  <li>{{ $t("overview.netjoin_tip1") }}</li>
                  <li>{{ $t("overview.netjoin_tip2") }}</li>
                  <li>{{ $t("overview.netjoin_tip3") }}</li>
                  <li>{{ $t("overview.netjoin_tip4") }}</li>
                  <li>
                    <i18n path="overview.netjoin_tip5" tag="span">
                      <a @click="reload" class="c-success pointer">{{ $t("overview.f5_fresh") }}</a>
                    </i18n>
                  </li>
                </ol>
                <i class="el-icon-info c-info"></i>
              </el-tooltip>
              <span v-if="this.$roles().includes('slave')">{{ `（${$t("overview.ac_master")}：${masterIp}）` }}</span>
            </label>
          </el-form-item>
        </el-col>
        <el-col :md="8" :sm="12" :xs="24">
          <el-form-item :label="$t('sysinfo.soft_version_f')">
            <label class="vm mw250">{{ sysinfo.software_version }}</label>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
import { hostNameValidator, nameLengthValidator } from '@/utils/rules'
import DevMode from '@/views/common/overview/components/DevMode'
import { mapGetters, mapActions } from 'vuex'
import CommonPopover from '@/common/CommonPopover'
export default {
  name: 'OverviewSysinfo',
  data() {
    return {
      isLoading: false,
      hostnameRules: [
        {
          required: true,
          message: I18N.t('overview.hostname_no_empty'),
          whitespace: true
        },
        {
          validator: nameLengthValidator,
          size: 64,
          message: I18N.t('overview.hostname_len_rule')
        },
        { validator: hostNameValidator }
      ]
    }
  },
  components: {
    [CommonPopover.name]: CommonPopover,
    [DevMode.name]: DevMode
  },
  computed: {
    ...mapGetters(['sysinfo', 'hostname', 'userName']),
    isDefUser() {
      return this.userName === 'admin'
    },
    deviceRole() {
      return this.$store.getters.deviceRole
    },
    showMode() {
      return !['ehr', 'eac'].includes(this.$store.getters.capacity.dev_type)
    },
    // 网络角色
    workMode() {
      if (this.$roles().includes('alone')) {
        return false
      }
      return (
        {
          AC: I18N.t('overview.ac_master'),
          ACG: I18N.t('overview.ap_master'),
          ACP: I18N.t('overview.ap_master'),
          AP: I18N.t('overview.ap_slave'),
          EG: I18N.t('overview.dev_slave'),
          UNKNOW: I18N.t('phrase.unknow')
        }[this.deviceRole] || false
      )
    },
    forwardMode() {
      return {
        ROUTER: I18N.t('overview.route_mode'),
        AC: I18N.t('overview.ac_mode'),
        AP: I18N.t('overview.ap_mode')
      }[this.$store.getters.devMode.forwardMode || 'ROUTER']
    },
    masterIp() {
      return this.$store.getters.masterIp || '-'
    }
  },
  async created() {
    this.getNetStatus()
  },
  methods: {
    ...mapActions(['setHostname', 'getNetStatus']),
    reload() {
      window.top.location.reload()
    },
    // 提交hostname
    async _onHostnameSubmit(hostname) {
      this.isLoading = true
      try {
        await this.setHostname(hostname)
        this.$message.success(I18N.t('tip.edit_success'))
      } catch (error) {}
      this.isLoading = false
    }
  }
}
</script>
<style lang="scss" scoped>
.overview-sysinfo {
  ol.ol-li li {
    list-style-type: disc;
  }
  .ellipsis.width {
    max-width: 100px;
    width: auto;
  }
  @media screen and (min-width: 768px) {
    .mw250 {
      min-width: 250px;
    }
  }
}
</style>
