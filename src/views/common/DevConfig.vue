<template>
  <div class="dev-config">
    <el-drawer :visible.sync="visible" @closed="$emit('closed')" custom-class="custom-drawer" size="75%">
      <iframe :src="srcUrl" class="iframe"></iframe>
    </el-drawer>
  </div>
</template>
<script>
import { Drawer } from 'element-ui'
import { getIframeUrl } from '@/utils/iframeUtils'
import md5 from 'md5'
export default {
  name: 'DevConfig',
  props: {
    // 远程跳转的设备IP地址
    ip: {
      type: String,
      required: true
    },
    // 远程跳转的设备SN号
    sn: {
      type: String,
      required: true
    },
    // 初始化页面路由
    initpath: {
      default: 'admin/alone',
      type: String
    },
    // 菜单显示方式 水平/竖直/不显示菜单
    menuMode: {
      default: 'none',
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        return ['horizontal', 'vertical', 'none'].indexOf(value) !== -1
      }
    },
    hideHead: {
      default: 'true',
      type: String
    }
  },
  data() {
    return {
      visible: true,
      srcUrl: ''
    }
  },
  components: {
    [Drawer.name]: Drawer
  },
  created() {
    this.srcUrl = getIframeUrl({
      ip: this.ip,
      sn: this.sn,
      initpath: this.initpath,
      menuMode: this.menuMode,
      hideHead: this.hideHead
    })
  }
}
</script>
<style lang="scss">
.custom-drawer {
  min-width: 768px;
  font-size: 0;

  .iframe {
    position: absolute; // 解决低版本谷歌高度撑不开问题
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  #el-drawer__title {
    display: none;
  }
}
</style>

