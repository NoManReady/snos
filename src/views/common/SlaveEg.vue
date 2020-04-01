<template>
  <div class="slave-eg">
    <iframe :src="slaveEgUrl" @load="onIframeLoad" class="iframe" ref="slaveIframe" v-if="loadOK"></iframe>
  </div>
</template>
<script>
import { getIframeUrl, isNewVersion } from '@/utils/iframeUtils'
export default {
  name: 'SlaveEg',
  data() {
    return {
      loadOK: false,
      slaveEgUrl: '',
      hasShowError: false
    }
  },
  created() {
    this._loadData()
  },
  methods: {
    async _loadData() {
      let _res = await this.$api.cmd('devSta.get', {
        module: 'ap_list',
        data: {
          productType: 'EGW',
          forwardMode: 'ROUTER'
        }
      })
      let _egInfo =
        ((_res.list && _res.list) || []).find(
          o => o.forwardMode === 'ROUTER'
        ) || {}
      this.slaveEgUrl = getIframeUrl({
        ip: _egInfo.ip || '10.44.77.253',
        sn: _egInfo.serialNumber,
        initpath: 'admin/alone',
        menuMode: 'none',
        hideHead: 'true'
      })
      this.loadOK = true
      this.$nextTick(_ => {
        this.onIframError()
      })
    },
    onIframeLoad(e, a) {
      let _iframe = this.$refs.slaveIframe
      if (_iframe) {
        // 从EG的WEB页面根节点异常 (可能服务器异常)
        if (
          !this.hasShowError &&
          !_iframe.contentDocument.body.className.includes('rj-body')
        ) {
          this.$alert(
            I18N.t('slave_eg.gateway_err_tip'),
            I18N.t('slave_eg.page_err')
          )
          this.hasShowError = true
        }
      }
    },
    onIframError() {
      let _iframe = this.$refs.slaveIframe
      if (_iframe) {
        // 资源加载错误处理
        _iframe.contentWindow.addEventListener(
          'error',
          event => {
            let _name =
              (event.target &&
                event.target.nodeName &&
                event.target.nodeName.toLocaleUpperCase()) ||
              ''
            if (
              !this.hasShowError &&
              (_name === 'SCRIPT' || _name === 'LINK')
            ) {
              this.iframeOk = false
              this.$alert(
                I18N.t('slave_eg.gateway_err_tip'),
                I18N.t('slave_eg.source_err')
              )
              this.hasShowError = true
            }
          },
          true
        )
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.slave-eg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;

  .iframe {
    width: 100%;
    height: 100%;
    border: none;
    // 解决iframe内联元素，导致了div被撑开出现滚动条的问题
    display: block;
    // vertical-align: top;
  }
}
</style>
