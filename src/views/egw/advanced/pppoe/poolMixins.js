import { ipRangeRegxp, ipToLong } from "@/utils/rulesUtils";
import { isIpInNet, isExistIpRange } from "@/utils/commonValidates";
import { quoteValidator } from "@/utils/rules";

export default {
  data() {
    return {
      MAX_NUM: 5,
      poolList: []
    };
  },
  computed: {
    nameMap() {
      let _map = {};
      this.poolList.forEach(p => (_map[p.ippool_name] = true));
      return _map;
    },
    ipRangeList() {
      return this.poolList.map(o => o.first_addr + "-" + o.end_addr);
    }
  },
  methods: {
    // 获取地址池
    async loadIpPool() {
      let _res = await this.$api.getIpPool();
      this.poolList = (_res.list || []).map(o =>
        Object.assign(o, { ipRange: `${o.first_addr}-${o.end_addr}` })
      );
    },
    getPoolRules(isAddPool = false, checkIpRange = true) {
      const _sameNameValidate = (r, v, cb) => {
        if (isAddPool && this.nameMap[v])
          return cb(new Error(I18N.t("egw.pool.addr_zone_is_has")));
        cb();
      };
      const isLegalIp = (r, v, cb) => {
        if (!ipRangeRegxp.test(v)) {
          return cb(new Error(I18N.t('egw.pppoe.pool_range_valid')));
        } else {
          let _sIp = v.split(/\s*-\s*/)[0];
          let _eIp = v.split(/\s*-\s*/)[1];
          let _ipNum = ipToLong(_eIp) - ipToLong(_sIp);
          if (_ipNum < 0) {
            return cb(
              new Error(I18N.t("egw.pool.end_addr_less_then_start_addr"))
            );
          } else if (_ipNum > 1000) {
            return cb(
              new Error(I18N.t("egw.pool.within_addr_num", { cnt: _ipNum }))
            );
          }
        }
        if (checkIpRange) {
          if (isExistIpRange(v, this.editIndex, this.ipRangeList)) {
            return cb(new Error(I18N.t("egw.pool.addr_range_is_has")));
          }
          let _ipList = this.baseModel.used_ip_list;
          if (_ipList && _ipList.length > 0) {
            let _usedIp = _ipList.find(ip =>
              isIpInNet(ip, [this.baseModel.ipRange])
            );
            if (_usedIp) {
              return cb(
                new Error(
                  I18N.t("egw.pool.addr_used_in_service", { ip: _usedIp })
                )
              );
            }
          }
        }
        cb();
      };
      return {
        ippool_name: [
          { required: true, message: I18N.t("egw.pool.pool_name_no_empty") },
          {
            range: true,
            min: 1,
            max: 28,
            message: I18N.t("egw.rule_name_length_tip")
          },
          { validator: _sameNameValidate },
          { validator: quoteValidator }
        ],
        ipRange: [
          { required: true, message: I18N.t("egw.pool.iprange_no_empty") },
          { validator: isLegalIp }
        ]
      };
    }
  }
};
