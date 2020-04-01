<template>
  <el-dialog
    :before-close="_onBeforeClose"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :title="$t('steps.title')"
    :visible.sync="visible"
    append-to-body
    modal-append-to-body
    width="550px"
  >
    <div class="tc">
      <img :src="require('@/assets/eg/step_4.png')" class="w100p" />
      <div class="tl mt10 ml40" v-if="errorMsg">
        <strong class="c-warning">{{errorMsg}}</strong>
        <ol>
          <li class="mt5">{{ $t("steps.error1") }}</li>
          <li class="mt5">{{ $t("steps.error2") }}</li>
          <li class="mt5">{{ $t("steps.error3") }}</li>
        </ol>
      </div>
      <div class="tl mt10 ml40" v-else>
        <strong class="c-info">{{$t('steps.stepTip')}}</strong>
        <ol>
          <li class="mt5">{{ $t("steps.steps1") }}</li>
          <li class="mt5">{{ $t("steps.steps2") }}</li>
          <li class="mt5">{{ $t("steps.steps3") }}</li>
        </ol>
      </div>
      <el-button :loading="running" @click.native="_onStart" class="w200 mt20" type="primary">{{btnText}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'EhrSteps',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    remoteIp: {
      type: String | Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: this.value,
      btnText: this.$t('steps.get_start'),
      running: false,
      errorMsg: false
    }
  },
  created() {},
  watch: {
    value(v) {
      this.visible = v
    },
    visible(v) {
      this.$emit('input', v)
      if (!v) {
        this.errorMsg = false
        this.btnText = this.$t('steps.get_start')
      }
    }
  },
  methods: {
    _onStart() {
      this._confirmStart(() => {
        this.running = true
        this.errorMsg = false
        this.btnText = this.$t('steps.steps4')
        this.$api
          .cmd(
            'devSta.get',
            { module: 'pppoe_learn', remoteIp: this.remoteIp },
            { isSilence: true, timeout: 0 }
          )
          .then(res => {
            this._dealRes(res)
          })
          .catch(e => {
            this._dealRes({
              state: 'fail',
              error: this.$t('steps.over_check_error')
            })
          })
          .finally(_ => {
            this.running = false
          })
      })
    },
    _onBeforeClose(done) {
      if (this.running) {
        this.$message({
          duration: 6000,
          message: this.$t('steps.loading_response')
        })
        // this.$confirm(
        //   '您正在获取宽带账号和密码，是否保持继续获取？',
        //   '请确认',
        //   {
        //     confirmButtonText: '不退出，继续获取',
        //     cancelButtonText: '退出，稍后获取',
        //     type: 'warning'
        //   }
        // )
        //   .then()
        //   .catch(() => {
        //     done()
        //   })
      } else {
        done()
      }
    },
    _confirmStart(cb) {
      this.$confirm(
        this.$t('steps.get_connected_confirm'),
        this.$t('steps.confirm_is_required'),
        {
          confirmButtonText: this.$t('steps.get_start_by_link'),
          cancelButtonText: this.$t('steps.check_response'),
          type: 'warning'
        }
      )
        .then(cb)
        .catch()
    },
    _dealRes(res) {
      if (!this.visible) {
        return
      }
      // res = { state: 'finish', user: 'test', pwd: 'pass' } // test data
      if (res.state === 'finish') {
        this.$message({
          type: 'success',
          duration: 6000,
          message: this.$t('steps.response_wright')
        })
        this.learnOk(res)
      } else {
        this.btnText = this.$t('steps.next_get')
        this.errorMsg = this.$t('steps.get_account_error_tip') + res.error
      }
    },
    learnOk(res) {
      this.$emit('result', {
        user: res.user || '',
        pwd: res.pwd || ''
      })
      this.visible = false
    }
  }
}
</script>