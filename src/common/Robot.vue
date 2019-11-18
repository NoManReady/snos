<template>
  <div class="common-robot" :style="styl" @click="_onClickTo" @mouseenter="_onMouseEnter" @mouseleave="_onMouseLeave">
    <img ref="robot" :src="require('@/assets/eg/rob.png')" v-popover:popover alt="点击问小睿问题" :width="width" :height="height" />
    <el-popover ref="popover" placement="left" v-model="showPop" title="" :offset="14" trigger="hover" :open-delay="150" content="智能小睿哥，有问必答~">
    </el-popover>
  </div>
</template>
<script>
let timer = null;
export default {
  name: "CommonRobot",
  props: {
    url: {
      type: String,
      default:
        "http://www.sobot.com/chat/pc/index.html?sysNum=d297baf2631144148167cb1446c9317d"
    },
    width: {
      type: Number,
      default: 80
    },
    height: {
      type: Number,
      default: 63
    },
    pos: {
      type: String,
      validator(v) {
        return ["tl", "tr", "bl", "br"].indexOf(v) > -1;
      },
      default: "br"
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
      default: 10
    }
  },
  data() {
    return {
      showPop: false,
      isActive: false
    };
  },
  computed: {
    styl() {
      let _styl = {};
      // _styl.width = _styl.height = `${this.width}px`
      let _diff = this.isActive ? this.spacing : -(this.width / 2);
      if (!this.isActive) {
        _styl.opacity = 0.7;
      }
      if (this.pos === "tl") {
        _styl.left = `${_diff}px`;
        _styl.top = `${this.topD + this.spacing}px`;
      }
      if (this.pos === "tr") {
        _styl.right = `${_diff}px`;
        _styl.top = `${this.topD + this.spacing}px`;
      }
      if (this.pos === "bl") {
        _styl.left = `${_diff}px`;
        _styl.bottom = `${this.bottomD + this.spacing}px`;
      }
      if (this.pos === "br") {
        _styl.right = `${_diff}px`;
        _styl.bottom = `${this.bottomD + this.spacing}px`;
      }
      return _styl;
    }
  },
  mounted() {
    this.showPop = true;
    this.isActive = true;
    timer = setTimeout(() => {
      this.isActive = false;
      this.showPop = false;
    }, 10000);
  },
  methods: {
    _onMouseEnter() {
      timer && clearTimeout(timer);
      this.isActive = true;
    },
    _onMouseLeave() {
      timer = setTimeout(() => {
        this.isActive = false;
        this.$refs.robot.blur();
      }, 800);
    },
    _onClickTo() {
      if (this.url) {
        window.open(this.url, "_blank");
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.common-robot {
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