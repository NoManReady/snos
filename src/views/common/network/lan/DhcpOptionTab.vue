<template>
  <div>
    <div class="mb10">
      <help-alert
        json-key="dhcpOptionJson"
        :title="$t('network.dhcp_serv_cfg')"
        type="info"
      >
        <div slot="content">{{ $t("network.dhcp_serv_cfg_tip") }}</div>
      </help-alert>
    </div>
    <el-form
      :model="baseModel"
      class="w550"
      label-position="left"
      label-width="90px"
      ref="baseForm"
      status-icon
      style="padding-left: 70px;"
      v-if="loaded"
    >
      <el-form-item
        :key="idx"
        :label="
          (optionMap[opt.id] && optionMap[opt.id].label) || `Option ${opt.id}`
        "
        :prop="`option[${idx}].value`"
        :rules="_getRule(opt.id)"
        v-for="(opt, idx) in baseModel.option"
      >
        <el-input
          :placeholder="
            (optionMap[opt.id] && optionMap[opt.id].placeholder) ||
              defPlaceholder
          "
          class="w330"
          v-model="opt.value"
        ></el-input>
        <el-tooltip effect="light" placement="right" v-if="opt.id === '43'">
          <div slot="content">
            <ol class="ol-num pl15" v-if="forbitRjOption">
              <li>{{ $t("network.dhcp_serv_rule") }}</li>
              <li>
                <i18n path="network.dhcp_serv_enable_tip" tag="li">
                  <a @click="_onToHome" class="c-success pointer">{{
                    $t("menu.dev_view")
                  }}</a>
                </i18n>
              </li>
            </ol>
            <div v-else>
              <strong class="ml5">{{
                $t("network.dhcp_serv_l3_cfg_tip")
              }}</strong>
              <ol class="ol-num pl15">
                <li class="mtb5">
                  <i18n path="network.dhcp_serv_l3_tip1" tag="span">
                    <a
                      @click="$parent.tabValue = '2'"
                      class="c-success pointer"
                      >{{ $t("network.static_addr_alloc") }}</a
                    >
                  </i18n>
                </li>
                <li>
                  {{ $t("network.dhcp_serv_l3_tip2") }}
                </li>
              </ol>
            </div>
          </div>
          <i class="rjucd-help vm fs22"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item>
        <el-button class="w160" type="primary" v-auth="onSubmit">{{
          $t("action.save_edit")
        }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { nameLengthValidator, dnsValidator, ipValidator } from "@/utils/rules";
import { isIp } from "@/utils/rulesUtils";
export default {
  name: "NetworkDhcpOptionTab",
  data() {
    const checkRjOptions43 = (rule, value, cb) => {
      let _tagIdx = value.indexOf("#RJ#");
      if (_tagIdx !== -1) {
        if (this.forbitRjOption) {
          return cb(I18N.t("network.dhcp_serv_disable_tip"));
        }
        if (_tagIdx > 0 || value.indexOf(" ") !== -1) {
          return cb(I18N.t("network.dhcp_serv_rule_tip1"));
        }
        let _ipArr = value.substr(4).split(/,/g);
        if (_ipArr.length > 2) {
          return cb(I18N.t("network.dhcp_serv_rule_tip2"));
        }
        let _valid = _ipArr.every(d => {
          return !!d ? isIp(d) : true;
        });
        if (!_valid) {
          return cb(I18N.t("network.ip_format_err"));
        }
      }
      cb();
    };
    return {
      loaded: false,
      defPlaceholder: I18N.t("network.dhcp_serv_def_ph"),
      optionMap: {
        6: {
          label: I18N.t("sysinfo.dns_addr"),
          placeholder: I18N.t("wan.dns_example"),
          rule: [{ validator: dnsValidator }]
        },
        43: {
          placeholder: I18N.t("network.dhcp_serv_43_rule"),
          rule: [
            {
              validator: nameLengthValidator,
              size: 128,
              message: I18N.t("network.dhcp_serv_43_len_rule")
            },
            { validator: checkRjOptions43 }
          ]
        },
        138: {
          placeholder: I18N.t("wan.ip_example"),
          rule: [
            { validator: ipValidator, message: I18N.t("wan.invalid_ip_addr") }
          ]
        }
      },
      baseModel: {
        option: [
          {
            id: "6",
            value: ""
          },
          {
            id: "43",
            value: ""
          },
          {
            id: "138",
            value: ""
          }
        ]
      }
    };
  },
  created() {
    this._load();
  },
  computed: {
    // EG做为主设备时候不允许配置三层组网的option43，需要关闭EG自组网
    forbitRjOption() {
      return this.$store.getters.devMode.autoJoin === "true";
    }
  },
  methods: {
    // 加载wan口信息
    _load() {
      this.$api.getDhcpOption().then(d => {
        this.baseModel = Object.assign({}, this.baseModel, d);
        this.loaded = true;
      });
    },
    _getRule(id) {
      let _map = this.optionMap[id] || {};
      if (_map.rule) {
        return _map.rule;
      }
      const _commonValidate = (rule, value, cb) => {
        if (value && !/^[0-9a-zA-Z\.\s]+$/.test(value)) {
          return cb(this.defPlaceholder);
        }
        cb();
      };
      return [{ validator: _commonValidate, message: this.defPlaceholder }];
    },
    // 提交表单验证
    onSubmit() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.$api.setDhcpOption(this.baseModel).then(d => {
            this.$message({
              type: "success",
              message: I18N.t("tip.edit1_success")
            });
          });
        }
      });
    },
    _onToHome() {
      this.$router.push({ name: "admin/alone" });
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
