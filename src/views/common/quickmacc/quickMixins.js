
export default {
  data() {

  },
  methods: {
    // 配置未保存退出提醒：当前页面所做的配置将丢失
    async checkUnSaveExit() {
      let _doCheck = true
      try {
        _doCheck =
          (await this.$confirm(
            I18N.t('quickset.exit_tip'),
            I18N.t('quickset.cfg_nocomplete'),
            {
              // type: 'warning',
              showClose: false,
              cancelButtonClass: 'el-button--text c-info',
              cancelButtonText: I18N.t('quickset.exit_confirm'),
              confirmButtonText: I18N.t('quickset.continue_cfg'),
              closeOnClickModal: false
            }
          )) === 'confirm'
      } catch (error) {
        _doCheck = false
      }
      return _doCheck
    },
    // 确认退出到首页提示：你可以点击页面顶部的【诺客云端运维】和【APP下载】
    async goToHomepage() {
      let _doGo = true
      try {
        _doGo =
          (await this.$confirm(
            `<p>${I18N.t('quickset.dev_cfg_tip1')}</p>
             <p>${this.isSmb ? I18N.t('quickset.dev_cfg_tip2') : I18N.t('quickset.dev_cfg_tip3')}</p>`,
            I18N.t('quickset.tips'),
            {
              showCancelButton: false,
              dangerouslyUseHTMLString: true,
              confirmButtonText: I18N.t('quickset.enter_eweb'),
              closeOnClickModal: false
            }
          )) === 'confirm'
      } catch (error) {
        _doGo = false
      }
      return _doGo
    }
  }
};
