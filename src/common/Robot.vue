<template>
  <div :style="styl" @click="_onClickTo" @mouseenter="_onMouseEnter" @mouseleave="_onMouseLeave" class="common-robot">
    <img :alt="$t('comp.help_tip')" :src="icon" :style="imgStyl" ref="robot" v-popover:popover />
    <el-popover
      :content="$t('comp.help_tip1')"
      :offset="14"
      :open-delay="150"
      placement="left"
      ref="popover"
      title
      trigger="hover"
      v-model="showPop"
    ></el-popover>
  </div>
</template>
<script>
let timer = null
import { mapGetters } from 'vuex'
export default {
  name: 'CommonRobot',
  props: {
    pos: {
      type: String,
      validator(v) {
        return ['tl', 'tr', 'bl', 'br'].indexOf(v) > -1
      },
      default: 'br'
    },
    topD: {
      type: Number,
      default: 46
    },
    bottomD: {
      type: Number,
      default: 46
    },
    spacing: {
      type: Number,
      default: 8
    }
  },
  data() {
    return {
      showPop: false,
      isActive: false
    }
  },
  computed: {
    ...mapGetters(['lang']),
    url() {
      return this.lang === 'en'
        ? 'http://www.ruijienetworks.com/rita'
        : 'https://ocs.ruijie.com.cn/?p=smb'
    },
    icon() {
      return this.lang === 'en'
        ? require('@/assets/eg/rob_en.png')
        : require('@/assets/eg/rob.png')
    },
    imgStyl() {
      return this.lang === 'en'
        ? {
            transform: 'scale(1.5)'
          }
        : { 'margin-right': '-20px' }
    },
    styl() {
      let _styl = {}
      let _diff = this.isActive ? this.spacing : -(this.lang === 'en' ? 10 : 25)
      if (!this.isActive) {
        _styl.opacity = 0.7
      }
      if (this.pos === 'tl') {
        _styl.left = `${_diff}px`
        _styl.top = `${this.topD + this.spacing}px`
      }
      if (this.pos === 'tr') {
        _styl.right = `${_diff}px`
        _styl.top = `${this.topD + this.spacing}px`
      }
      if (this.pos === 'bl') {
        _styl.left = `${_diff}px`
        _styl.bottom = `${this.bottomD + this.spacing}px`
      }
      if (this.pos === 'br') {
        _styl.right = `${_diff}px`
        _styl.bottom = `${this.bottomD + this.spacing}px`
      }
      return _styl
    }
  },
  mounted() {
    this.isActive = true
    setTimeout(() => {
      this.showPop = true
    }, 300)
    timer = setTimeout(() => {
      this.isActive = false
      this.showPop = false
    }, 10000)
  },
  methods: {
    _onMouseEnter() {
      timer && clearTimeout(timer)
      this.isActive = true
    },
    _onMouseLeave() {
      timer = setTimeout(() => {
        this.isActive = false
        this.$refs.robot.blur()
      }, 800)
    },
    _onClickTo() {
      if (this.url) {
        window.open(this.url, '_blank')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.common-robot {
  cursor: pointer;
  position: fixed;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: all 0.2s ease-in-out;
  outline: none;
  img,
  img:foucs {
    outline: none;
  }
}
.common-robot:focus {
  outline: none;
}
</style>
