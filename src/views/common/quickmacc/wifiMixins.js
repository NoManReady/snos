
import {
  ssidNameValidator,
  wifiNameValidator,
  passwdValidator,
  webPasswdValidator
} from '@/utils/rules'
import { existValidate } from '@/utils/rulesUtils'
import { wirelessFn } from '@/model/modules/wireless'

export default {
  data() {
    const ssidNameUniValidator = (rule, value, cb) => {
      if (existValidate(this.ssidNames, value, this.masterSsidName || '')) {
        return cb(new Error(I18N.t('overview.wifi_is_exist', { name: value })))
      }
      cb()
    }
    return {
      wireless: {},
      wifiModel: {
        ewebPassword: '',
        masterSsid: {
          ssidName: '',
          encryptionMode: 'open',
          password: ''
        }
      },
      wifiRules: {
        // mobile设置为false，在手机端校验规则去掉不校验
        ewebPassword: [
          { required: true, message: I18N.t('quickmacc.manage_pass_empty') },
          { validator: webPasswdValidator, mobile: false },
          { min: 8, max: 31, message: I18N.t('quickmacc.manage_pass_rule') }
        ],
        'masterSsid.ssidName': [
          {
            required: true,
            message: I18N.t('overview.wifi_no_empty'),
            whitespace: true
          },
          { validator: wifiNameValidator },
          { validator: ssidNameValidator, size: 32 },
          { validator: ssidNameUniValidator, mobile: false }
        ],
        'masterSsid.password': [
          { required: true, message: I18N.t('overview.wifipass_no_empty'), mobile: false },
          { validator: passwdValidator },
          { min: 8, max: 16, message: I18N.t('overview.wifipass_rule') }
        ]
      }
    }
  },
  computed: {
    ssidNames() {
      return (this.wireless.ssidList || []).map(o => o.ssidName)
    },
    masterSsidName() {
      const _master = this.getMasterSsid(this.wireless.ssidList)
      return _master.ssidName || ''
    }
  },
  methods: {
    getMasterSsid(list, wlanId = '1') {
      return (list || []).find(wifi => wifi.wlanId === wlanId) || wirelessFn()
    }
  }
};
