<template>
  <div class="wechat tc">
    <div class="title mb15">
      <div v-if="baseModel.unset">
        <i class="el-icon-success fs22 c-success-green vm"></i>
        <strong class="fs16 vm">完成，Wi-Fi未变更，</strong>
        <a @click="$emit('toHomepage')" class="c-success pointer vm fs16">去首页看看</a>
      </div>
      <div v-else-if="loadingMsg">
        <i class="el-icon-loading fs22 c-success vm"></i>
        <strong class="fs16 vm">{{loadingMsg}}</strong>
      </div>
      <div v-else>
        <i class="el-icon-success fs22 c-success-green vm"></i>
        <strong class="fs16 vm">
          配置成功，
          <span class="c-warning">请连接以下Wi-Fi：</span>
        </strong>
      </div>
      <!-- <strong class="c-warning tl">请连接以下Wi-Fi：</strong> -->
    </div>
    <div class="block m-box">
      <ul class="content tl">
        <li>
          <label class="c-info" v-if="baseModel.isSameSsid">Wi-Fi名称：</label>
          <label class="c-info" v-else>Wi-Fi名称(2.4G)：</label>
          <strong>{{baseModel.masterSsid.ssidName}}</strong>
        </li>
        <li v-if="!baseModel.isSameSsid && baseModel.ssidName5G">
          <label class="c-info">Wi-Fi名称(5G)：</label>
          <strong>{{baseModel.ssidName5G}}</strong>
        </li>
        <li>
          <label class="c-info">Wi-Fi密码：</label>
          <strong v-if="baseModel.masterSsid.password">
            <span class="fs14" v-show="showPass">{{baseModel.masterSsid.password}}</span>
            <span class="fs16 vm" v-show="!showPass">{{'*'.repeat(baseModel.masterSsid.password.length)}}</span>
            <i
              :class="{'rjucd-visible': showPass, 'rjucd-unvisible': !showPass}"
              @click="showPass = !showPass"
              class="c-success pointer vm"
            ></i>
          </strong>
          <span v-else>未加密</span>
        </li>
        <li v-if="false">
          <label>管理密码：</label>
          <span>{{baseModel.ewebPassword || '-'}}</span>
        </li>
      </ul>
    </div>
    <div class="p-split">
      <p>微信查看上网报告，小孩上网防沉迷</p>
      <p>扫码绑定小程序</p>
    </div>
    <div>
      <img :src="require('@/assets/eg/mobile.png')" class="img" />
    </div>
    <div class="mt10 c-info tc">打开微信扫描设备上的二维码</div>
  </div>
</template>
<script>
import { sleep } from '@/utils'
const TIME = 20 // 生效时间提示
export default {
  name: 'Wechat',
  props: {
    baseModel: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      loadingMsg: false,
      showPass: false
    }
  },
  async created() {
    if (!this.baseModel.unset) {
      let _timeout = TIME
      do {
        this.loadingMsg = `${_timeout}s 配置下发生效中，请稍候...`
        await sleep(1000)
      } while (--_timeout > 0)
      this.loadingMsg = false
    }
  }
}
</script>
<style lang="scss">
@import '~@/style/utils/_variable.scss';
.wechat {
  .content {
    li {
      line-height: 2;
      list-style-type: none;
      label {
        float: left;
        width: 40%;
        min-width: 135px;
        text-align: right;
      }
      strong {
        display: inline-block;
        width: 55%;
        text-align: left;
        word-break: break-word;
        line-height: 28px;
      }
    }
  }
  .p-split {
    p {
      font-size: 16px;
      font-weight: bolder;
      line-height: 1.8;
    }
    margin: 15px;
    padding: 0 0 12px;
    // border-bottom: solid 1px $border-light-color;
  }
  .img {
    width: 90%;
  }
}
</style>
