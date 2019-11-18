<template>
  <div class="diagnose-network">
    <help-alert json-key="networkCheckJson" title="网络自检"></help-alert>
    <el-button :disabled="isChecking" @click="onConfirmCheck()" class="w200 mb20" type="primary" v-html="checkBtn"></el-button>
    <el-row>
      <el-col :lg="16" class="check-result-list">
        <el-progress
          :percentage="oldProcess"
          :stroke-width="18"
          :text-inside="true"
          class="mb20"
          status="success"
          v-show="showProgress"
        ></el-progress>
        <li :key="idx" class="mb5" v-for="(checkItem,idx) in checkItems">
          <help-alert :closable="false" :description="checkItem.state" :title="checkItem.name" :type="checkItem.type" show-icon></help-alert>
          <el-row
            :key="questionItem.check_type"
            class="plr20 ptb10 ver-middle"
            v-bind:style="[getCheckStyle(checkItem.type)]"
            v-for="questionItem in checkItem.qusetions"
          >
            <el-col :span="10" class="ver-middle-item">{{questionItem.fail_reason}}</el-col>
            <el-col :span="7" class="ver-middle-item">{{questionItem.result_tip}}</el-col>
            <el-col :span="4" class="ver-middle-item">
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content" v-html="questionItem.advise"></div>
                <span>
                  修复建议
                  <i class="el-icon-question"></i>
                </span>
              </el-tooltip>
            </el-col>
            <el-col :span="3" class="tr ver-middle-item">
              <el-button @click="onRepair(questionItem)" type="primary">去修复</el-button>
            </el-col>
          </el-row>
        </li>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { isNetEnable } from '@/utils'
import { sleep } from '@/utils'
import { Row, Col, Progress } from 'element-ui'
export default {
  name: 'DiagnoseNetwork',
  data() {
    return {
      isLanPing: false,
      isWanPing: false,
      oldProcess: 0,
      checkTimes: 1,
      checkBtn: '开始检测',
      checkItems: [],
      loading: '',
      isChecking: false,
      showProgress: false,
      checkState: {
        ok: ['正常', 'success'],
        fail: ['异常', 'warning'],
        checking: ['检测中', 'success']
      },
      checkStyle: {
        success: 'ebf9f8',
        warning: 'fef2ec'
      },
      start: this.$route.query.start || false
    }
  },
  created() {
    if (this.start) {
      this.onConfirmCheck()
    }
  },
  components: {
    [Progress.name]: Progress,
    [Col.name]: Col,
    [Row.name]: Row
  },
  methods: {
    getCheckStyle(type) {
      return { background: '#' + this.checkStyle[type] }
    },
    onShowLoading(text) {
      this.loading = this.$loading({
        target: '.app',
        lock: true,
        text: text,
        background: 'rgba(0, 0, 0, 0.1)'
      })
    },
    onRepair(item) {
      if (item.link_page_id) {
        this.$confirm('确认跳转修复页面？')
          .then(() => {
            this.$router.push({
              path: item.link_page_id
            })
          })
          .catch(() => {})
      } else {
        this.$alert(item.advise || item.fail_reason, '修复建议', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '知道了',
          showClose: false
        })
      }
    },
    onConfirmCheck() {
      this.$confirm('确认开始设备自检？')
        .then(() => {
          this.onCheckSelf()
        })
        .catch(() => {})
    },
    async onCheckSelf() {
      this.checkItems = []
      // this.onShowLoading('正在检测网络状态...')
      this.oldProcess = 0
      this.showProgress = false
      this.isLanPing = true
      this.isWanPing = true
      this.onStartCheck()
      // 获取自检 web url
      // let url = await this.getWebUrl()
      // if (!!url) {
      //   // 如果有url
      //   // 判断内网是否通
      //   url = location.protocol + '//' + url
      //   let ret = await isNetEnable(url, 3000)
      //   this.isLanPing = ret.code == 1 ? true : false
      //   this.onCheckWan()
      // } else {
      //   // 如果没有url，默认设置内网ture，外网false
      //   this.isLanPing = true
      //   this.isWanPing = false
      //   this.loading.close()
      //   this.onStartCheck()
      // }
    },
    getWebUrl() {
      return new Promise((res, rej) => {
        this.$api
          .getWebUrl()
          .then(data => {
            if (data && !!data.url) return res(data.url)
            res()
          })
          .catch(() => {
            res()
          })
      })
    },
    isWanOnline() {
      return new Promise((res, rej) => {
        let img = new Image()
        img.src =
          'https://www.baidu.com/img/bd_logo1.png?time=' + new Date().getTime()
        img.onload = () => res(true)
        img.onerror = () => res(false)
      })
    },
    onCheckWan() {
      if (!this.isLanPing) {
        this.loading.close()
        this.$confirm(
          '您当前未连接到设备内网，可能影响检测结果，建议连接到设备内网后再重新检测，继续自检请点击确定'
        )
          .then(() => {
            this.isWanPing = false
            this.onStartCheck()
          })
          .catch(() => {})
      } else {
        ;(async () => {
          this.isWanPing = await this.isWanOnline()
          this.loading.close()
          this.onStartCheck()
        })()
      }
    },
    onStartCheck() {
      this.isChecking = true
      this.onShowLoading('开始自检...')
      this.$api
        .startCheck({
          isLanPing: this.isLanPing.toString(),
          isWanPing: this.isWanPing.toString()
        })
        .then(data => {
          setTimeout(() => {
            this.loading.close()
            this.getCheckResult()
            this.showProgress = true
          }, 2000)
        })
    },
    getCheckResult() {
      this.$api
        .getCheckResult()
        .then(data => {
          if (data) {
            // 如果code不为零，服务器异常
            if (data.code != 0) return this.onCheckErr(data.msg)

            let checkProcess = data.data && data.data.process
            checkProcess = parseFloat(checkProcess)
            // 当在同一个进度卡了一分钟，服务器异常
            if (this.oldProcess === checkProcess) {
              this.checkTimes++
              if (this.checkTimes > 61) return this.onCheckErr()
            } else {
              this.oldProcess = checkProcess
              this.checkTimes = 1
            }
            this.showCheckResult(data.data)
            // 进度百分百退出结果获取，重置按钮状态
            if (checkProcess == 100) {
              this.checkBtn = '重新检测'
              this.isChecking = false
            } else {
              setTimeout(() => {
                this.getCheckResult()
              }, 2000)
            }
          } else {
            this.onCheckErr()
          }
        })
        .catch(() => {
          this.onCheckErr()
        })
    },
    onCheckErr(err = '服务器异常，请重新自检') {
      this.checkTimes = 1
      this.checkBtn = '重新检测'
      this.isChecking = false
      this.showProgress = false
      this.checkItems = [
        {
          name: err,
          type: 'warning',
          state: '异常',
          qusetions: []
        }
      ]
    },
    showCheckResult(checkData) {
      if (checkData) {
        this.checkItems = Array.isArray(checkData.check_type_list)
          ? checkData.check_type_list
          : []
        let checkList = {}
        if (
          Array.isArray(checkData.check_list) &&
          checkData.check_list.length > 0
        ) {
          checkData.check_list.forEach((item, idx) => {
            if (!checkList[item.cfg_check_type]) {
              checkList[item.cfg_check_type] = []
            }
            checkList[item.cfg_check_type].push(item)
          })
        }
        this.checkItems.forEach((item, idx) => {
          item.state = this.checkState[item.ret][0]
          item.type = this.checkState[item.ret][1]
          item.qusetions = checkList[item.check_type] || []
        })
      }
    }
  }
}
</script>
<style lang="scss">
@import '~@/style/utils/_variable.scss';
.check-result-list {
  .el-alert__description {
    position: absolute;
    right: 15px;
    top: 50%;
    margin-top: 0;
    transform: translateY(-50%);
  }
  .el-alert__content {
    display: inline-block;
    vertical-align: middle;
  }
  .el-alert__icon {
    vertical-align: middle;
  }
  .el-progress-bar__inner {
    transition: 0.5s;
  }
  .ver-middle {
    line-height: 40px;
  }
  .ver-middle-item {
    vertical-align: middle;
  }
}
</style>
