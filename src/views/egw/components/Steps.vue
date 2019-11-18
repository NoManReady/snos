<template>
  <el-dialog class="common-steps" title="" :before-close="_onBeforeClose" :close-on-click-modal="false" :close-on-press-escape="false" :visible.sync="visible" width="600px">
    <el-carousel ref="carousel"  @change='_onChange' indicator-position='none'  arrow='always' :autoplay='false' >
      <el-carousel-item v-for="(item, i) in steps" :key="item.src">
        <div class="tc">
          <img :src='item.src' :class='[{"mb15": i!=steps.length-2}, "step-img"]' :alt="item.text" width="500" height="200"/>
          <p class="c-info"><i v-show="i==steps.length-1" class="el-icon-loading fs18 c-success" ></i>{{item.text}}</p>
          <el-button class="w200 mt20" v-show="i==steps.length-2" type="primary" @click.native="_onStart">{{btnText}}</el-button>
        </div>
      </el-carousel-item>
    </el-carousel>
  </el-dialog>
</template>
<script>
import { Carousel, CarouselItem } from 'element-ui'
import bus from '@/utils/bus'
export default {
  name: 'CommonSteps',
  props: {
    activeItem: {
      type: Number,
      default: 0
    }
  },
  data() {
    const STEPS = [
      {
        src: require('@/assets/eg/step_1.png'),
        text: '1、将旧路由器连接电源'
      },
      {
        src: require('@/assets/eg/step_2.png'),
        text: '2、将网线一头插入旧路由器WAN口'
      },
      {
        src: require('@/assets/eg/step_3.png'),
        text: '3、将网线另一头插入EG的LAN口'
      },
      {
        src: require('@/assets/eg/step_4.png'),
        text: '正在获取，请稍后...'
      }
    ]
    return {
      visible: false,
      steps: STEPS,
      btnText: '开始获取',
      running: false
    }
  },
  components: {
    [Carousel.name]: Carousel,
    [CarouselItem.name]: CarouselItem
  },
  watch: {
    visible(v) {
      // 关闭时切回到第一步
      if (!v) {
        this.setActiveItem(1)
        this.btnText = '开始获取'
        bus.$off('pppoe-learn-callback')
      }
    }
  },
  methods: {
    _onChange(step) {
      switch (step) {
        case 0:
          this._setArrowDisplay('el-carousel__arrow--left', 'none')
          this._setArrowDisplay('el-carousel__arrow--right', 'inherit')
          break
        case 1:
          this._setArrowDisplay('el-carousel__arrow--left', 'inherit')
          this._setArrowDisplay('el-carousel__arrow--right', 'inherit')
          break
        case 2:
          this._setArrowDisplay('el-carousel__arrow--left', 'inherit')
          this._setArrowDisplay('el-carousel__arrow--right', 'none')
          break
        case 3:
          this._setArrowDisplay('el-carousel__arrow--left', 'none')
          this._setArrowDisplay('el-carousel__arrow--right', 'none')
          break
        default:
          this._setArrowDisplay('el-carousel__arrow--left', 'inherit')
          this._setArrowDisplay('el-carousel__arrow--right', 'inherit')
          break
      }
    },
    _setArrowDisplay(cname, val) {
      let _doms = document.getElementsByClassName(cname)
      _doms && _doms[0] && (_doms[0].style.display = val)
    },
    _onStart() {
      this._confirmStart(async () => {
        this.setActiveItem(4)
        let _res = await this.$api.cmd(
          'devSta.get',
          { module: 'pppoe_learn' },
          { isSilence: true, timeout: 0 }
        )
        if (this.visible) {
          this._dealRes(_res)
        }
      })
    },
    _onBeforeClose(done) {
      if (this.running) {
        this.$message({
          duration: 6000,
          message: '设备正在获取宽带账号密码，请等待结果返回...'
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
        '您已根据提示连接好设备，否则获取账号将超时或异常。',
        '请确认',
        {
          confirmButtonText: '已连接，开始获取',
          cancelButtonText: '我再检查下',
          type: 'warning'
        }
      )
        .then(cb)
        .catch()
    },
    setActiveItem(i) {
      this.running = i === 4
      if (this.$refs.carousel.setActiveItem) {
        this.$refs.carousel.setActiveItem(i - 1)
      }
    },
    _dealRes(res) {
      if (res.state === 'finish') {
        this.$message({
          type: 'success',
          duration: 6000,
          message: '已获取到账号密码并填充到页面'
        })
        this.learnOk(res)
      } else {
        this.btnText = '重新获取'
        this.setActiveItem(3)
        this.$message({
          type: 'error',
          duration: 6000,
          message: `获取账号密码失败：${res.error}，请检查线路连接。`
        })
      }
    },
    learnOk(res) {
      bus.$emit('pppoe-learn-callback', res)
      this.visible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.common-steps {
  .step-img {
    display: block;
    margin: 0 auto;
  }
}
</style>