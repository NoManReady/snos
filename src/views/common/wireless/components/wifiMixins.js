import { Loading } from "element-ui";
import { healthyFn } from "@/model/modules/wireless";
import { deepClone } from "@/utils/utils";
export default {
  data() {
    return {
      MAX_NUM: 8,
      wireless: {
        radioList: [],
        ssidList: [],
        healthy: healthyFn()
      },
      isLoaded: false,
      query: false, // 默认不传groupId获取设备所在分组的无线配置
      networkGroups: [],
      specialVlans: ["1", "233", undefined]
    };
  },
  async created() {
    if (this.hideGroup || this.loadWifi) {
      await this._loadWifi(true);
    }
  },
  computed: {
    rsMap() {
      return this.$store.getters.rsMaps;
    },
    // 从模式和公寓Wi-Fi时不可编辑
    editable() {
      return (
        this.isLoaded &&
        !this.$roles().includes("slave") &&
        this.wireless.existIndepend !== "true"
      );
    },
    // 独立模式/从模式不加载分组模块
    hideGroup() {
      return this.$roles().includes("alone") || this.$roles().includes("slave") || this.$roles().includes('ehr')
    },
    // wifi名称列表
    ssidNames() {
      return this.wireless.ssidList.map(ssid => ssid.ssidName);
    },
    defaultVistorName() {
      return `@Ruijie-guest-${this.$store.getters.sysinfo.sys_mac
        .replace(/\s*:\s*/g, "")
        .substr(-4)
        .toLocaleUpperCase()}`;
    },
    isRouter() {
      return this.$store.getters.devMode.forwardMode === "ROUTER";
    },
    isEhr() {
      return this.$roles().includes('ehr')
    }
  },
  methods: {
    changeGroup(gId) {
      this.query = { groupId: gId };
      this._loadWifi(true);
    },
    // 加载wifi列表
    async _loadWifi(loading) {
      let _result = await this.$api.getWireless(this.query, {
        isSilence: this.isSilence || !loading
      });
      if (_result.existIndepend === "true") {
        _result = await this.$api.getWirelessIndepend();
        _result.existIndepend = "true";
      }

      // 和MACC一致，根据wlanId排序
      _result.ssidList.sort((s1, s2) => s1.wlanId - s2.wlanId);

      // 从设备根据能力值显示应用频段
      if (this.$roles().includes("slave")) {
        _result.ssidList = _result.ssidList
          .filter(o =>
            // 过滤掉不支持的频段WiFi
            this.rsMap.find(ro => o.relatedRadio.includes(ro.v))
          )
          .map(o =>
            Object.assign(o, {
              // 只显示支持的应用频段
              relatedRadio:
                this.rsMap.length === 1 ? this.rsMap[0].v : o.relatedRadio
            })
          );
      }

      _result.healthy = _result.healthy || healthyFn();
      this.wireless = _result;
      this.isLoaded = true;
    },
    formatVlanId(row, column) {
      if (this.specialVlans.includes(row.vlanId)) {
        return this.isRouter
          ? I18N.t("wifi_comm.def_vlan")
          : I18N.t("wifi_comm.sameas_ap");
      } else {
        return row.vlanId;
      }
    },
    // 获取射频名称
    getRadioName(radioIndex) {
      let _rsMap = {
        "1": "2.4G",
        "2": "5G",
        "1,2": "2.4G + 5G"
      };
      return _rsMap[radioIndex];
    },
    // 生成wlanid
    _generatorWlanid() {
      let _wlanid = 1;
      let _wlanids = this.wireless.ssidList.map(ssid => ssid.wlanId);
      while (_wlanids.indexOf(_wlanid + "") > -1) {
        _wlanid++;
      }
      return _wlanid + "";
    },
    // opt：set 有对应wlanId就更新，没有就添加； del删除对应wlanId的数据
    _updataList(ssidList, ssid, opt) {
      let _idx = ssidList.findIndex(s => s.wlanId === ssid.wlanId)
      let ssidData = deepClone(ssid)
      ssidData.ssidName5G && delete ssidData.ssidName5G
      ssidData.isSameSsid && delete ssidData.isSameSsid
      if (_idx != -1) {
        if (opt === 'set') {
          ssidList.splice(_idx, 1, ssidData)
        } else if (opt = 'del') {
          ssidList.splice(_idx, 1)
        }
      } else {
        if (opt === 'set') {
          ssidList.push(ssidData)
        }
      }
    },
    _updateSsidList(ssid) {
      // 生成wlanId
      if (!ssid.wlanId) {
        ssid.wlanId = this._generatorWlanid();
      }
      this._updataList(this.wireless.ssidList, ssid, 'set')

      // 家用双频合一更新
      if (this.isEhr) {
        ssid.wlanId = ssid.wlanId === '1' ? '2' : '7' // 主网络2是wlanId2, 访客网络2是wlanId 7
        if (ssid.isSameSsid) {
          this._updataList(this.wireless.ssidList, ssid, 'del')
        } else {
          ssid.relatedRadio = '2'
          ssid.ssidName = ssid.ssidName5G
          this._updataList(this.wireless.ssidList, ssid, 'set')
        }
      }
      this.wireless.ssidList.sort((s1, s2) => s1.wlanId - s2.wlanId);
    },
    // Wi-Fi模块配置数据
    _postWifiData(ssid = false) {
      if (typeof ssid === "object") {
        this._updateSsidList(ssid);
      }
      let _isInit = this.wireless.networkId === "0";
      let _loading = null;
      if (_isInit) {
        _loading = Loading.service({ text: I18N.t("wifi_comm.on_create_net") });
      }
      let _data = deepClone(this.wireless);
      _data.ssidList = _data.ssidList.filter(ssid => !!ssid.ssidName);
      return this.$api.setWireless(_data).then(async res => {
        if (_isInit) {
          // 更新networkId
          if (res.myNetworkId) {
            this.wireless.networkId = res.myNetworkId;
          } else {
            await this._loadWifi(false).then(() => {
              _loading.close();
            });
          }
        }
        this.$message.success(I18N.t("tip.edit1_success"));
      });
    }
  }
};
