<template>
  <span>
    <span @click="visible = true" class="c-success fr" v-if="isMobile">从旧路由器获取</span>
    <p class="steps-wrap c-info" v-else>
      <i :class="learnOk ? 'el-icon-success c-success': 'el-icon-info'"></i>
      <label>
        {{learnOk ? $t('network.wan.get_account_tip') : $t('network.wan.get_account_tip2')}}
        <a
          @click="visible = true"
          class="c-success pointer"
        >{{ $t('network.wan.get_account_tip3')}}</a>
      </label>
    </p>
    <steps :remoteIp="remoteIp" @result="onResult" v-model="visible"></steps>
  </span>
</template>
<script>
import Steps from '#/components/Steps'
export default {
  name: 'MenuoutPppoeLearn',
  props: {
    value: {
      type: String,
      default: ''
    },
    remoteIp: {
      type: String | Boolean,
      default: false
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      learnOk: false,
      visible: false
    }
  },
  components: {
    Steps
  },
  watch: {
    value(v) {
      if (v === '') {
        this.learnOk = false
      }
    }
  },
  methods: {
    onResult(res) {
      this.learnOk = true
      this.$emit('result', res)
    }
  }
}
</script>
<style lang="scss" scoped>
.steps-wrap {
  margin: 10px auto 15px;
  text-align: center;
}
</style>
