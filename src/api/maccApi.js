import axios from 'axios'
const MACC_VERSION_URL = 'http://api.cloud.ruijie.com.cn/service/api/upgrade/recommend/coap_version'

export const getMaccVersion = (data = {}) => {
  return axios({
    url: MACC_VERSION_URL,
    method: 'post',
    data
  })
}

